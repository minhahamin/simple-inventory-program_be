import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InboundService } from './inbound.service';
import { InboundController } from './inbound.controller';
import { Inbound } from './entities/inbound.entity';
import { InventoryModule } from '../inventory/inventory.module';

@Module({
  imports: [TypeOrmModule.forFeature([Inbound]), InventoryModule],
  controllers: [InboundController],
  providers: [InboundService],
})
export class InboundModule {}
