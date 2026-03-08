import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Store } from './store.entity';

export interface StoreLocation {
  id: string;
  retailer: string;
  name: string;
  address: string;
  city: string;
  lat: number;
  lng: number;
  color: string;
  openingHours?: string;
  distance?: number;
}

function toStoreLocation(store: Store, distance?: number): StoreLocation {
  return {
    id: store.id,
    retailer: store.retailer,
    name: store.name,
    address: store.address,
    city: store.city,
    lat: store.lat,
    lng: store.lng,
    color: store.color,
    openingHours: store.openingHours ?? undefined,
    ...(distance !== undefined && { distance }),
  };
}

@Injectable()
export class StoresService {
  constructor(
    @InjectRepository(Store)
    private readonly storeRepo: Repository<Store>,
  ) {}

  async findAll(city?: string): Promise<StoreLocation[]> {
    const qb = this.storeRepo
      .createQueryBuilder('store')
      .orderBy('store.retailer', 'ASC')
      .addOrderBy('store.name', 'ASC');
    if (city?.trim()) {
      qb.where('LOWER(store.city) = LOWER(:city)', { city: city.trim() });
    }
    const stores = await qb.getMany();
    return stores.map((s) => toStoreLocation(s));
  }

  async findByRetailer(retailer: string): Promise<StoreLocation[]> {
    const stores = await this.storeRepo
      .createQueryBuilder('store')
      .where('LOWER(store.retailer) LIKE LOWER(:retailer)', {
        retailer: `%${retailer.trim()}%`,
      })
      .orderBy('store.name')
      .getMany();
    return stores.map((s) => toStoreLocation(s));
  }

  async findNearest(lat: number, lng: number, limit = 10): Promise<StoreLocation[]> {
    const stores = await this.storeRepo.find({ order: { retailer: 'ASC', name: 'ASC' } });
    const withDistance = stores.map((store) => ({
      ...toStoreLocation(store),
      distance: this.calcDistance(lat, lng, store.lat, store.lng),
    }));
    withDistance.sort((a, b) => a.distance! - b.distance!);
    return withDistance.slice(0, limit);
  }

  private calcDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
    const R = 6371;
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLng = ((lng2 - lng1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLng / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  }
}
