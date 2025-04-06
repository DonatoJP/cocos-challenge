import { Test, TestingModule } from '@nestjs/testing';
import { OrdersService } from '../application/orders.service';
import { LimitOrdersStrategy } from '../application/strategies/limitOrders.strategy';
import { MarketOrdersStrategy } from '../application/strategies/marketOrders.strategy';
import { OrdersRepository } from '../infrastructure/orders.repository';
import { Order } from '../domain/orders.model';
import { OrderStatus, OrderType } from '../domain/orders.constants';
import { OrderSide } from '../domain/orders.constants';
import { MARKET_ACCESS_PORT, MarketAccessPort } from 'src/ports/market.port';

describe('Orders - Application', () => {
  let module: TestingModule;
  let ordersService: OrdersService;
  let ordersRepositoryMock: jest.Mocked<Partial<OrdersRepository>>;
  let marketPortMock: jest.Mocked<Partial<MarketAccessPort>>;
  let savedOrders: Order[];
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

  beforeEach(async () => {
    savedOrders = [];
    ordersRepositoryMock = {
      create: jest.fn().mockImplementation((order: Order) => {
        const savedOrder = Order.from(order);
        savedOrders.push(savedOrder);
        return Promise.resolve(savedOrder);
      }),
    };

    marketPortMock = {
      getInstrumentByTicker: jest.fn().mockImplementation((ticker: string) => {
        if (ticker === mockedCash.ticker) {
          return Promise.resolve(mockedCash);
        }
        return Promise.resolve(mockedIntrument);
      }),
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
        expect(savedOrders.length).toBe(1);

        const savedOrder = savedOrders[0];
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
        expect(savedOrders.length).toBe(1);

        const savedOrder = savedOrders[0];
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
        expect(savedOrders.length).toBe(1);
        expect(marketPortMock.getInstrumentByTicker).toHaveBeenCalledWith(
          mockedIntrument.ticker,
        );
        const savedOrder = savedOrders[0];
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

        expect(savedOrders.length).toBe(0);
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
        expect(savedOrders.length).toBe(1);

        const savedOrder = savedOrders[0];
        expect(savedOrder.type).toBe(OrderType.MARKET);
      });

      it('created market order should have status FILLED', async () => {
        const newOrder = {
          userid: 1,
          instrumentTicker: mockedIntrument.ticker,
          size: 10,
          price: 100,
          side: OrderSide.BUY,
          type: OrderType.MARKET,
        };

        await ordersService.createOrder(newOrder);
        expect(savedOrders.length).toBe(1);

        const savedOrder = savedOrders[0];
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
        expect(savedOrders.length).toBe(1);
        expect(marketPortMock.getInstrumentByTicker).toHaveBeenCalledWith(
          mockedIntrument.ticker,
        );
        const savedOrder = savedOrders[0];
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
        expect(savedOrders.length).toBe(1);

        const savedOrder = savedOrders[0];
        expect(savedOrder.instrumentid).toBe(mockedCash.id);
        expect(savedOrder.status).toBe(OrderStatus.FILLED);
        expect(savedOrder.side).toBe(OrderSide.CASH_IN);
      });
    });
  });
});
