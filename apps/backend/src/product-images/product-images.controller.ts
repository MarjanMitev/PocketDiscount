import { Controller, Get, Header, Param, StreamableFile, NotFoundException } from '@nestjs/common';
import { createReadStream, existsSync } from 'fs';
import { ProductImagesService } from './product-images.service';

function safeSegment(s: string): string {
  return s.replace(/[^a-zA-Z0-9_.-]/g, '');
}

@Controller('assets/product-images')
export class ProductImagesController {
  constructor(private readonly productImages: ProductImagesService) {}

  @Get(':retailer/:filename')
  @Header('Content-Type', 'image/webp')
  @Header('Cache-Control', 'public, max-age=86400')
  serve(@Param('retailer') retailer: string, @Param('filename') filename: string): StreamableFile {
    const safeRetailer = safeSegment(retailer);
    const safeFilename = safeSegment(filename);
    if (!safeFilename.endsWith('.webp')) throw new NotFoundException('Image not found');
    const relPath = `${safeRetailer}/${safeFilename}`;
    const absPath = this.productImages.getAbsolutePath(relPath);
    if (!existsSync(absPath)) throw new NotFoundException('Image not found');
    return new StreamableFile(createReadStream(absPath));
  }
}
