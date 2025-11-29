import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateWarehouseDto } from './dto/create-warehouse.dto';
import { UpdateWarehouseDto } from './dto/update-warehouse.dto';
import { Warehouse } from './entities/warehouse.entity';

@Injectable()
export class WarehouseService {
  constructor(
    @InjectRepository(Warehouse)
    private readonly warehouseRepository: Repository<Warehouse>,
  ) {}

  async create(createWarehouseDto: CreateWarehouseDto): Promise<Warehouse> {
    // warehouseCode가 없거나 빈 문자열이면 자동 생성 (WH001 형식)
    let warehouseCode = createWarehouseDto.warehouseCode;
    if (!warehouseCode || warehouseCode.trim() === '') {
      // 기존 warehouseCode 중 가장 큰 번호 찾기
      const existingWarehouses = await this.warehouseRepository.find({
        where: {},
      });
      const existingCodes = existingWarehouses
        .map((warehouse) => warehouse.warehouseCode)
        .filter((code) => code && code.startsWith('WH'))
        .map((code) => {
          const match = code.match(/WH(\d+)/);
          return match ? parseInt(match[1], 10) : 0;
        });

      const maxNumber =
        existingCodes.length > 0 ? Math.max(...existingCodes) : 0;
      const nextNumber = maxNumber + 1;
      warehouseCode = `WH${String(nextNumber).padStart(3, '0')}`;
    }

    const warehouse = this.warehouseRepository.create({
      warehouseCode, // 자동 생성된 warehouseCode를 먼저 설정
      warehouseName: createWarehouseDto.warehouseName,
      location: createWarehouseDto.location,
      capacity: createWarehouseDto.capacity ?? 0, // capacity가 없으면 0으로 설정
      currentStock: createWarehouseDto.currentStock || 0,
      manager: createWarehouseDto.manager,
      phone: createWarehouseDto.phone,
      description: createWarehouseDto.description || '',
    });

    return await this.warehouseRepository.save(warehouse);
  }

  async findAll(): Promise<Warehouse[]> {
    return await this.warehouseRepository.find();
  }

  async findOne(id: string): Promise<Warehouse> {
    const warehouse = await this.warehouseRepository.findOne({
      where: { id },
    });
    if (!warehouse) {
      throw new NotFoundException(`Warehouse with ID ${id} not found`);
    }
    return warehouse;
  }

  async findByWarehouseCode(warehouseCode: string): Promise<Warehouse> {
    return await this.warehouseRepository.findOne({
      where: { warehouseCode },
    });
  }

  async update(
    id: string,
    updateWarehouseDto: UpdateWarehouseDto,
  ): Promise<Warehouse> {
    const warehouse = await this.warehouseRepository.findOne({
      where: { id },
    });
    if (!warehouse) {
      throw new NotFoundException(`Warehouse with ID ${id} not found`);
    }

    Object.assign(warehouse, updateWarehouseDto);
    return await this.warehouseRepository.save(warehouse);
  }

  async remove(id: string): Promise<void> {
    const warehouse = await this.warehouseRepository.findOne({
      where: { id },
    });
    if (!warehouse) {
      throw new NotFoundException(`Warehouse with ID ${id} not found`);
    }

    await this.warehouseRepository.remove(warehouse);
  }
}
