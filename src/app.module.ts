import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ItemsModule } from './items/items.module';
import { InboundModule } from './inbound/inbound.module';
import { OutboundModule } from './outbound/outbound.module';
import { WarehouseModule } from './warehouse/warehouse.module';
import { UsersModule } from './users/users.module';

@Module({
  imports: [ItemsModule, InboundModule, OutboundModule, WarehouseModule, UsersModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

