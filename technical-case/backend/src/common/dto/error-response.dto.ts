import { ApiProperty } from '@nestjs/swagger';

export class ErrorResponseDto {
  @ApiProperty({ example: false })
  success: false;

  @ApiProperty({ example: 400 })
  statusCode: number;

  @ApiProperty({ example: 'Bad Request' })
  error: string;

  @ApiProperty({
    example: ['listingAgent should not be empty'],
    oneOf: [
      { type: 'string', example: 'Transaction with ID 123 not found' },
      {
        type: 'array',
        items: { type: 'string' },
        example: ['listingAgent should not be empty'],
      },
    ],
  })
  message: string | string[];

  @ApiProperty({ example: '/transactions/507f1f77bcf86cd799439011' })
  path: string;

  @ApiProperty({ example: '2026-04-17T12:00:00.000Z' })
  timestamp: string;
}
