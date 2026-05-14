import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToMany,
  JoinTable,
} from 'typeorm';
import { Unit } from '../../configuration-module/entities/unit.entity';
import { Warehouse } from '../../configuration-module/entities/warehouse.entity';
import { Category } from '../../classification-module/entities/category.entity';
import { Supplier } from 'src/supplier-manufacturer-module/entities/supplier.entity';

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

  @ManyToOne(() => Unit, { nullable: true, eager: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'unitId' })
  unit: Unit;

  @ManyToOne(() => Warehouse, {
    nullable: true,
    eager: true,
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'warehouseId' })
  warehouse: Warehouse;

  @ManyToOne(() => Category, {
    nullable: true,
    eager: true,
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'categoryId' })
  category: Category;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToMany(() => Supplier, (supplier) => supplier.products)
  @JoinTable({
    name: 'product_suppliers',
    joinColumn: { name: 'productId', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'supplierId', referencedColumnName: 'id' },
  })
  suppliers: Supplier[];
}
