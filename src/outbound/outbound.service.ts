import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { CreateOutboundDto } from './dto/create-outbound.dto';
import { UpdateOutboundDto } from './dto/update-outbound.dto';
import { Outbound } from './entities/outbound.entity';
import { InventoryService } from '../inventory/inventory.service';

@Injectable()
export class OutboundService {
  private outbounds: Outbound[] = [];

  constructor(private readonly inventoryService: InventoryService) {}

  create(createOutboundDto: CreateOutboundDto): Outbound {
    const outbound: Outbound = {
      id: (this.outbounds.length + 1).toString(),
      outboundDate: createOutboundDto.outboundDate || new Date().toISOString().split('T')[0],
      ...createOutboundDto,
      memo: createOutboundDto.memo || '',
    };

    // 출고 시 재고 확인 및 차감
    const inventory = this.inventoryService.findByItemCode(outbound.itemCode);
    if (!inventory) {
      throw new BadRequestException(`재고 정보를 찾을 수 없습니다. 품목 코드: ${outbound.itemCode}`);
    }

    if (inventory.currentStock < outbound.quantity) {
      throw new BadRequestException(
        `재고가 부족합니다. 현재 재고: ${inventory.currentStock}, 요청 수량: ${outbound.quantity}`,
      );
    }

    const newCurrentStock = inventory.currentStock - outbound.quantity;
    this.inventoryService.update(inventory.id, {
      currentStock: newCurrentStock,
    });

    this.outbounds.push(outbound);
    return outbound;
  }

  findAll(): Outbound[] {
    return this.outbounds;
  }

  findOne(id: string): Outbound {
    const outbound = this.outbounds.find((outbound) => outbound.id === id);
    if (!outbound) {
      throw new NotFoundException(`Outbound with ID ${id} not found`);
    }
    return outbound;
  }

  update(id: string, updateOutboundDto: UpdateOutboundDto): Outbound {
    const index = this.outbounds.findIndex((outbound) => outbound.id === id);
    if (index === -1) {
      throw new NotFoundException(`Outbound with ID ${id} not found`);
    }

    const oldOutbound = this.outbounds[index];
    const inventory = this.inventoryService.findByItemCode(oldOutbound.itemCode);

    if (!inventory) {
      throw new BadRequestException(`재고 정보를 찾을 수 없습니다. 품목 코드: ${oldOutbound.itemCode}`);
    }

    // 수량 변경 시 재고 조정
    if (updateOutboundDto.quantity !== undefined && updateOutboundDto.quantity !== oldOutbound.quantity) {
      const quantityDiff = updateOutboundDto.quantity - oldOutbound.quantity;
      const newCurrentStock = inventory.currentStock - quantityDiff;

      if (newCurrentStock < 0) {
        throw new BadRequestException(
          `재고가 부족합니다. 현재 재고: ${inventory.currentStock}, 변경 후 수량: ${updateOutboundDto.quantity}`,
        );
      }

      this.inventoryService.update(inventory.id, {
        currentStock: newCurrentStock,
      });
    }

    // 품목 코드 변경 시 재고 정보도 업데이트
    if (updateOutboundDto.itemCode && updateOutboundDto.itemCode !== oldOutbound.itemCode) {
      // 기존 재고에 복구
      const oldInventory = this.inventoryService.findByItemCode(oldOutbound.itemCode);
      if (oldInventory) {
        const restoredStock = oldInventory.currentStock + oldOutbound.quantity;
        this.inventoryService.update(oldInventory.id, {
          currentStock: restoredStock,
        });
      }

      // 새 재고에서 차감
      const newInventory = this.inventoryService.findByItemCode(updateOutboundDto.itemCode);
      if (!newInventory) {
        throw new BadRequestException(`재고 정보를 찾을 수 없습니다. 품목 코드: ${updateOutboundDto.itemCode}`);
      }

      const quantityToDeduct = updateOutboundDto.quantity || oldOutbound.quantity;
      if (newInventory.currentStock < quantityToDeduct) {
        throw new BadRequestException(
          `재고가 부족합니다. 현재 재고: ${newInventory.currentStock}, 요청 수량: ${quantityToDeduct}`,
        );
      }

      const newCurrentStock = newInventory.currentStock - quantityToDeduct;
      this.inventoryService.update(newInventory.id, {
        currentStock: newCurrentStock,
      });
    }

    this.outbounds[index] = { ...oldOutbound, ...updateOutboundDto };
    return this.outbounds[index];
  }

  remove(id: string): void {
    const outbound = this.outbounds.find((outbound) => outbound.id === id);
    if (!outbound) {
      throw new NotFoundException(`Outbound with ID ${id} not found`);
    }

    const index = this.outbounds.findIndex((outbound) => outbound.id === id);
    this.outbounds.splice(index, 1);

    // 출고 삭제 시 재고 정보에 복구
    const inventory = this.inventoryService.findByItemCode(outbound.itemCode);
    if (inventory) {
      const restoredStock = inventory.currentStock + outbound.quantity;
      this.inventoryService.update(inventory.id, {
        currentStock: restoredStock,
      });
    }
  }
}

