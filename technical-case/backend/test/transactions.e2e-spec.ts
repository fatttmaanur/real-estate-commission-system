import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { TransactionsController } from '../src/transactions/transactions.controller';
import { TransactionsService } from '../src/transactions/transactions.service';

describe('TransactionsController (e2e)', () => {
  let app: INestApplication;

  const transactionsService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
    getBreakdown: jest.fn(),
    getAgentEarnings: jest.fn(),
  };

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      controllers: [TransactionsController],
      providers: [
        {
          provide: TransactionsService,
          useValue: transactionsService,
        },
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );
    await app.init();
  });

  afterEach(async () => {
    jest.clearAllMocks();
    await app.close();
  });

  it('POST /transactions creates a transaction', async () => {
    const server = app.getHttpServer() as Parameters<typeof request>[0];
    const payload = {
      propertyId: 'prop-1',
      listingAgent: 'john',
      sellingAgent: 'jane',
      serviceFee: 10000,
    };

    transactionsService.create.mockResolvedValue({
      _id: '507f1f77bcf86cd799439011',
      stage: 'agreement',
      breakdown: {
        agency: 5000,
        john: 2500,
        jane: 2500,
      },
      ...payload,
    });

    await request(server)
      .post('/transactions')
      .send(payload)
      .expect(201)
      .expect({
        _id: '507f1f77bcf86cd799439011',
        stage: 'agreement',
        breakdown: {
          agency: 5000,
          john: 2500,
          jane: 2500,
        },
        ...payload,
      });
  });

  it('PATCH /transactions/:id rejects invalid payload', async () => {
    const server = app.getHttpServer() as Parameters<typeof request>[0];

    await request(server)
      .patch('/transactions/507f1f77bcf86cd799439011')
      .send({ listingAgent: '' })
      .expect(400);
  });

  it('DELETE /transactions/:id returns success payload', async () => {
    const server = app.getHttpServer() as Parameters<typeof request>[0];

    transactionsService.remove.mockResolvedValue({
      message: 'Transaction deleted successfully',
      deletedId: '507f1f77bcf86cd799439011',
    });

    await request(server)
      .delete('/transactions/507f1f77bcf86cd799439011')
      .expect(200)
      .expect({
        message: 'Transaction deleted successfully',
        deletedId: '507f1f77bcf86cd799439011',
      });
  });
});
