import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateInboundDto } from './dto/create-inbound.dto';
import { UpdateInboundDto } from './dto/update-inbound.dto';
import { Inbound } from './entities/inbound.entity';
import { InventoryService } from '../inventory/inventory.service';

@Injectable()
export class InboundService {
  constructor(
    @InjectRepository(Inbound)
    private readonly inboundRepository: Repository<Inbound>,
    private readonly inventoryService: InventoryService,
  ) {}

  async create(createInboundDto: CreateInboundDto): Promise<Inbound> {
    const inbound = this.inboundRepository.create({
      inboundDate: new Date().toISOString().split('T')[0],
      ...createInboundDto,
      memo: createInboundDto.memo || '',
    });

    const savedInbound = await this.inboundRepository.save(inbound);

    // 입고 시 재고 정보 업데이트
    const inventory = await this.inventoryService.findByItemCode(
      savedInbound.itemCode,
    );
    if (inventory) {
      const newCurrentStock = inventory.currentStock + savedInbound.quantity;
      await this.inventoryService.update(inventory.id, {
        currentStock: newCurrentStock,
        lastInboundDate: savedInbound.inboundDate, // 최종 입고일 업데이트
      });
    } else {
      // 재고 정보가 없으면 새로 생성
      await this.inventoryService.create(
        savedInbound.itemCode,
        savedInbound.itemName,
        '개', // 기본값, 실제로는 Items에서 가져와야 함
      );
      const newInventory = await this.inventoryService.findByItemCode(
        savedInbound.itemCode,
      );
      if (newInventory) {
        await this.inventoryService.update(newInventory.id, {
          currentStock: savedInbound.quantity,
          lastInboundDate: savedInbound.inboundDate, // 최종 입고일 설정
        });
      }
    }

    return savedInbound;
  }

  async findAll(): Promise<Inbound[]> {
    return await this.inboundRepository.find();
  }

  async findOne(id: string): Promise<Inbound> {
    const inbound = await this.inboundRepository.findOne({ where: { id } });
    if (!inbound) {
      throw new NotFoundException(`Inbound with ID ${id} not found`);
    }
    return inbound;
  }

  async update(id: string, updateInboundDto: UpdateInboundDto): Promise<Inbound> {
    const oldInbound = await this.inboundRepository.findOne({ where: { id } });
    if (!oldInbound) {
      throw new NotFoundException(`Inbound with ID ${id} not found`);
    }

    const inventory = await this.inventoryService.findByItemCode(
      oldInbound.itemCode,
    );

    // 수량 변경 시 재고 조정
    if (updateInboundDto.quantity !== undefined && inventory) {
      const quantityDiff = updateInboundDto.quantity - oldInbound.quantity;
      const newCurrentStock = inventory.currentStock + quantityDiff;
      const updateData: any = {
        currentStock: newCurrentStock,
      };
      // 입고일 변경 시 최종 입고일도 업데이트
      if (updateInboundDto.inboundDate) {
        updateData.lastInboundDate = updateInboundDto.inboundDate;
      }
      await this.inventoryService.update(inventory.id, updateData);
    } else if (updateInboundDto.inboundDate && inventory) {
      // 입고일만 변경된 경우에도 최종 입고일 업데이트
      await this.inventoryService.update(inventory.id, {
        lastInboundDate: updateInboundDto.inboundDate,
      });
    }

    // 품목 코드 변경 시 재고 정보도 업데이트
    if (
      updateInboundDto.itemCode &&
      updateInboundDto.itemCode !== oldInbound.itemCode
    ) {
      // 기존 재고에서 차감
      if (inventory) {
        const newCurrentStock = inventory.currentStock - oldInbound.quantity;
        await this.inventoryService.update(inventory.id, {
          currentStock: newCurrentStock,
        });
      }

      // 새 재고에 추가
      const newInventory = await this.inventoryService.findByItemCode(
        updateInboundDto.itemCode,
      );
      if (newInventory) {
        const newCurrentStock =
          newInventory.currentStock +
          (updateInboundDto.quantity || oldInbound.quantity);
        await this.inventoryService.update(newInventory.id, {
          currentStock: newCurrentStock,
        });
      }
    }

    Object.assign(oldInbound, updateInboundDto);
    return await this.inboundRepository.save(oldInbound);
  }

  async remove(id: string): Promise<void> {
    const inbound = await this.inboundRepository.findOne({ where: { id } });
    if (!inbound) {
      throw new NotFoundException(`Inbound with ID ${id} not found`);
    }

    // 입고 삭제 시 재고 정보에서 차감
    const inventory = await this.inventoryService.findByItemCode(
      inbound.itemCode,
    );
    if (inventory) {
      const newCurrentStock = inventory.currentStock - inbound.quantity;
      await this.inventoryService.update(inventory.id, {
        currentStock: newCurrentStock,
      });
    }

    await this.inboundRepository.remove(inbound);
  }
}
