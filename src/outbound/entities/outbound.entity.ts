import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('outbound')
export class Outbound {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'date' })
  outboundDate: string;

  @Column()
  itemCode: string;

  @Column()
  itemName: string;

  @Column('int')
  quantity: number;

  @Column('decimal', { precision: 10, scale: 2 })
  unitPrice: number;

  @Column()
  customer: string;

  @Column({ type: 'text', nullable: true })
  memo: string;
}
