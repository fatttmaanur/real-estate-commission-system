import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';
import { TransactionsModule } from './transactions/transactions.module';

@Module({
  imports: [
    ConfigModule.forRoot(), // .env dosyasını yükler
    MongooseModule.forRoot(
      process.env.MONGODB_URI || 'mongodb://localhost:27017/mydb',
    ),
    TransactionsModule,
  ],
})
export class AppModule {}
