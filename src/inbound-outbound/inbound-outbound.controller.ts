import { Controller, Get, Query, Param } from '@nestjs/common';
import { InboundOutboundService } from './inbound-outbound.service';

@Controller('inbound-outbound')
export class InboundOutboundController {
  constructor(
    private readonly inboundOutboundService: InboundOutboundService,
  ) {}

  @Get('status')
  getStatus(
    @Query('itemCode') itemCode?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.inboundOutboundService.getStatus(itemCode, startDate, endDate);
  }

  @Get('status/:itemCode')
  getStatusByItemCode(@Param('itemCode') itemCode: string) {
    return this.inboundOutboundService.getStatusByItemCode(itemCode);
  }
}

