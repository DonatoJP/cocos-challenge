import './mockDatabase.helper';
import { Test } from '@nestjs/testing';
import * as request from 'supertest';
import { INestApplication } from '@nestjs/common';
import { App } from 'supertest/types';
import { Order } from '../domain/orders.model';
import { FindManyOptions, FindOneOptions, Repository } from 'typeorm';
import { OrdersModule } from '../orders.module';
import { getRepositoryToken } from '@nestjs/typeorm';
import { OrderSide, OrderStatus, OrderType } from '../domain/orders.constants';
import { Instrument } from 'src/modules/market/domain/instruments.model';
import { MarketData } from 'src/modules/market/domain/marketData.model';
import { CACHE_MANAGER, Cache, CacheModule } from '@nestjs/cache-manager';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { RouterModule } from '@nestjs/core';

describe('OrdersModule E2E Testing', () => {
  let app: INestApplication<App>;
  let orderRepositoryMock: jest.Mocked<Partial<Repository<Order>>>;
  let instrumentRepositoryMock: jest.Mocked<Partial<Repository<Instrument>>>;
  let marketRepositoryMock: jest.Mocked<Partial<Repository<MarketData>>>;
  let cacheManagerMock: jest.Mocked<Partial<Cache>>;

  let ordersSaved: Order[];
  let initialOrdersCount: number;
  const mockedInstrument = {
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
    instrumentid: mockedInstrument.id,
    high: 268.0,
    low: 255.0,
    open: 268.0,
    close: 260.0,
    previousclose: 264.0,
    date: new Date(),
  };

  const _setUp = async () => {
    ordersSaved = [
      Order.from({
        id: 10,
        userid: 1,
        instrumentid: mockedCash.id,
        size: 100000000,
        price: 1,
        type: OrderType.MARKET,
        side: OrderSide.CASH_IN,
        status: OrderStatus.FILLED,
        datetime: new Date(),
      }),
      Order.from({
        id: 11,
        userid: 1,
        instrumentid: mockedInstrument.id,
        size: 10,
        price: 10,
        type: OrderType.MARKET,
        side: OrderSide.BUY,
        status: OrderStatus.FILLED,
        datetime: new Date(),
      }),
      Order.from({
        id: 20,
        userid: 2,
        instrumentid: mockedCash.id,
        size: 10000,
        price: 1,
        type: OrderType.MARKET,
        side: OrderSide.CASH_IN,
        status: OrderStatus.FILLED,
        datetime: new Date(),
      }),
      Order.from({
        id: 21,
        userid: 2,
        instrumentid: mockedInstrument.id,
        size: 10000,
        price: 1,
        type: OrderType.MARKET,
        side: OrderSide.BUY,
        status: OrderStatus.FILLED,
        datetime: new Date(),
      }),
      Order.from({
        id: 31,
        userid: 3,
        instrumentid: mockedInstrument.id,
        size: 100,
        price: 100,
        type: OrderType.LIMIT,
        side: OrderSide.BUY,
        status: OrderStatus.NEW,
        datetime: new Date(),
      }),
      Order.from({
        id: 32,
        userid: 3,
        instrumentid: mockedInstrument.id,
        size: 100,
        price: 100,
        type: OrderType.LIMIT,
        side: OrderSide.SELL,
        status: OrderStatus.FILLED,
        datetime: new Date(),
      }),
    ];
    initialOrdersCount = ordersSaved.length;
    orderRepositoryMock = {
      find: jest.fn().mockImplementation((params: FindManyOptions<Order>) => {
        if (params.where?.['userid']) {
          const userid = params.where?.['userid'] as number;

          return Promise.resolve(
            ordersSaved.filter((o) => o.userid === userid),
          );
        }
        return Promise.resolve([]);
      }),
      findOne: jest.fn().mockImplementation((params: FindOneOptions<Order>) => {
        if (params.where?.['id']) {
          const id = params.where?.['id'] as number;

          return Promise.resolve(ordersSaved.find((o) => o.id === id));
        }
        return Promise.resolve(null);
      }),
      save: jest.fn().mockImplementation((entity: Order) => {
        ordersSaved.push(entity);
        return Promise.resolve(Order.from(entity));
      }),
    };

    instrumentRepositoryMock = {
      find: jest.fn().mockResolvedValue(mockedInstrument),
      findOne: jest.fn().mockResolvedValue(mockedInstrument),
    };

    marketRepositoryMock = {
      findOne: jest.fn().mockResolvedValue(mockedMarketData),
    };

    cacheManagerMock = {
      set: jest.fn(),
      get: jest.fn(),
      del: jest.fn(),
    };

    const module = await Test.createTestingModule({
      imports: [
        CacheModule.register({ isGlobal: true }),
        EventEmitterModule.forRoot(),
        RouterModule.register([
          {
            path: 'v1/orders',
            module: OrdersModule,
          },
        ]),
        OrdersModule,
      ],
    })
      .overrideProvider(getRepositoryToken(Order))
      .useValue(orderRepositoryMock)
      .overrideProvider(getRepositoryToken(Instrument))
      .useValue(instrumentRepositoryMock)
      .overrideProvider(getRepositoryToken(MarketData))
      .useValue(marketRepositoryMock)
      .overrideProvider(CACHE_MANAGER)
      .useValue(cacheManagerMock)
      .compile();

    app = module.createNestApplication();
    await app.init();
  };

  const _cleanUp = async () => {
    await app.close();
  };

  beforeEach(async () => {
    await _setUp();
  });

  afterEach(async () => {
    await _cleanUp();
  });

  describe('Create orders', () => {
    describe('Limit Orders', () => {
      it('should create a buy limit order with size', async () => {
        const payload = {
          userid: 1,
          instrumentTicker: 'DYCA',
          price: 100,
          size: 10,
          side: OrderSide.BUY,
          type: OrderType.LIMIT,
        };

        await request(app.getHttpServer())
          .post('/v1/orders')
          .send(payload)
          .expect(201)
          .expect('Content-Type', /json/);

        expect(orderRepositoryMock.save).toHaveBeenCalled();
        expect(ordersSaved.length).toBe(initialOrdersCount + 1);
        expect(ordersSaved[initialOrdersCount].status).toBe(OrderStatus.NEW);
        expect(ordersSaved[initialOrdersCount].size).toBe(payload.size);
        expect(ordersSaved[initialOrdersCount].side).toBe(payload.side);
        expect(ordersSaved[initialOrdersCount].type).toBe(payload.type);
      });

      it('should create a sell limit order with size', async () => {
        const payload = {
          userid: 1,
          instrumentTicker: 'DYCA',
          price: 100,
          size: 10,
          side: OrderSide.SELL,
          type: OrderType.LIMIT,
        };

        await request(app.getHttpServer())
          .post('/v1/orders')
          .send(payload)
          .expect(201)
          .expect('Content-Type', /json/);

        expect(orderRepositoryMock.save).toHaveBeenCalled();
        expect(ordersSaved.length).toBe(initialOrdersCount + 1);
        expect(ordersSaved[initialOrdersCount].status).toBe(OrderStatus.NEW);
        expect(ordersSaved[initialOrdersCount].size).toBe(payload.size);
        expect(ordersSaved[initialOrdersCount].side).toBe(payload.side);
        expect(ordersSaved[initialOrdersCount].type).toBe(payload.type);
      });

      it('should create a buy limit order with amount', async () => {
        const payload = {
          userid: 1,
          instrumentTicker: 'DYCA',
          price: 100,
          amount: 120,
          side: OrderSide.BUY,
          type: OrderType.LIMIT,
        };

        await request(app.getHttpServer())
          .post('/v1/orders')
          .send(payload)
          .expect(201)
          .expect('Content-Type', /json/);

        expect(orderRepositoryMock.save).toHaveBeenCalled();
        expect(ordersSaved.length).toBe(initialOrdersCount + 1);
        expect(ordersSaved[initialOrdersCount].status).toBe(OrderStatus.NEW);
        expect(ordersSaved[initialOrdersCount].size).toBe(1);
        expect(ordersSaved[initialOrdersCount].side).toBe(payload.side);
        expect(ordersSaved[initialOrdersCount].type).toBe(payload.type);
      });

      it('should create a sell limit order with amount', async () => {
        const payload = {
          userid: 1,
          instrumentTicker: 'DYCA',
          price: 100,
          amount: 120,
          side: OrderSide.SELL,
          type: OrderType.LIMIT,
        };

        await request(app.getHttpServer())
          .post('/v1/orders')
          .send(payload)
          .expect(201)
          .expect('Content-Type', /json/);

        expect(orderRepositoryMock.save).toHaveBeenCalled();
        expect(ordersSaved.length).toBe(initialOrdersCount + 1);
        expect(ordersSaved[initialOrdersCount].status).toBe(OrderStatus.NEW);
        expect(ordersSaved[initialOrdersCount].size).toBe(1);
        expect(ordersSaved[initialOrdersCount].side).toBe(payload.side);
        expect(ordersSaved[initialOrdersCount].type).toBe(payload.type);
      });

      it('should create a rejected order', async () => {
        const payload = {
          userid: 2,
          instrumentTicker: 'DYCA',
          price: 100,
          size: 12000,
          side: OrderSide.BUY,
          type: OrderType.LIMIT,
        };

        await request(app.getHttpServer())
          .post('/v1/orders')
          .send(payload)
          .expect(201)
          .expect('Content-Type', /json/);

        expect(orderRepositoryMock.save).toHaveBeenCalled();
        expect(ordersSaved.length).toBe(initialOrdersCount + 1);
        expect(ordersSaved[initialOrdersCount].status).toBe(
          OrderStatus.REJECTED,
        );
        expect(ordersSaved[initialOrdersCount].size).toBe(payload.size);
        expect(ordersSaved[initialOrdersCount].side).toBe(payload.side);
        expect(ordersSaved[initialOrdersCount].type).toBe(payload.type);
      });

      it('should reject an order if size equals 0', async () => {
        const payload = {
          userid: 2,
          instrumentTicker: 'DYCA',
          price: 100,
          amount: 1,
          side: OrderSide.BUY,
          type: OrderType.LIMIT,
        };

        await request(app.getHttpServer())
          .post('/v1/orders')
          .send(payload)
          .expect(201)
          .expect('Content-Type', /json/);

        expect(orderRepositoryMock.save).toHaveBeenCalled();
        expect(ordersSaved.length).toBe(initialOrdersCount + 1);
        expect(ordersSaved[initialOrdersCount].status).toBe(
          OrderStatus.REJECTED,
        );
        expect(ordersSaved[initialOrdersCount].size).toBe(0);
      });
    });

    describe('Market Orders', () => {
      it('should create a buy market order', async () => {
        const payload = {
          userid: 1,
          instrumentTicker: 'DYCA',
          size: 10,
          side: OrderSide.BUY,
          type: OrderType.MARKET,
        };

        await request(app.getHttpServer())
          .post('/v1/orders')
          .send(payload)
          .expect(201)
          .expect('Content-Type', /json/);

        expect(orderRepositoryMock.save).toHaveBeenCalled();
        expect(ordersSaved.length).toBe(initialOrdersCount + 1);
        expect(ordersSaved[initialOrdersCount].status).toBe(OrderStatus.FILLED);
        expect(ordersSaved[initialOrdersCount].size).toBe(payload.size);
        expect(ordersSaved[initialOrdersCount].side).toBe(payload.side);
        expect(ordersSaved[initialOrdersCount].type).toBe(payload.type);
        expect(ordersSaved[initialOrdersCount].price).toBe(
          mockedMarketData.close,
        );
      });

      it('should create a sell market order', async () => {
        const payload = {
          userid: 1,
          instrumentTicker: 'DYCA',
          size: 10,
          side: OrderSide.SELL,
          type: OrderType.MARKET,
        };

        await request(app.getHttpServer())
          .post('/v1/orders')
          .send(payload)
          .expect(201)
          .expect('Content-Type', /json/);

        expect(orderRepositoryMock.save).toHaveBeenCalled();
        expect(ordersSaved.length).toBe(initialOrdersCount + 1);
        expect(ordersSaved[initialOrdersCount].status).toBe(OrderStatus.FILLED);
        expect(ordersSaved[initialOrdersCount].size).toBe(payload.size);
        expect(ordersSaved[initialOrdersCount].side).toBe(payload.side);
        expect(ordersSaved[initialOrdersCount].type).toBe(payload.type);
        expect(ordersSaved[initialOrdersCount].price).toBe(
          mockedMarketData.close,
        );
      });

      it('should reject request if price is sent', async () => {
        const payload = {
          userid: 1,
          instrumentTicker: 'DYCA',
          size: 10,
          price: 100,
          side: OrderSide.SELL,
          type: OrderType.MARKET,
        };

        await request(app.getHttpServer())
          .post('/v1/orders')
          .send(payload)
          .expect(400)
          .expect('Content-Type', /json/);
      });

      it('should create a cash in market order', async () => {
        const payload = {
          userid: 1,
          instrumentTicker: 'ARS',
          size: 1000,
          side: OrderSide.CASH_IN,
          type: OrderType.MARKET,
        };

        await request(app.getHttpServer())
          .post('/v1/orders')
          .send(payload)
          .expect(201)
          .expect('Content-Type', /json/);

        expect(orderRepositoryMock.save).toHaveBeenCalled();
        expect(ordersSaved.length).toBe(initialOrdersCount + 1);
        expect(ordersSaved[initialOrdersCount].status).toBe(OrderStatus.FILLED);
        expect(ordersSaved[initialOrdersCount].size).toBe(payload.size);
        expect(ordersSaved[initialOrdersCount].side).toBe(payload.side);
        expect(ordersSaved[initialOrdersCount].type).toBe(payload.type);
        expect(ordersSaved[initialOrdersCount].price).toBe(1);
      });

      it('should create a cash out market order', async () => {
        const payload = {
          userid: 1,
          instrumentTicker: 'ARS',
          size: 1000,
          side: OrderSide.CASH_OUT,
          type: OrderType.MARKET,
        };

        await request(app.getHttpServer())
          .post('/v1/orders')
          .send(payload)
          .expect(201)
          .expect('Content-Type', /json/);

        expect(orderRepositoryMock.save).toHaveBeenCalled();
        expect(ordersSaved.length).toBe(initialOrdersCount + 1);
        expect(ordersSaved[initialOrdersCount].status).toBe(OrderStatus.FILLED);
        expect(ordersSaved[initialOrdersCount].size).toBe(payload.size);
        expect(ordersSaved[initialOrdersCount].side).toBe(payload.side);
        expect(ordersSaved[initialOrdersCount].type).toBe(payload.type);
        expect(ordersSaved[initialOrdersCount].price).toBe(1);
      });

      it('should create a rejected order', async () => {
        const payload = {
          userid: 2,
          instrumentTicker: mockedInstrument.ticker,
          size: 1000,
          side: OrderSide.BUY,
          type: OrderType.MARKET,
        };

        await request(app.getHttpServer())
          .post('/v1/orders')
          .send(payload)
          .expect(201)
          .expect('Content-Type', /json/);

        expect(orderRepositoryMock.save).toHaveBeenCalled();
        expect(ordersSaved.length).toBe(initialOrdersCount + 1);
        expect(ordersSaved[initialOrdersCount].status).toBe(
          OrderStatus.REJECTED,
        );
        expect(ordersSaved[initialOrdersCount].size).toBe(payload.size);
        expect(ordersSaved[initialOrdersCount].side).toBe(payload.side);
        expect(ordersSaved[initialOrdersCount].type).toBe(payload.type);
        expect(ordersSaved[initialOrdersCount].price).toBe(260.0);
      });

      it('should reject an order if size equals 0', async () => {
        const payload = {
          userid: 2,
          instrumentTicker: mockedInstrument.ticker,
          amount: 1,
          side: OrderSide.SELL,
          type: OrderType.MARKET,
        };

        await request(app.getHttpServer())
          .post('/v1/orders')
          .send(payload)
          .expect(201)
          .expect('Content-Type', /json/);

        expect(orderRepositoryMock.save).toHaveBeenCalled();
        expect(ordersSaved.length).toBe(initialOrdersCount + 1);
        expect(ordersSaved[initialOrdersCount].status).toBe(
          OrderStatus.REJECTED,
        );
        expect(ordersSaved[initialOrdersCount].size).toBe(0);
      });

      it('should create a cash out rejected order', async () => {
        const payload = {
          userid: 2,
          instrumentTicker: mockedCash.ticker,
          size: 1000000000,
          side: OrderSide.CASH_OUT,
          type: OrderType.MARKET,
        };

        await request(app.getHttpServer())
          .post('/v1/orders')
          .send(payload)
          .expect(201)
          .expect('Content-Type', /json/);

        expect(orderRepositoryMock.save).toHaveBeenCalled();
        expect(ordersSaved.length).toBe(initialOrdersCount + 1);
        expect(ordersSaved[initialOrdersCount].status).toBe(
          OrderStatus.REJECTED,
        );
        expect(ordersSaved[initialOrdersCount].size).toBe(payload.size);
        expect(ordersSaved[initialOrdersCount].side).toBe(payload.side);
        expect(ordersSaved[initialOrdersCount].type).toBe(payload.type);
        expect(ordersSaved[initialOrdersCount].price).toBe(1);
      });
    });

    describe('Cache', () => {
      it('Should invalidate cache upon order creation', async () => {
        const payload = {
          userid: 1,
          instrumentTicker: 'DYCA',
          size: 10,
          side: OrderSide.BUY,
          type: OrderType.MARKET,
        };

        await request(app.getHttpServer())
          .post('/v1/orders')
          .send(payload)
          .expect(201)
          .expect('Content-Type', /json/);

        expect(cacheManagerMock.del).toHaveBeenCalled();
      });

      it('Should not invalidate cache if order was REJECTED', async () => {
        const payload = {
          userid: 1,
          instrumentTicker: 'DYCA',
          size: 1000000000000,
          side: OrderSide.BUY,
          type: OrderType.MARKET,
        };

        await request(app.getHttpServer())
          .post('/v1/orders')
          .send(payload)
          .expect(201);

        expect(cacheManagerMock.del).not.toHaveBeenCalled();
      });
    });
  });

  describe('Cancel orders', () => {
    it('should cancel a NEW order', async () => {
      const order = await request(app.getHttpServer())
        .post('/v1/orders/31/cancel')
        .expect(200);

      expect(orderRepositoryMock.save).toHaveBeenCalled();
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      expect(order.body['status']).toBe(OrderStatus.CANCELLED);
    });

    it('should return error if order was not in NEW status', async () => {
      await request(app.getHttpServer())
        .post('/v1/orders/32/cancel')
        .expect(400);
    });

    it('should invalidate user balance cache', async () => {
      await request(app.getHttpServer())
        .post('/v1/orders/31/cancel')
        .expect(200);

      expect(cacheManagerMock.del).toHaveBeenCalled();
    });
  });
});
