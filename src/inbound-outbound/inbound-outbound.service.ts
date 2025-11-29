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
  totalInboundAmount: number; // 입고 총 금액
  totalOutboundAmount: number; // 출고 총 금액
  netStock: number;
  inboundCount: number;
  outboundCount: number;
  lastInboundDate: string | null;
  lastOutboundDate: string | null;
}

export interface MonthlyTrend {
  month: string; // YYYY-MM 형식
  inboundAmount: number; // 입고 금액
  outboundAmount: number; // 출고 금액
}

export interface CountComparison {
  inboundCount: number;
  outboundCount: number;
  inboundPercentage: number;
  outboundPercentage: number;
}

export interface DashboardData {
  monthlyTrend: MonthlyTrend[]; // 월별 입출고 추이
  countComparison: CountComparison; // 입출고 건수 비교
  topItems: InboundOutboundStatus[]; // 품목별 입출고 현황 상위 10개
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
          totalInboundAmount: 0,
          totalOutboundAmount: 0,
          netStock: 0,
          inboundCount: 0,
          outboundCount: 0,
          lastInboundDate: null,
          lastOutboundDate: null,
        });
      }
      const status = statusMap.get(inbound.itemCode);
      status.totalInbound += inbound.quantity;
      status.totalInboundAmount += inbound.quantity * Number(inbound.unitPrice);
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
          totalInboundAmount: 0,
          totalOutboundAmount: 0,
          netStock: 0,
          inboundCount: 0,
          outboundCount: 0,
          lastInboundDate: null,
          lastOutboundDate: null,
        });
      }
      const status = statusMap.get(outbound.itemCode);
      status.totalOutbound += outbound.quantity;
      status.totalOutboundAmount +=
        outbound.quantity * Number(outbound.unitPrice);
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
        totalInboundAmount: 0,
        totalOutboundAmount: 0,
        netStock: 0,
        inboundCount: 0,
        outboundCount: 0,
        lastInboundDate: null,
        lastOutboundDate: null,
      };
    }
    return statusList[0];
  }

  async getMonthlyTrend(
    startDate?: string,
    endDate?: string,
  ): Promise<MonthlyTrend[]> {
    const inboundQuery = this.inboundRepository.createQueryBuilder('inbound');
    if (startDate) {
      inboundQuery.andWhere('inbound.inboundDate >= :startDate', {
        startDate,
      });
    }
    if (endDate) {
      inboundQuery.andWhere('inbound.inboundDate <= :endDate', { endDate });
    }
    const inbounds = await inboundQuery.getMany();

    const outboundQuery =
      this.outboundRepository.createQueryBuilder('outbound');
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

    const monthlyMap = new Map<string, MonthlyTrend>();

    // 입고 정보 월별 집계
    inbounds.forEach((inbound) => {
      const month = inbound.inboundDate.substring(0, 7); // YYYY-MM
      if (!monthlyMap.has(month)) {
        monthlyMap.set(month, {
          month,
          inboundAmount: 0,
          outboundAmount: 0,
        });
      }
      const trend = monthlyMap.get(month);
      trend.inboundAmount += inbound.quantity * Number(inbound.unitPrice);
    });

    // 출고 정보 월별 집계
    outbounds.forEach((outbound) => {
      const month = outbound.outboundDate.substring(0, 7); // YYYY-MM
      if (!monthlyMap.has(month)) {
        monthlyMap.set(month, {
          month,
          inboundAmount: 0,
          outboundAmount: 0,
        });
      }
      const trend = monthlyMap.get(month);
      trend.outboundAmount += outbound.quantity * Number(outbound.unitPrice);
    });

    return Array.from(monthlyMap.values()).sort((a, b) =>
      a.month.localeCompare(b.month),
    );
  }

  async getCountComparison(): Promise<CountComparison> {
    const inboundCount = await this.inboundRepository.count();
    const outboundCount = await this.outboundRepository.count();
    const total = inboundCount + outboundCount;

    return {
      inboundCount,
      outboundCount,
      inboundPercentage: total > 0 ? (inboundCount / total) * 100 : 0,
      outboundPercentage: total > 0 ? (outboundCount / total) * 100 : 0,
    };
  }

  async getTopItems(limit: number = 10): Promise<InboundOutboundStatus[]> {
    const statusList = await this.getStatus();
    return statusList
      .sort(
        (a, b) =>
          b.totalInboundAmount +
          b.totalOutboundAmount -
          (a.totalInboundAmount + a.totalOutboundAmount),
      )
      .slice(0, limit);
  }

  async getDashboardData(
    startDate?: string,
    endDate?: string,
  ): Promise<DashboardData> {
    const [monthlyTrend, countComparison, topItems] = await Promise.all([
      this.getMonthlyTrend(startDate, endDate),
      this.getCountComparison(),
      this.getTopItems(10),
    ]);

    return {
      monthlyTrend,
      countComparison,
      topItems,
    };
  }
}
