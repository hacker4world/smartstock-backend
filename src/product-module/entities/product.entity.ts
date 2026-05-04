import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Unit } from '../../configuration-module/entities/unit.entity';
import { Warehouse } from '../../configuration-module/entities/warehouse.entity';
import { Category } from '../../classification-module/entities/category.entity';

@Entity('products')
export class Product {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  stock: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  minimumStock: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  averagePrice: number;

  @ManyToOne(() => Unit, { nullable: false })
  @JoinColumn({ name: 'unitId' })
  unit: Unit;

  @ManyToOne(() => Warehouse, { nullable: false })
  @JoinColumn({ name: 'warehouseId' })
  warehouse: Warehouse;

  @ManyToOne(() => Category, { nullable: false })
  @JoinColumn({ name: 'categoryId' })
  category: Category;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
