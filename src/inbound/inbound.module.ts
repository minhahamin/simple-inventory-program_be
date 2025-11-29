import { Module } from '@nestjs/common';
import { InboundService } from './inbound.service';
import { InboundController } from './inbound.controller';
import { InventoryModule } from '../inventory/inventory.module';

@Module({
  imports: [InventoryModule],
  controllers: [InboundController],
  providers: [InboundService],
})
export class InboundModule {}

