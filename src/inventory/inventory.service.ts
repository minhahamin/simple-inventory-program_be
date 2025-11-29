import { Injectable } from '@nestjs/common';
import { Inventory } from './entities/inventory.entity';

@Injectable()
export class InventoryService {
  private inventories: Inventory[] = [];

  create(itemCode: string, itemName: string, unit: string): Inventory {
    const inventory: Inventory = {
      id: (this.inventories.length + 1).toString(),
      itemCode,
      itemName,
      currentStock: 0,
      safeStock: 10,
      unit,
      location: 'A-1-1',
      status: '정상',
      registeredDate: new Date().toISOString().split('T')[0],
    };

    this.inventories.push(inventory);
    return inventory;
  }

  findAll(): Inventory[] {
    return this.inventories;
  }

  findOne(id: string): Inventory {
    return this.inventories.find((inv) => inv.id === id);
  }

  findByItemCode(itemCode: string): Inventory {
    return this.inventories.find((inv) => inv.itemCode === itemCode);
  }

  update(id: string, updateData: Partial<Inventory>): Inventory {
    const index = this.inventories.findIndex((inv) => inv.id === id);
    if (index === -1) {
      return null;
    }

    this.inventories[index] = { ...this.inventories[index], ...updateData };
    return this.inventories[index];
  }

  remove(id: string): boolean {
    const index = this.inventories.findIndex((inv) => inv.id === id);
    if (index === -1) {
      return false;
    }

    this.inventories.splice(index, 1);
    return true;
  }
}

