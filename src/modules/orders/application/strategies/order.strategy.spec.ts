import { Test } from '@nestjs/testing';
import { MarketOrdersStrategy } from './marketOrders.strategy';
import { LimitOrdersStrategy } from './limitOrders.strategy';
import { OrderType } from '../../domain/orders.constants';
import { OrdersService } from '../orders.service';

describe('Order Strategies', () => {
  let ordersService: OrdersService;
  let marketStrategy: MarketOrdersStrategy;
  let limitStrategy: LimitOrdersStrategy;

  beforeEach(async () => {
    const mockOrderService = {
      registerStrategy: jest.fn(),
      ordersStrategies: new Map(),
    };

    const moduleRef = await Test.createTestingModule({
      imports: [],
      providers: [
        {
          provide: OrdersService,
          useValue: mockOrderService,
        },
        MarketOrdersStrategy,
        LimitOrdersStrategy,
      ],
    }).compile();

    ordersService = moduleRef.get<OrdersService>(OrdersService);
    marketStrategy = moduleRef.get<MarketOrdersStrategy>(MarketOrdersStrategy);
    limitStrategy = moduleRef.get<LimitOrdersStrategy>(LimitOrdersStrategy);
  });

  describe('MarketOrdersStrategy', () => {
    it('should be defined', () => {
      expect(marketStrategy).toBeDefined();
    });

    it('should register itself in OrdersService', () => {
      marketStrategy.onModuleInit();
      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(ordersService.registerStrategy).toHaveBeenCalledWith(
        OrderType.MARKET,
        marketStrategy,
      );
    });

    // it('should create a market order', async () => {
    //   const orderData: Partial<Order> = {
    //     type: OrderType.MARKET,
    //     quantity: 100,
    //     price: 10,
    //   };

    //   const result = await marketStrategy.createOrder(orderData);
    //   expect(result).toEqual(orderData);
    // });
  });

  describe('LimitOrdersStrategy', () => {
    it('should register itself with OrdersService on init', () => {
      limitStrategy.onModuleInit();
      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(ordersService.registerStrategy).toHaveBeenCalledWith(
        OrderType.LIMIT,
        limitStrategy,
      );
    });

    // it('should create a limit order', async () => {
    //   const orderData: Partial<Order> = {
    //     type: OrderType.LIMIT,
    //     quantity: 100,
    //     price: 10,
    //   };

    //   const result = await limitStrategy.createOrder(orderData);
    //   expect(result).toEqual(orderData);
    // });
  });
});
