// src/import-export-module/entities/export-item.entity.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Export } from './export.entity';
import { Product } from '../../product-module/entities/product.entity';

@Entity('export_items')
export class ExportItem {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  exitedStock: number;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  unitPrice: number;

  @ManyToOne(() => Export, (exportEntity) => exportEntity.exportItems, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'exportId' })
  export: Export;

  @ManyToOne(() => Product, {
    nullable: false,
    eager: true,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'productId' })
  product: Product;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
