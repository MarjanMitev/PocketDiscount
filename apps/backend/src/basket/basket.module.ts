import { Module } from '@nestjs/common';
import { BasketService } from './basket.service';
import { BasketController } from './basket.controller';
import { ScrapersModule } from '../scrapers/scrapers.module';

@Module({
  imports: [ScrapersModule],
  providers: [BasketService],
  controllers: [BasketController],
})
export class BasketModule {}
