import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('status')
export class Status {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  userId: number;

  @Column({ length: 50 })
  userType: string; // 'admin' or 'user'

  @Column({ length: 100 })
  action: string; // e.g., 'order_created', 'order_updated', 'product_added'

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ default: false })
  isRead: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
