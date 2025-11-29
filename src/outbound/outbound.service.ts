import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateOutboundDto } from './dto/create-outbound.dto';
import { UpdateOutboundDto } from './dto/update-outbound.dto';
import { Outbound } from './entities/outbound.entity';
import { InventoryService } from '../inventory/inventory.service';

@Injectable()
export class OutboundService {
  constructor(
    @InjectRepository(Outbound)
    private readonly outboundRepository: Repository<Outbound>,
    private readonly inventoryService: InventoryService,
  ) {}

  async create(createOutboundDto: CreateOutboundDto): Promise<Outbound> {
    const outbound = this.outboundRepository.create({
      outboundDate: new Date().toISOString().split('T')[0],
      ...createOutboundDto,
      memo: createOutboundDto.memo || '',
    });

    // 출고 시 재고 확인 및 차감
    const inventory = await this.inventoryService.findByItemCode(
      outbound.itemCode,
    );
    if (!inventory) {
      throw new BadRequestException(
        `재고 정보를 찾을 수 없습니다. 품목 코드: ${outbound.itemCode}`,
      );
    }

    if (inventory.currentStock < outbound.quantity) {
      throw new BadRequestException(
        `재고가 부족합니다. 현재 재고: ${inventory.currentStock}, 요청 수량: ${outbound.quantity}`,
      );
    }

    const savedOutbound = await this.outboundRepository.save(outbound);

    const newCurrentStock = inventory.currentStock - savedOutbound.quantity;
    await this.inventoryService.update(inventory.id, {
      currentStock: newCurrentStock,
      lastOutboundDate: savedOutbound.outboundDate, // 최종 출고일 업데이트
    });

    return savedOutbound;
  }

  async findAll(): Promise<Outbound[]> {
    return await this.outboundRepository.find();
  }

  async findOne(id: string): Promise<Outbound> {
    const outbound = await this.outboundRepository.findOne({ where: { id } });
    if (!outbound) {
      throw new NotFoundException(`Outbound with ID ${id} not found`);
    }
    return outbound;
  }

  async update(
    id: string,
    updateOutboundDto: UpdateOutboundDto,
  ): Promise<Outbound> {
    const oldOutbound = await this.outboundRepository.findOne({
      where: { id },
    });
    if (!oldOutbound) {
      throw new NotFoundException(`Outbound with ID ${id} not found`);
    }

    const inventory = await this.inventoryService.findByItemCode(
      oldOutbound.itemCode,
    );

    if (!inventory) {
      throw new BadRequestException(
        `재고 정보를 찾을 수 없습니다. 품목 코드: ${oldOutbound.itemCode}`,
      );
    }

    // 수량 변경 시 재고 조정
    if (
      updateOutboundDto.quantity !== undefined &&
      updateOutboundDto.quantity !== oldOutbound.quantity
    ) {
      const quantityDiff = updateOutboundDto.quantity - oldOutbound.quantity;
      const newCurrentStock = inventory.currentStock - quantityDiff;

      if (newCurrentStock < 0) {
        throw new BadRequestException(
          `재고가 부족합니다. 현재 재고: ${inventory.currentStock}, 변경 후 수량: ${updateOutboundDto.quantity}`,
        );
      }

      const updateData: any = {
        currentStock: newCurrentStock,
      };
      // 출고일 변경 시 최종 출고일도 업데이트
      if (updateOutboundDto.outboundDate) {
        updateData.lastOutboundDate = updateOutboundDto.outboundDate;
      }
      await this.inventoryService.update(inventory.id, updateData);
    } else if (updateOutboundDto.outboundDate) {
      // 출고일만 변경된 경우에도 최종 출고일 업데이트
      await this.inventoryService.update(inventory.id, {
        lastOutboundDate: updateOutboundDto.outboundDate,
      });
    }

    // 품목 코드 변경 시 재고 정보도 업데이트
    if (
      updateOutboundDto.itemCode &&
      updateOutboundDto.itemCode !== oldOutbound.itemCode
    ) {
      // 기존 재고에 복구
      const oldInventory = await this.inventoryService.findByItemCode(
        oldOutbound.itemCode,
      );
      if (oldInventory) {
        const restoredStock = oldInventory.currentStock + oldOutbound.quantity;
        await this.inventoryService.update(oldInventory.id, {
          currentStock: restoredStock,
        });
      }

      // 새 재고에서 차감
      const newInventory = await this.inventoryService.findByItemCode(
        updateOutboundDto.itemCode,
      );
      if (!newInventory) {
        throw new BadRequestException(
          `재고 정보를 찾을 수 없습니다. 품목 코드: ${updateOutboundDto.itemCode}`,
        );
      }

      const quantityToDeduct =
        updateOutboundDto.quantity || oldOutbound.quantity;
      if (newInventory.currentStock < quantityToDeduct) {
        throw new BadRequestException(
          `재고가 부족합니다. 현재 재고: ${newInventory.currentStock}, 요청 수량: ${quantityToDeduct}`,
        );
      }

      const newCurrentStock = newInventory.currentStock - quantityToDeduct;
      const updateData: any = {
        currentStock: newCurrentStock,
      };
      // 출고일 변경 시 최종 출고일도 업데이트
      if (updateOutboundDto.outboundDate) {
        updateData.lastOutboundDate = updateOutboundDto.outboundDate;
      } else {
        updateData.lastOutboundDate = oldOutbound.outboundDate;
      }
      await this.inventoryService.update(newInventory.id, updateData);
    }

    Object.assign(oldOutbound, updateOutboundDto);
    return await this.outboundRepository.save(oldOutbound);
  }

  async remove(id: string): Promise<void> {
    const outbound = await this.outboundRepository.findOne({ where: { id } });
    if (!outbound) {
      throw new NotFoundException(`Outbound with ID ${id} not found`);
    }

    // 출고 삭제 시 재고 정보에 복구
    const inventory = await this.inventoryService.findByItemCode(
      outbound.itemCode,
    );
    if (inventory) {
      const restoredStock = inventory.currentStock + outbound.quantity;
      await this.inventoryService.update(inventory.id, {
        currentStock: restoredStock,
      });
    }

    await this.outboundRepository.remove(outbound);
  }
}
