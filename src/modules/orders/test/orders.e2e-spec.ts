import './mockDatabase.helper';
import { Test } from '@nestjs/testing';
import * as request from 'supertest';
import { INestApplication } from '@nestjs/common';
import { App } from 'supertest/types';
import { Order } from '../domain/orders.model';
import { Repository } from 'typeorm';
import { OrdersModule } from '../orders.module';
import { getRepositoryToken } from '@nestjs/typeorm';
import { OrderSide, OrderType } from '../domain/orders.constants';
import { Instrument } from 'src/modules/market/domain/instruments.model';

describe('OrdersModule E2E Testing', () => {
  let app: INestApplication<App>;
  let orderRepositoryMock: jest.Mocked<Partial<Repository<Order>>>;
  let instrumentRepositoryMock: jest.Mocked<Partial<Repository<Instrument>>>;
  let ordersSaved: Order[];
  const mockedInstrument = {
    id: 1,
    ticker: 'DYCA',
    name: 'Dycasa S.A.',
    type: 'ACCIONES',
  };

  const _setUp = async () => {
    ordersSaved = [];
    orderRepositoryMock = {
      find: jest.fn(() => Promise.resolve([])),
      save: jest.fn().mockImplementation((entity: Order) => {
        ordersSaved.push(entity);
        return Promise.resolve(Order.from(entity));
      }),
    };

    instrumentRepositoryMock = {
      findOneBy: jest.fn().mockResolvedValue(mockedInstrument),
    };

    const module = await Test.createTestingModule({
      imports: [OrdersModule.withRouting()],
      providers: [
        {
          provide: getRepositoryToken(Order),
          useValue: orderRepositoryMock,
        },
        {
          provide: getRepositoryToken(Instrument),
          useValue: instrumentRepositoryMock,
        },
      ],
    })
      .overrideProvider(getRepositoryToken(Order))
      .useValue(orderRepositoryMock)
      .overrideProvider(getRepositoryToken(Instrument))
      .useValue(instrumentRepositoryMock)
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

  describe('With routing', () => {
    it('should register module with routing configuration', async () => {
      return request(app.getHttpServer())
        .get('/v1/orders')
        .expect(200)
        .expect('Content-Type', /json/);
    });
  });

  describe('Create orders', () => {
    describe('Limit Orders', () => {
      it('should create a buy limit order with size', async () => {
        const payload = {
          userId: 1,
          instrumentTicker: 'DYCA',
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
        expect(ordersSaved.length).toBe(1);
        expect(ordersSaved[0].size).toBe(payload.size);
        expect(ordersSaved[0].side).toBe(payload.side);
        expect(ordersSaved[0].type).toBe(payload.type);
      });

      it('should create a sell limit order with size', async () => {
        const payload = {
          userId: 1,
          instrumentTicker: 'DYCA',
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
        expect(ordersSaved.length).toBe(1);
        expect(ordersSaved[0].size).toBe(payload.size);
        expect(ordersSaved[0].side).toBe(payload.side);
        expect(ordersSaved[0].type).toBe(payload.type);
      });
    });

    describe('Market Orders', () => {
      it('should create a buy market order', async () => {
        const payload = {
          userId: 1,
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
        expect(ordersSaved.length).toBe(1);
        expect(ordersSaved[0].size).toBe(payload.size);
        expect(ordersSaved[0].side).toBe(payload.side);
        expect(ordersSaved[0].type).toBe(payload.type);
      });

      it('should create a sell market order', async () => {
        const payload = {
          userId: 1,
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
        expect(ordersSaved.length).toBe(1);
        expect(ordersSaved[0].size).toBe(payload.size);
        expect(ordersSaved[0].side).toBe(payload.side);
        expect(ordersSaved[0].type).toBe(payload.type);
      });

      it('should create a cash in market order', async () => {
        const payload = {
          userId: 1,
          instrumentTicker: 'ARS',
          size: 10,
          side: OrderSide.CASH_IN,
          type: OrderType.MARKET,
        };

        await request(app.getHttpServer())
          .post('/v1/orders')
          .send(payload)
          .expect(201)
          .expect('Content-Type', /json/);

        expect(orderRepositoryMock.save).toHaveBeenCalled();
        expect(ordersSaved.length).toBe(1);
        expect(ordersSaved[0].size).toBe(payload.size);
        expect(ordersSaved[0].side).toBe(payload.side);
        expect(ordersSaved[0].type).toBe(payload.type);
      });

      it('should create a cash out market order', async () => {
        const payload = {
          userId: 1,
          instrumentTicker: 'ARS',
          size: 10,
          side: OrderSide.CASH_OUT,
          type: OrderType.MARKET,
        };

        await request(app.getHttpServer())
          .post('/v1/orders')
          .send(payload)
          .expect(201)
          .expect('Content-Type', /json/);

        expect(orderRepositoryMock.save).toHaveBeenCalled();
        expect(ordersSaved.length).toBe(1);
        expect(ordersSaved[0].size).toBe(payload.size);
        expect(ordersSaved[0].side).toBe(payload.side);
        expect(ordersSaved[0].type).toBe(payload.type);
      });
    });
  });
});
