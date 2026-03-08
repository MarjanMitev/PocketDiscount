import { Body, Controller, Post } from '@nestjs/common';
import { IsString, MaxLength, MinLength } from 'class-validator';
import { ReceiptsService, OcrResult } from './receipts.service';

class OcrDto {
  @IsString()
  @MinLength(10, { message: 'Image data too short' })
  @MaxLength(10 * 1024 * 1024) // ~10MB base64
  imageBase64: string;
}

@Controller('receipts')
export class ReceiptsController {
  constructor(private readonly receiptsService: ReceiptsService) {}

  @Post('ocr')
  async ocr(@Body() dto: OcrDto): Promise<OcrResult> {
    return this.receiptsService.recognizeFromBase64(dto.imageBase64);
  }
}
