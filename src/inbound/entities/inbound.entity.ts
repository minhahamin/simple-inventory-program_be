import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('inbound')
export class Inbound {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'date' })
  inboundDate: string;

  @Column()
  itemCode: string;

  @Column()
  itemName: string;

  @Column('int')
  quantity: number;

  @Column('decimal', { precision: 10, scale: 2 })
  unitPrice: number;

  @Column()
  supplier: string;

  @Column({ type: 'text', nullable: true })
  memo: string;
}
