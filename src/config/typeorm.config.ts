import { DataSource } from 'typeorm';
import { Item } from '../items/entities/item.entity';
import { Inventory } from '../inventory/entities/inventory.entity';
import { Inbound } from '../inbound/entities/inbound.entity';
import { Outbound } from '../outbound/entities/outbound.entity';
import { Warehouse } from '../warehouse/entities/warehouse.entity';
import { User } from '../users/entities/user.entity';

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  username: process.env.DB_USERNAME || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  database: process.env.DB_DATABASE || 'inventory_db',
  entities: [Item, Inventory, Inbound, Outbound, Warehouse, User],
  synchronize: false, // 마이그레이션 사용 시 false
  logging: true,
  migrations: ['src/migrations/*.ts'],
  migrationsTableName: 'migrations',
});
