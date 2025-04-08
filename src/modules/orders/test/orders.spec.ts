import { Test, TestingModule } from '@nestjs/testing';
import { OrdersService } from '../application/orders.service';
import { LimitOrdersStrategy } from '../application/strategies/limitOrders.strategy';
import { MarketOrdersStrategy } from '../application/strategies/marketOrders.strategy';
import { OrdersRepository } from '../infrastructure/orders.repository';
import { IOrder, Order } from '../domain/orders.model';
import { OrderStatus, OrderType } from '../domain/orders.constants';
import { OrderSide } from '../domain/orders.constants';
import { MARKET_ACCESS_PORT, MarketAccessPort } from 'src/ports/market.port';
import { Cache } from 'cache-manager';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import {
  IOrderMessageBrokerPort,
  ORDERS_MESSAGE_BROKER,
} from 'src/ports/orders.port';

describe('Orders - Application', () => {
  let module: TestingModule;
  let ordersService: OrdersService;
  let ordersRepositoryMock: jest.Mocked<Partial<OrdersRepository>>;
  let marketPortMock: jest.Mocked<Partial<MarketAccessPort>>;
  let cacheManagerMock: jest.Mocked<Partial<Cache>>;
  let messageBrokerMock: jest.Mocked<Partial<IOrderMessageBrokerPort>>;
  let savedOrders: Order[];
  let initialOrdersCount: number;
  const mockedIntrument = {
    id: 1,
    ticker: 'DYCA',
    name: 'Dycasa S.A.',
    type: 'ACCIONES',
  };
  const mockedCash = {
    id: 66,
    ticker: 'ARS',
    name: 'PESOS',
    type: 'MONEDA',
  };

  const mockedMarketData = {
    id: 1,
    instrumentid: mockedIntrument.id,
    high: 268.0,
    low: 255.0,
    open: 268.0,
    close: 260.0,
    previousclose: 264.0,
    date: new Date(),
  };

  beforeEach(async () => {
    savedOrders = [
      Order.from({
        id: 1,
        instrumentid: mockedIntrument.id,
        userid: 1,
        size: 100,
        price: 100,
        type: OrderType.LIMIT,
        side: OrderSide.BUY,
        status: OrderStatus.NEW,
        datetime: new Date(),
      }),
    ];
    initialOrdersCount = savedOrders.length;
    ordersRepositoryMock = {
      create: jest.fn().mockImplementation((order: Order) => {
        const savedOrder = Order.from(order);
        savedOrders.push(savedOrder);
        return Promise.resolve(savedOrder);
      }),
      getUserOrders: jest.fn().mockImplementation((userid: number) => {
        const ordersByUser = {
          1: [
            {
              userid,
              instrumentid: mockedCash.id,
              size: 100000000,
              price: 1,
              type: OrderType.MARKET,
              side: OrderSide.CASH_IN,
              status: OrderStatus.FILLED,
              datetime: new Date(),
            },
          ],
          2: [
            {
              userid,
              instrumentid: mockedCash.id,
              size: 10000,
              price: 1,
              type: OrderType.MARKET,
              side: OrderSide.CASH_IN,
              status: OrderStatus.FILLED,
              datetime: new Date(),
            },
          ],
        };

        // eslint-disable-next-line @typescript-eslint/no-unsafe-return
        return ordersByUser[userid] || [];
      }),
      getById: jest.fn().mockImplementation((id: number) => {
        return Promise.resolve(savedOrders.find((order) => order.id === id));
      }),
      updateById: jest.fn().mockImplementation((id: number, update: IOrder) => {
        const order = savedOrders.find((order) => order.id === id);
        if (!order) return Promise.resolve(undefined);
        return Promise.resolve({ ...order, id, ...update });
      }),
    };

    marketPortMock = {
      getInstrumentByTicker: jest.fn().mockImplementation((ticker: string) => {
        if (ticker === mockedCash.ticker) {
          return Promise.resolve(mockedCash);
        }
        return Promise.resolve(mockedIntrument);
      }),
      getLatestMarketPrice: jest.fn().mockResolvedValue(mockedMarketData.close),
    };

    cacheManagerMock = {
      set: jest.fn(),
      get: jest.fn(),
      del: jest.fn(),
    };

    messageBrokerMock = {
      orderCreated: jest.fn(),
      orderStatusUpdated: jest.fn(),
    };

    module = await Test.createTestingModule({
      imports: [],
      providers: [
        OrdersService,
        {
          provide: OrdersRepository,
          useValue: ordersRepositoryMock,
        },
        {
          provide: MARKET_ACCESS_PORT,
          useValue: marketPortMock,
        },
        {
          provide: CACHE_MANAGER,
          useValue: cacheManagerMock,
        },
        {
          provide: ORDERS_MESSAGE_BROKER,
          useValue: messageBrokerMock,
        },
        LimitOrdersStrategy,
        MarketOrdersStrategy,
      ],
    }).compile();

    await module.init();
    ordersService = module.get<OrdersService>(OrdersService);
  });

  afterEach(async () => await module.close());

  describe('Orders Service', () => {
    describe('Limit Orders', () => {
      it('should create a limit order', async () => {
        const newOrder = {
          userid: 1,
          instrumentTicker: mockedIntrument.ticker,
          size: 10,
          price: 100,
          side: OrderSide.BUY,
          type: OrderType.LIMIT,
        };

        await ordersService.createOrder(newOrder);
        expect(ordersRepositoryMock.create).toHaveBeenCalled();
        expect(savedOrders.length).toBe(initialOrdersCount + 1);

        const savedOrder = savedOrders[initialOrdersCount];
        expect(savedOrder.type).toBe(OrderType.LIMIT);
      });

      it('created limit order should have status NEW', async () => {
        const newOrder = {
          userid: 1,
          instrumentTicker: mockedIntrument.ticker,
          size: 10,
          price: 100,
          side: OrderSide.BUY,
          type: OrderType.LIMIT,
        };

        await ordersService.createOrder(newOrder);
        expect(savedOrders.length).toBe(initialOrdersCount + 1);

        const savedOrder = savedOrders[initialOrdersCount];
        expect(savedOrder.status).toBe(OrderStatus.NEW);
      });

      it('should map ticker to instrumentid', async () => {
        const newOrder = {
          userid: 1,
          instrumentTicker: mockedIntrument.ticker,
          size: 10,
          price: 100,
          side: OrderSide.BUY,
          type: OrderType.LIMIT,
        };

        await ordersService.createOrder(newOrder);
        expect(savedOrders.length).toBe(initialOrdersCount + 1);
        expect(marketPortMock.getInstrumentByTicker).toHaveBeenCalledWith(
          mockedIntrument.ticker,
        );
        const savedOrder = savedOrders[initialOrdersCount];
        expect(savedOrder.instrumentid).toBe(mockedIntrument.id);
      });

      it('should NOT create transfer order (cash in / out)', async () => {
        const newOrder = {
          userid: 1,
          instrumentTicker: mockedCash.ticker,
          size: 10,
          price: 100,
          side: OrderSide.CASH_IN,
          type: OrderType.LIMIT,
        };

        await expect(ordersService.createOrder(newOrder)).rejects.toThrow();

        expect(savedOrders.length).toBe(initialOrdersCount);
      });

      it('should set size if amount is defined', async () => {
        const newOrder = {
          userid: 1,
          instrumentTicker: mockedIntrument.ticker,
          side: OrderSide.BUY,
          type: OrderType.LIMIT,
          price: 100,
          amount: 120,
        };

        const order = await ordersService.createOrder(newOrder);
        expect(order.size).toBe(1);
      });

      it('should reject order if user does not have enough fiat balance', async () => {
        const newOrder = {
          userid: 2,
          instrumentTicker: mockedIntrument.ticker,
          side: OrderSide.BUY,
          type: OrderType.LIMIT,
          price: 100,
          size: 1000,
        };

        const order = await ordersService.createOrder(newOrder);
        expect(order.status).toBe(OrderStatus.REJECTED);
      });

      it('should reject order if user does not have enough asset balance', async () => {
        const newOrder = {
          userid: 2,
          instrumentTicker: mockedIntrument.ticker,
          side: OrderSide.SELL,
          type: OrderType.LIMIT,
          price: 100,
          size: 1000,
        };

        const order = await ordersService.createOrder(newOrder);
        expect(order.status).toBe(OrderStatus.REJECTED);
      });

      it('should send message ORDER_CREATED', async () => {
        const newOrder = {
          userid: 1,
          instrumentTicker: mockedIntrument.ticker,
          size: 10,
          price: 100,
          side: OrderSide.BUY,
          type: OrderType.LIMIT,
        };

        await ordersService.createOrder(newOrder);
        expect(messageBrokerMock.orderCreated).toHaveBeenCalled();
      });
    });

    describe('Market Orders', () => {
      it('should create a market order', async () => {
        const newOrder = {
          userid: 1,
          instrumentTicker: mockedIntrument.ticker,
          size: 10,
          price: 100,
          side: OrderSide.BUY,
          type: OrderType.MARKET,
        };

        await ordersService.createOrder(newOrder);
        expect(ordersRepositoryMock.create).toHaveBeenCalled();
        expect(savedOrders.length).toBe(initialOrdersCount + 1);

        const savedOrder = savedOrders[initialOrdersCount];
        expect(savedOrder.type).toBe(OrderType.MARKET);
      });

      it('should have status FILLED', async () => {
        const newOrder = {
          userid: 1,
          instrumentTicker: mockedIntrument.ticker,
          size: 10,
          price: 100,
          side: OrderSide.BUY,
          type: OrderType.MARKET,
        };

        await ordersService.createOrder(newOrder);
        expect(savedOrders.length).toBe(initialOrdersCount + 1);

        const savedOrder = savedOrders[initialOrdersCount];
        expect(savedOrder.status).toBe(OrderStatus.FILLED);
      });

      it('should map ticker to instrumentid', async () => {
        const newOrder = {
          userid: 1,
          instrumentTicker: mockedIntrument.ticker,
          size: 10,
          price: 100,
          side: OrderSide.BUY,
          type: OrderType.MARKET,
        };

        await ordersService.createOrder(newOrder);
        expect(savedOrders.length).toBe(initialOrdersCount + 1);
        expect(marketPortMock.getInstrumentByTicker).toHaveBeenCalledWith(
          mockedIntrument.ticker,
        );
        const savedOrder = savedOrders[initialOrdersCount];
        expect(savedOrder.instrumentid).toBe(mockedIntrument.id);
      });

      it('should create transfer order (cash in / out)', async () => {
        const newOrder = {
          userid: 1,
          instrumentTicker: mockedCash.ticker,
          size: 10,
          price: 100,
          side: OrderSide.CASH_IN,
          type: OrderType.MARKET,
        };

        await ordersService.createOrder(newOrder);
        expect(ordersRepositoryMock.create).toHaveBeenCalled();
        expect(savedOrders.length).toBe(initialOrdersCount + 1);

        const savedOrder = savedOrders[initialOrdersCount];
        expect(savedOrder.instrumentid).toBe(mockedCash.id);
        expect(savedOrder.status).toBe(OrderStatus.FILLED);
        expect(savedOrder.side).toBe(OrderSide.CASH_IN);
      });

      it('should have price as latest market price', async () => {
        const newOrder = {
          userid: 1,
          instrumentTicker: mockedIntrument.ticker,
          size: 100, // Buy 100 DYCA at market price
          price: 100, // should be ignored and latest market price should be used
          side: OrderSide.SELL,
          type: OrderType.MARKET,
        };

        await ordersService.createOrder(newOrder);
        expect(ordersRepositoryMock.create).toHaveBeenCalled();
        expect(savedOrders.length).toBe(initialOrdersCount + 1);

        const savedOrder = savedOrders[initialOrdersCount];
        expect(savedOrder.price).toBe(mockedMarketData.close);
      });

      it('should create with size', async () => {
        const newOrder = {
          userid: 1,
          instrumentTicker: mockedIntrument.ticker,
          size: 100, // Buy 100 DYCA at market price
          price: 100, // should be ignored and latest market price should be used
          side: OrderSide.BUY,
          type: OrderType.MARKET,
        };

        await ordersService.createOrder(newOrder);
        expect(ordersRepositoryMock.create).toHaveBeenCalled();
        expect(savedOrders.length).toBe(initialOrdersCount + 1);

        const savedOrder = savedOrders[initialOrdersCount];
        expect(savedOrder.size).toBe(newOrder.size);
      });

      it('should define size based on amount', async () => {
        const newOrder = {
          userid: 1,
          instrumentTicker: mockedIntrument.ticker,
          amount: 300, // "Use 300 ARS to buy DYCA at market price"
          price: 100, // should be ignored and latest market price should be used
          side: OrderSide.BUY,
          type: OrderType.MARKET,
        };

        await ordersService.createOrder(newOrder);
        expect(ordersRepositoryMock.create).toHaveBeenCalled();
        expect(savedOrders.length).toBe(initialOrdersCount + 1);

        const savedOrder = savedOrders[initialOrdersCount];
        expect(savedOrder.size).toBe(
          Math.floor(newOrder.amount / mockedMarketData.close),
        );
      });

      it('should prioritize size over amount', async () => {
        const newOrder = {
          userid: 1,
          instrumentTicker: mockedIntrument.ticker,
          size: 100, // Buy 100 DYCA at market price
          amount: 300, // "Use 300 ARS to buy DYCA at market price"
          side: OrderSide.BUY,
          type: OrderType.MARKET,
        };

        await ordersService.createOrder(newOrder);
        expect(ordersRepositoryMock.create).toHaveBeenCalled();
        expect(savedOrders.length).toBe(initialOrdersCount + 1);

        const savedOrder = savedOrders[initialOrdersCount];
        expect(savedOrder.price).toBe(mockedMarketData.close);
        expect(savedOrder.size).toBe(newOrder.size);
      });

      it('should set price 1 for cash in / out orders', async () => {
        const newOrder = {
          userid: 1,
          instrumentTicker: mockedCash.ticker,
          size: 1000000, // Transfers 1000000 ARS
          amount: 300, // Should be ignored
          side: OrderSide.CASH_IN,
          type: OrderType.MARKET,
        };

        await ordersService.createOrder(newOrder);
        expect(ordersRepositoryMock.create).toHaveBeenCalled();
        expect(savedOrders.length).toBe(initialOrdersCount + 1);

        const savedOrder = savedOrders[initialOrdersCount];
        expect(savedOrder.price).toBe(1);
        expect(savedOrder.size).toBe(newOrder.size);
      });

      it('should reject order if user does not have enough fiat balance', async () => {
        const newOrder = {
          userid: 2,
          instrumentTicker: mockedIntrument.ticker,
          side: OrderSide.BUY,
          type: OrderType.MARKET,
          price: 100,
          size: 1000,
        };

        const order = await ordersService.createOrder(newOrder);
        expect(order.status).toBe(OrderStatus.REJECTED);
      });

      it('should reject order if user does not have enough asset balance', async () => {
        const newOrder = {
          userid: 2,
          instrumentTicker: mockedIntrument.ticker,
          side: OrderSide.SELL,
          type: OrderType.MARKET,
          price: 100,
          size: 1000,
        };

        const order = await ordersService.createOrder(newOrder);
        expect(order.status).toBe(OrderStatus.REJECTED);
      });

      it('should send message ORDER_CREATED', async () => {
        const newOrder = {
          userid: 1,
          instrumentTicker: mockedIntrument.ticker,
          size: 10,
          price: 100,
          side: OrderSide.BUY,
          type: OrderType.MARKET,
        };

        await ordersService.createOrder(newOrder);
        expect(messageBrokerMock.orderCreated).toHaveBeenCalled();
      });
    });

    describe('Cancel Orders', () => {
      it('should cancel order', async () => {
        const order = await ordersService.cancelOrder(1);
        expect(ordersRepositoryMock.updateById).toHaveBeenCalled();
        expect(order.status).toBe(OrderStatus.CANCELLED);
      });

      it('should send message ORDER_STATUS_UPDATED', async () => {
        await ordersService.cancelOrder(1);
        expect(messageBrokerMock.orderStatusUpdated).toHaveBeenCalled();
      });
    });

    describe('Cache balance', () => {
      it('should cache user balances', async () => {
        const portfolioOne =
          await ordersService.calculateAssetPortfolioForUser(1);
        const portfolioCached =
          await ordersService.calculateAssetPortfolioForUser(1);
        expect(cacheManagerMock.set).toHaveBeenCalled();
        expect(cacheManagerMock.get).toHaveBeenCalled();
        expect(portfolioOne).toStrictEqual(portfolioCached);
      });
    });
  });
});
