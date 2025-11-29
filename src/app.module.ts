import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ItemsModule } from './items/items.module';
import { InboundModule } from './inbound/inbound.module';
import { OutboundModule } from './outbound/outbound.module';
import { WarehouseModule } from './warehouse/warehouse.module';
import { UsersModule } from './users/users.module';
import { InboundOutboundModule } from './inbound-outbound/inbound-outbound.module';
import { Item } from './items/entities/item.entity';
import { Inventory } from './inventory/entities/inventory.entity';
import { Inbound } from './inbound/entities/inbound.entity';
import { Outbound } from './outbound/entities/outbound.entity';
import { Warehouse } from './warehouse/entities/warehouse.entity';
import { User } from './users/entities/user.entity';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => {
        // Railway는 DATABASE_URL 또는 DATABASE_PUBLIC_URL을 제공
        const databaseUrl =
          configService.get<string>('DATABASE_URL') ||
          configService.get<string>('DATABASE_PUBLIC_URL');

        // DATABASE_URL이 있으면 직접 사용, 없으면 개별 변수 사용
        if (databaseUrl) {
          return {
            type: 'postgres',
            url: databaseUrl,
            entities: [Item, Inventory, Inbound, Outbound, Warehouse, User],
            synchronize: configService.get<string>('NODE_ENV') !== 'production',
            logging: configService.get<string>('NODE_ENV') !== 'production',
            ssl:
              configService.get<string>('NODE_ENV') === 'production'
                ? { rejectUnauthorized: false }
                : false,
          };
        }

        // Railway의 PG* 환경 변수 또는 로컬 개발용 DB_* 변수 사용
        return {
          type: 'postgres',
          host:
            configService.get<string>('PGHOST') ||
            configService.get<string>('DB_HOST', 'localhost'),
          port:
            configService.get<number>('PGPORT') ||
            configService.get<number>('DB_PORT', 5432),
          username:
            configService.get<string>('PGUSER') ||
            configService.get<string>('DB_USERNAME', 'postgres'),
          password:
            configService.get<string>('PGPASSWORD') ||
            configService.get<string>('DB_PASSWORD', 'postgres'),
          database:
            configService.get<string>('PGDATABASE') ||
            configService.get<string>('DB_DATABASE', 'inventory_db'),
          entities: [Item, Inventory, Inbound, Outbound, Warehouse, User],
          synchronize: configService.get<string>('NODE_ENV') !== 'production',
          logging: configService.get<string>('NODE_ENV') !== 'production',
          ssl:
            configService.get<string>('NODE_ENV') === 'production'
              ? { rejectUnauthorized: false }
              : false,
        };
      },
      inject: [ConfigService],
    }),
    ItemsModule,
    InboundModule,
    OutboundModule,
    WarehouseModule,
    UsersModule,
    InboundOutboundModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
