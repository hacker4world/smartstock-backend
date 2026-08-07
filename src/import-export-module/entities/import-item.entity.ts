// src/import-export-module/entities/import-item.entity.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Import } from './import.entity';
import { Product } from '../../product-module/entities/product.entity';

@Entity('import_items')
export class ImportItem {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  enteredStock: number;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  unitPrice: number;

  @ManyToOne(() => Import, (importEntity) => importEntity.importItems, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'importId' })
  import: Import;

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
