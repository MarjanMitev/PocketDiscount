import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ProductImagesModule } from '../product-images/product-images.module';
import { ScrapersService } from './scrapers.service';
import { ScrapersController } from './scrapers.controller';
import { AhScraper } from './ah.scraper';
import { TroliScraper } from './troli.scraper';
import { JumboScraper } from './jumbo.scraper';
import { LidlScraper } from './lidl.scraper';
import { PlusScraper } from './plus.scraper';
import { DirkScraper } from './dirk.scraper';
import { VomarScraper } from './vomar.scraper';
import { SparScraper } from './spar.scraper';
import { EtosScraper } from './etos.scraper';

@Module({
  imports: [ConfigModule, ProductImagesModule],
  providers: [
    ScrapersService,
    AhScraper,
    TroliScraper,
    JumboScraper,
    LidlScraper,
    PlusScraper,
    DirkScraper,
    VomarScraper,
    SparScraper,
    EtosScraper,
  ],
  controllers: [ScrapersController],
  exports: [ScrapersService],
})
export class ScrapersModule {}
