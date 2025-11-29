import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Inbound } from '../inbound/entities/inbound.entity';
import { Outbound } from '../outbound/entities/outbound.entity';

export interface InboundOutboundStatus {
  itemCode: string;
  itemName: string;
  totalInbound: number;
  totalOutbound: number;
  netStock: number;
  inboundCount: number;
  outboundCount: number;
  lastInboundDate: string | null;
  lastOutboundDate: string | null;
}

@Injectable()
export class InboundOutboundService {
  constructor(
    @InjectRepository(Inbound)
    private readonly inboundRepository: Repository<Inbound>,
    @InjectRepository(Outbound)
    private readonly outboundRepository: Repository<Outbound>,
  ) {}

  async getStatus(
    itemCode?: string,
    startDate?: string,
    endDate?: string,
  ): Promise<InboundOutboundStatus[]> {
    // 입고 정보 조회
    const inboundQuery = this.inboundRepository.createQueryBuilder('inbound');
    if (itemCode) {
      inboundQuery.where('inbound.itemCode = :itemCode', { itemCode });
    }
    if (startDate) {
      inboundQuery.andWhere('inbound.inboundDate >= :startDate', {
        startDate,
      });
    }
    if (endDate) {
      inboundQuery.andWhere('inbound.inboundDate <= :endDate', { endDate });
    }
    const inbounds = await inboundQuery.getMany();

    // 출고 정보 조회
    const outboundQuery =
      this.outboundRepository.createQueryBuilder('outbound');
    if (itemCode) {
      outboundQuery.where('outbound.itemCode = :itemCode', { itemCode });
    }
    if (startDate) {
      outboundQuery.andWhere('outbound.outboundDate >= :startDate', {
        startDate,
      });
    }
    if (endDate) {
      outboundQuery.andWhere('outbound.outboundDate <= :endDate', {
        endDate,
      });
    }
    const outbounds = await outboundQuery.getMany();

    // 품목 코드별로 그룹화
    const statusMap = new Map<string, InboundOutboundStatus>();

    // 입고 정보 집계
    inbounds.forEach((inbound) => {
      if (!statusMap.has(inbound.itemCode)) {
        statusMap.set(inbound.itemCode, {
          itemCode: inbound.itemCode,
          itemName: inbound.itemName,
          totalInbound: 0,
          totalOutbound: 0,
          netStock: 0,
          inboundCount: 0,
          outboundCount: 0,
          lastInboundDate: null,
          lastOutboundDate: null,
        });
      }
      const status = statusMap.get(inbound.itemCode);
      status.totalInbound += inbound.quantity;
      status.inboundCount += 1;
      if (
        !status.lastInboundDate ||
        inbound.inboundDate > status.lastInboundDate
      ) {
        status.lastInboundDate = inbound.inboundDate;
      }
    });

    // 출고 정보 집계
    outbounds.forEach((outbound) => {
      if (!statusMap.has(outbound.itemCode)) {
        statusMap.set(outbound.itemCode, {
          itemCode: outbound.itemCode,
          itemName: outbound.itemName,
          totalInbound: 0,
          totalOutbound: 0,
          netStock: 0,
          inboundCount: 0,
          outboundCount: 0,
          lastInboundDate: null,
          lastOutboundDate: null,
        });
      }
      const status = statusMap.get(outbound.itemCode);
      status.totalOutbound += outbound.quantity;
      status.outboundCount += 1;
      if (
        !status.lastOutboundDate ||
        outbound.outboundDate > status.lastOutboundDate
      ) {
        status.lastOutboundDate = outbound.outboundDate;
      }
    });

    // 순재고 계산 및 결과 반환
    const result = Array.from(statusMap.values()).map((status) => ({
      ...status,
      netStock: status.totalInbound - status.totalOutbound,
    }));

    return result;
  }

  async getStatusByItemCode(itemCode: string): Promise<InboundOutboundStatus> {
    const statusList = await this.getStatus(itemCode);
    if (statusList.length === 0) {
      return {
        itemCode,
        itemName: '',
        totalInbound: 0,
        totalOutbound: 0,
        netStock: 0,
        inboundCount: 0,
        outboundCount: 0,
        lastInboundDate: null,
        lastOutboundDate: null,
      };
    }
    return statusList[0];
  }
}

