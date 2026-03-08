import { Controller, Get, Query } from '@nestjs/common';
import { StoresService } from './stores.service';

@Controller('stores')
export class StoresController {
  constructor(private readonly storesService: StoresService) {}

  @Get()
  findAll(@Query('city') city?: string) {
    return this.storesService.findAll(city);
  }

  @Get('nearest')
  findNearest(
    @Query('lat') lat: string,
    @Query('lng') lng: string,
    @Query('limit') limit?: string,
  ) {
    return this.storesService.findNearest(
      parseFloat(lat),
      parseFloat(lng),
      limit ? parseInt(limit) : 10,
    );
  }
}
