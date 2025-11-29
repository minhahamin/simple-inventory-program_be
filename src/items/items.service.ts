import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateItemDto } from './dto/create-item.dto';
import { UpdateItemDto } from './dto/update-item.dto';
import { Item } from './entities/item.entity';
import { InventoryService } from '../inventory/inventory.service';

@Injectable()
export class ItemsService {
  constructor(
    @InjectRepository(Item)
    private readonly itemsRepository: Repository<Item>,
    private readonly inventoryService: InventoryService,
  ) {}

  async create(createItemDto: CreateItemDto): Promise<Item> {
    // itemCode가 없거나 빈 문자열이면 자동 생성 (ITEM001 형식)
    let itemCode = createItemDto.itemCode;
    if (!itemCode || itemCode.trim() === '') {
      // 기존 itemCode 중 가장 큰 번호 찾기
      const existingItems = await this.itemsRepository.find({
        where: {},
      });
      const existingCodes = existingItems
        .map((item) => item.itemCode)
        .filter((code) => code && code.startsWith('ITEM'))
        .map((code) => {
          const match = code.match(/ITEM(\d+)/);
          return match ? parseInt(match[1], 10) : 0;
        });

      const maxNumber =
        existingCodes.length > 0 ? Math.max(...existingCodes) : 0;
      const nextNumber = maxNumber + 1;
      itemCode = `ITEM${String(nextNumber).padStart(3, '0')}`;
    }

    // createItemDto에서 itemCode를 제외하고 spread
    const { itemCode: _, ...restDto } = createItemDto;

    const item = this.itemsRepository.create({
      ...restDto,
      itemCode, // 자동 생성된 itemCode를 마지막에 설정
      registeredDate: new Date().toISOString().split('T')[0],
    });

    const savedItem = await this.itemsRepository.save(item);

    // 품목 등록 시 재고 정보도 자동 생성
    await this.inventoryService.create(
      savedItem.itemCode,
      savedItem.itemName,
      savedItem.unit,
    );

    return savedItem;
  }

  async findAll(): Promise<Item[]> {
    return await this.itemsRepository.find();
  }

  async findOne(id: string): Promise<Item> {
    const item = await this.itemsRepository.findOne({ where: { id } });
    if (!item) {
      throw new NotFoundException(`Item with ID ${id} not found`);
    }
    return item;
  }

  async update(id: string, updateItemDto: UpdateItemDto): Promise<Item> {
    const item = await this.itemsRepository.findOne({ where: { id } });
    if (!item) {
      throw new NotFoundException(`Item with ID ${id} not found`);
    }

    const inventory = await this.inventoryService.findByItemCode(item.itemCode);

    // 품목 정보 업데이트
    Object.assign(item, updateItemDto);
    const updatedItem = await this.itemsRepository.save(item);

    // 재고 정보도 함께 업데이트 (itemName, unit 변경 시)
    if (updateItemDto.itemName || updateItemDto.unit) {
      if (inventory) {
        await this.inventoryService.update(inventory.id, {
          itemName: updateItemDto.itemName || inventory.itemName,
          unit: updateItemDto.unit || inventory.unit,
        });
      }
    }

    return updatedItem;
  }

  async remove(id: string): Promise<void> {
    const item = await this.itemsRepository.findOne({ where: { id } });
    if (!item) {
      throw new NotFoundException(`Item with ID ${id} not found`);
    }

    // 재고 정보도 함께 삭제
    const inventory = await this.inventoryService.findByItemCode(item.itemCode);
    if (inventory) {
      await this.inventoryService.remove(inventory.id);
    }

    await this.itemsRepository.remove(item);
  }
}
