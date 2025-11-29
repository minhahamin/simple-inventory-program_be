import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateInboundDto } from './dto/create-inbound.dto';
import { UpdateInboundDto } from './dto/update-inbound.dto';
import { Inbound } from './entities/inbound.entity';
import { InventoryService } from '../inventory/inventory.service';

@Injectable()
export class InboundService {
  private inbounds: Inbound[] = [];

  constructor(private readonly inventoryService: InventoryService) {}

  create(createInboundDto: CreateInboundDto): Inbound {
    const inbound: Inbound = {
      id: (this.inbounds.length + 1).toString(),
      inboundDate: createInboundDto.inboundDate || new Date().toISOString().split('T')[0],
      ...createInboundDto,
      memo: createInboundDto.memo || '',
    };

    this.inbounds.push(inbound);

    // 입고 시 재고 정보 업데이트
    const inventory = this.inventoryService.findByItemCode(inbound.itemCode);
    if (inventory) {
      const newCurrentStock = inventory.currentStock + inbound.quantity;
      this.inventoryService.update(inventory.id, {
        currentStock: newCurrentStock,
      });
    } else {
      // 재고 정보가 없으면 새로 생성
      this.inventoryService.create(
        inbound.itemCode,
        inbound.itemName,
        '개', // 기본값, 실제로는 Items에서 가져와야 함
      );
      const newInventory = this.inventoryService.findByItemCode(inbound.itemCode);
      if (newInventory) {
        this.inventoryService.update(newInventory.id, {
          currentStock: inbound.quantity,
        });
      }
    }

    return inbound;
  }

  findAll(): Inbound[] {
    return this.inbounds;
  }

  findOne(id: string): Inbound {
    const inbound = this.inbounds.find((inbound) => inbound.id === id);
    if (!inbound) {
      throw new NotFoundException(`Inbound with ID ${id} not found`);
    }
    return inbound;
  }

  update(id: string, updateInboundDto: UpdateInboundDto): Inbound {
    const index = this.inbounds.findIndex((inbound) => inbound.id === id);
    if (index === -1) {
      throw new NotFoundException(`Inbound with ID ${id} not found`);
    }

    const oldInbound = this.inbounds[index];
    const inventory = this.inventoryService.findByItemCode(oldInbound.itemCode);

    // 수량 변경 시 재고 조정
    if (updateInboundDto.quantity !== undefined && inventory) {
      const quantityDiff = updateInboundDto.quantity - oldInbound.quantity;
      const newCurrentStock = inventory.currentStock + quantityDiff;
      this.inventoryService.update(inventory.id, {
        currentStock: newCurrentStock,
      });
    }

    // 품목 코드 변경 시 재고 정보도 업데이트
    if (updateInboundDto.itemCode && updateInboundDto.itemCode !== oldInbound.itemCode) {
      // 기존 재고에서 차감
      if (inventory) {
        const newCurrentStock = inventory.currentStock - oldInbound.quantity;
        this.inventoryService.update(inventory.id, {
          currentStock: newCurrentStock,
        });
      }

      // 새 재고에 추가
      const newInventory = this.inventoryService.findByItemCode(updateInboundDto.itemCode);
      if (newInventory) {
        const newCurrentStock = newInventory.currentStock + (updateInboundDto.quantity || oldInbound.quantity);
        this.inventoryService.update(newInventory.id, {
          currentStock: newCurrentStock,
        });
      }
    }

    this.inbounds[index] = { ...oldInbound, ...updateInboundDto };
    return this.inbounds[index];
  }

  remove(id: string): void {
    const inbound = this.inbounds.find((inbound) => inbound.id === id);
    if (!inbound) {
      throw new NotFoundException(`Inbound with ID ${id} not found`);
    }

    const index = this.inbounds.findIndex((inbound) => inbound.id === id);
    this.inbounds.splice(index, 1);

    // 입고 삭제 시 재고 정보에서 차감
    const inventory = this.inventoryService.findByItemCode(inbound.itemCode);
    if (inventory) {
      const newCurrentStock = inventory.currentStock - inbound.quantity;
      this.inventoryService.update(inventory.id, {
        currentStock: newCurrentStock,
      });
    }
  }
}

