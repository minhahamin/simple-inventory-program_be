import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OutboundService } from './outbound.service';
import { OutboundController } from './outbound.controller';
import { Outbound } from './entities/outbound.entity';
import { InventoryModule } from '../inventory/inventory.module';

@Module({
  imports: [TypeOrmModule.forFeature([Outbound]), InventoryModule],
  controllers: [OutboundController],
  providers: [OutboundService],
})
export class OutboundModule {}
