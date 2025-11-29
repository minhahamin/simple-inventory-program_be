import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InboundOutboundService } from './inbound-outbound.service';
import { InboundOutboundController } from './inbound-outbound.controller';
import { Inbound } from '../inbound/entities/inbound.entity';
import { Outbound } from '../outbound/entities/outbound.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Inbound, Outbound])],
  controllers: [InboundOutboundController],
  providers: [InboundOutboundService],
})
export class InboundOutboundModule {}
