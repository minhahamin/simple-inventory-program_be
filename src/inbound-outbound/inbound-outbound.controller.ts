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

  @Get('dashboard')
  getDashboardData(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.inboundOutboundService.getDashboardData(startDate, endDate);
  }

  @Get('monthly-trend')
  getMonthlyTrend(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.inboundOutboundService.getMonthlyTrend(startDate, endDate);
  }

  @Get('count-comparison')
  getCountComparison() {
    return this.inboundOutboundService.getCountComparison();
  }

  @Get('top-items')
  getTopItems(@Query('limit') limit?: string) {
    const limitNum = limit ? parseInt(limit, 10) : 10;
    return this.inboundOutboundService.getTopItems(limitNum);
  }
}
