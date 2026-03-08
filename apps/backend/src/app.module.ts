import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleModule } from '@nestjs/schedule';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ScrapersModule } from './scrapers/scrapers.module';
import { StoresModule } from './stores/stores.module';
import { BasketModule } from './basket/basket.module';
import { ReceiptsModule } from './receipts/receipts.module';
import { ProductImagesModule } from './product-images/product-images.module';
import { Store } from './stores/store.entity';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        url: config.get('DATABASE_URL'),
        entities: [Store],
        synchronize: config.get('NODE_ENV') !== 'production',
      }),
      inject: [ConfigService],
    }),
    ScheduleModule.forRoot(),
    ScrapersModule,
    ProductImagesModule,
    StoresModule,
    BasketModule,
    ReceiptsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
