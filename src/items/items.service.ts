import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateItemDto } from './dto/create-item.dto';
import { UpdateItemDto } from './dto/update-item.dto';
import { Item } from './entities/item.entity';
import { InventoryService } from '../inventory/inventory.service';

@Injectable()
export class ItemsService {
  private items: Item[] = [];

  constructor(private readonly inventoryService: InventoryService) {}

  create(createItemDto: CreateItemDto): Item {
    const item: Item = {
      id: (this.items.length + 1).toString(),
      ...createItemDto,
      registeredDate: new Date().toISOString().split('T')[0],
    };

    this.items.push(item);

    // 품목 등록 시 재고 정보도 자동 생성
    this.inventoryService.create(
      item.itemCode,
      item.itemName,
      item.unit,
    );

    return item;
  }

  findAll(): Item[] {
    return this.items;
  }

  findOne(id: string): Item {
    const item = this.items.find((item) => item.id === id);
    if (!item) {
      throw new NotFoundException(`Item with ID ${id} not found`);
    }
    return item;
  }

  update(id: string, updateItemDto: UpdateItemDto): Item {
    const index = this.items.findIndex((item) => item.id === id);
    if (index === -1) {
      throw new NotFoundException(`Item with ID ${id} not found`);
    }

    const item = this.items[index];
    const inventory = this.inventoryService.findByItemCode(item.itemCode);

    // 품목 정보 업데이트
    this.items[index] = { ...item, ...updateItemDto };

    // 재고 정보도 함께 업데이트 (itemName, unit 변경 시)
    if (updateItemDto.itemName || updateItemDto.unit) {
      if (inventory) {
        this.inventoryService.update(inventory.id, {
          itemName: updateItemDto.itemName || inventory.itemName,
          unit: updateItemDto.unit || inventory.unit,
        });
      }
    }

    return this.items[index];
  }

  remove(id: string): void {
    const item = this.items.find((item) => item.id === id);
    if (!item) {
      throw new NotFoundException(`Item with ID ${id} not found`);
    }

    const index = this.items.findIndex((item) => item.id === id);
    this.items.splice(index, 1);

    // 재고 정보도 함께 삭제
    const inventory = this.inventoryService.findByItemCode(item.itemCode);
    if (inventory) {
      this.inventoryService.remove(inventory.id);
    }
  }
}

