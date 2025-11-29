import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Inventory } from './entities/inventory.entity';
import { CreateInventoryDto } from './dto/create-inventory.dto';
import { UpdateInventoryDto } from './dto/update-inventory.dto';

@Injectable()
export class InventoryService {
  constructor(
    @InjectRepository(Inventory)
    private readonly inventoryRepository: Repository<Inventory>,
  ) {}

  // 기존 메서드 (Items에서 사용)
  async create(
    itemCode: string,
    itemName: string,
    unit: string,
  ): Promise<Inventory> {
    const inventory = this.inventoryRepository.create({
      itemCode,
      itemName,
      currentStock: 0,
      safeStock: 10,
      unit,
      location: 'A-1-1',
      status: '정상',
      registeredDate: new Date().toISOString().split('T')[0],
      lastInboundDate: null,
      lastOutboundDate: null,
    });

    return await this.inventoryRepository.save(inventory);
  }

  // DTO를 사용하는 새로운 create 메서드
  async createFromDto(
    createInventoryDto: CreateInventoryDto,
  ): Promise<Inventory> {
    const inventory = this.inventoryRepository.create({
      itemCode: createInventoryDto.itemCode,
      itemName: createInventoryDto.itemName,
      currentStock: createInventoryDto.currentStock || 0,
      safeStock: createInventoryDto.safeStock || 10,
      unit: createInventoryDto.unit,
      location: createInventoryDto.location || 'A-1-1',
      status: createInventoryDto.status || '정상',
      registeredDate: new Date().toISOString().split('T')[0],
      lastInboundDate: null,
      lastOutboundDate: null,
    });

    return await this.inventoryRepository.save(inventory);
  }

  async findAll(): Promise<Inventory[]> {
    return await this.inventoryRepository.find();
  }

  async findOne(id: string): Promise<Inventory> {
    const inventory = await this.inventoryRepository.findOne({
      where: { id },
    });
    if (!inventory) {
      throw new NotFoundException(`Inventory with ID ${id} not found`);
    }
    return inventory;
  }

  async findByItemCode(itemCode: string): Promise<Inventory> {
    return await this.inventoryRepository.findOne({
      where: { itemCode },
    });
  }

  // 기존 메서드 (내부 사용)
  async update(id: string, updateData: Partial<Inventory>): Promise<Inventory> {
    const inventory = await this.inventoryRepository.findOne({
      where: { id },
    });
    if (!inventory) {
      return null;
    }

    Object.assign(inventory, updateData);
    return await this.inventoryRepository.save(inventory);
  }

  // DTO를 사용하는 새로운 update 메서드
  async updateFromDto(
    id: string,
    updateInventoryDto: UpdateInventoryDto,
  ): Promise<Inventory> {
    const inventory = await this.inventoryRepository.findOne({
      where: { id },
    });
    if (!inventory) {
      throw new NotFoundException(`Inventory with ID ${id} not found`);
    }

    Object.assign(inventory, updateInventoryDto);
    return await this.inventoryRepository.save(inventory);
  }

  async remove(id: string): Promise<void> {
    const inventory = await this.inventoryRepository.findOne({
      where: { id },
    });
    if (!inventory) {
      throw new NotFoundException(`Inventory with ID ${id} not found`);
    }

    await this.inventoryRepository.remove(inventory);
  }
}
