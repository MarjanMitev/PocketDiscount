import {
  Entity,
  PrimaryColumn,
  Column,
} from 'typeorm';

@Entity('stores')
export class Store {
  @PrimaryColumn()
  id: string;

  @Column()
  retailer: string;

  @Column()
  name: string;

  @Column()
  address: string;

  @Column()
  city: string;

  @Column('float')
  lat: number;

  @Column('float')
  lng: number;

  @Column({ length: 20 })
  color: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  openingHours: string | null;
}
