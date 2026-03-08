import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ProductImagesController } from './product-images.controller';
import { ProductImagesService } from './product-images.service';

@Module({
  imports: [ConfigModule],
  controllers: [ProductImagesController],
  providers: [ProductImagesService],
  exports: [ProductImagesService],
})
export class ProductImagesModule {}
