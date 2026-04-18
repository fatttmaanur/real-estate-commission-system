import { BadRequestException, NotFoundException } from '@nestjs/common';
import { TransactionsService } from './transactions.service';

describe('TransactionsService', () => {
  it('recalculates breakdown when service fee changes', async () => {
    const existingTransaction = {
      _id: '507f1f77bcf86cd799439011',
      propertyId: 'prop-1',
      listingAgent: 'john',
      sellingAgent: 'jane',
      serviceFee: 10000,
      stage: 'agreement',
      breakdown: {
        agency: 5000,
        john: 2500,
        jane: 2500,
      },
    };

    const updatedTransaction = {
      ...existingTransaction,
      serviceFee: 12000,
      stage: 'earnest_money',
      breakdown: {
        agency: 6000,
        john: 3000,
        jane: 3000,
      },
    };

    const model = {
      findById: jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValue(existingTransaction),
      }),
      findByIdAndUpdate: jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValue(updatedTransaction),
      }),
    };

    const service = new TransactionsService(model as never);
    const result = await service.update(existingTransaction._id, {
      serviceFee: 12000,
      stage: 'earnest_money',
    });

    expect(model.findByIdAndUpdate).toHaveBeenCalledWith(
      existingTransaction._id,
      {
        serviceFee: 12000,
        stage: 'earnest_money',
        breakdown: {
          agency: 6000,
          john: 3000,
          jane: 3000,
        },
      },
      { new: true },
    );
    expect(result).toEqual(updatedTransaction);
  });

  it('rejects invalid stage transitions', async () => {
    const model = {
      findById: jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValue({
          _id: '507f1f77bcf86cd799439011',
          propertyId: 'prop-1',
          listingAgent: 'john',
          sellingAgent: 'jane',
          serviceFee: 10000,
          stage: 'agreement',
          breakdown: {},
        }),
      }),
    };

    const service = new TransactionsService(model as never);

    await expect(
      service.update('507f1f77bcf86cd799439011', { stage: 'completed' }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('throws not found when deleting a missing transaction', async () => {
    const model = {
      findByIdAndDelete: jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      }),
    };

    const service = new TransactionsService(model as never);

    await expect(
      service.remove('507f1f77bcf86cd799439011'),
    ).rejects.toBeInstanceOf(NotFoundException);
  });
});
