import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('warehouse')
export class Warehouse {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  warehouseCode: string;

  @Column()
  warehouseName: string;

  @Column()
  location: string;

  @Column('int')
  capacity: number;

  @Column('int', { default: 0 })
  currentStock: number;

  @Column()
  manager: string;

  @Column()
  phone: string;

  @Column({ type: 'text', nullable: true })
  description: string;
}
