import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateWarehouseDto } from './dto/create-warehouse.dto';
import { UpdateWarehouseDto } from './dto/update-warehouse.dto';
import { Warehouse } from './entities/warehouse.entity';

@Injectable()
export class WarehouseService {
  private warehouses: Warehouse[] = [];

  create(createWarehouseDto: CreateWarehouseDto): Warehouse {
    const warehouse: Warehouse = {
      id: (this.warehouses.length + 1).toString(),
      currentStock: createWarehouseDto.currentStock || 0,
      description: createWarehouseDto.description || '',
      ...createWarehouseDto,
    };

    this.warehouses.push(warehouse);
    return warehouse;
  }

  findAll(): Warehouse[] {
    return this.warehouses;
  }

  findOne(id: string): Warehouse {
    const warehouse = this.warehouses.find((warehouse) => warehouse.id === id);
    if (!warehouse) {
      throw new NotFoundException(`Warehouse with ID ${id} not found`);
    }
    return warehouse;
  }

  findByWarehouseCode(warehouseCode: string): Warehouse {
    return this.warehouses.find((warehouse) => warehouse.warehouseCode === warehouseCode);
  }

  update(id: string, updateWarehouseDto: UpdateWarehouseDto): Warehouse {
    const index = this.warehouses.findIndex((warehouse) => warehouse.id === id);
    if (index === -1) {
      throw new NotFoundException(`Warehouse with ID ${id} not found`);
    }

    this.warehouses[index] = { ...this.warehouses[index], ...updateWarehouseDto };
    return this.warehouses[index];
  }

  remove(id: string): void {
    const warehouse = this.warehouses.find((warehouse) => warehouse.id === id);
    if (!warehouse) {
      throw new NotFoundException(`Warehouse with ID ${id} not found`);
    }

    const index = this.warehouses.findIndex((warehouse) => warehouse.id === id);
    this.warehouses.splice(index, 1);
  }
}

