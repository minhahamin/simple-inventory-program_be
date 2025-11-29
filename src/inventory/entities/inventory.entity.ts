import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('inventory')
export class Inventory {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  itemCode: string;

  @Column()
  itemName: string;

  @Column('int', { default: 0 })
  currentStock: number;

  @Column('int', { default: 10 })
  safeStock: number;

  @Column()
  unit: string;

  @Column()
  location: string;

  @Column({ default: '정상' })
  status: string;

  @Column({ type: 'date' })
  registeredDate: string;

  @Column({ type: 'date', nullable: true })
  lastInboundDate: string;

  @Column({ type: 'date', nullable: true })
  lastOutboundDate: string;
}
