import { Controller, Post, Body } from '@nestjs/common';
import { BasketService } from './basket.service';
import { IsArray, IsString } from 'class-validator';

class OptimizeDto {
  @IsArray()
  @IsString({ each: true })
  items: string[];
}

@Controller('basket')
export class BasketController {
  constructor(private readonly basketService: BasketService) {}

  @Post('optimize')
  async optimize(@Body() dto: OptimizeDto) {
    return this.basketService.optimize(dto.items);
  }
}
