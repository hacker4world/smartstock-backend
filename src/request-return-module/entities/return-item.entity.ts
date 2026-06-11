// src/returns-module/entities/return-item.entity.ts
import { Product } from 'src/product-module/entities/product.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Return } from './return.entity';

@Entity()
export class ReturnItem {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  returnedStock: number;

  @Column({ type: 'varchar', length: 500, nullable: true })
  reason: string;

  @ManyToOne(() => Product, { nullable: false, eager: true })
  @JoinColumn({ name: 'productId' })
  product: Product;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => Return, (returnEntity) => returnEntity.returnItems, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'returnId' })
  return: Return;
}
