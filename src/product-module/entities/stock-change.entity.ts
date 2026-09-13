// stock-change.entity.ts
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Product } from '../../product-module/entities/product.entity';

export enum StockChangeSource {
  INITIAL = 'initial',
  IMPORT = 'import',
  EXPORT = 'export',
  RETURN = 'return',
  MANUAL_ADJUSTMENT = 'manual_adjustment',
}

@Entity('stock_changes')
export class StockChange {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Product, { nullable: false, onDelete: 'CASCADE' })
  product: Product; // ← relation, FK column `productId` is auto‑created by TypeORM

  @Column({ type: 'enum', enum: StockChangeSource })
  source: StockChangeSource;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  change: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  newStock: number;

  @Column({ type: 'date' })
  date: Date;

  @Column({ type: 'int', nullable: true })
  referenceId: number;

  @Column({ type: 'varchar', length: 50, nullable: true })
  referenceType: string;

  @CreateDateColumn()
  createdAt: Date;
}
