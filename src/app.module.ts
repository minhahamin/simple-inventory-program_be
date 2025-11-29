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
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get('DB_HOST', 'localhost'),
        port: configService.get<number>('DB_PORT', 5432),
        username: configService.get('DB_USERNAME', 'postgres'),
        password: configService.get('DB_PASSWORD', 'postgres'),
        database: configService.get('DB_DATABASE', 'inventory_db'),
        entities: [Item, Inventory, Inbound, Outbound, Warehouse, User],
        synchronize:
          configService.get<string>('NODE_ENV') !== 'production', // 개발 환경: true (자동 테이블 생성), 프로덕션: false (마이그레이션 사용)
        logging:
          configService.get<string>('NODE_ENV') !== 'production',
      }),
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
