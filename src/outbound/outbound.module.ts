import { Module } from '@nestjs/common';
import { OutboundService } from './outbound.service';
import { OutboundController } from './outbound.controller';
import { InventoryModule } from '../inventory/inventory.module';

@Module({
  imports: [InventoryModule],
  controllers: [OutboundController],
  providers: [OutboundService],
})
export class OutboundModule {}

