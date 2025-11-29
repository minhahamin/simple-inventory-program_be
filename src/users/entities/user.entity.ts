import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  userId: string;

  @Column()
  userName: string;

  @Column()
  role: string;

  @Column()
  department: string;

  @Column()
  email: string;

  @Column({ default: '활성' })
  status: string;

  @Column({ type: 'text', nullable: true })
  description: string;
}
