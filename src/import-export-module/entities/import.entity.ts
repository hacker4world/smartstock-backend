// src/import-export-module/entities/import.entity.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Supplier } from '../../supplier-manufacturer-module/entities/supplier.entity';
import { Manufacturer } from '../../supplier-manufacturer-module/entities/manufacturer.entity';
import { Account } from '../../accounts-module/entities/account.entity';
import { ImportItem } from './import-item.entity';

@Entity('imports')
export class Import {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'date' })
  date: Date;

  @Column({ type: 'varchar', length: 500, nullable: true })
  observation: string;

  @Column({ type: 'boolean', default: false })
  confirmed: boolean;

  @Column({ type: 'varchar', length: 255, name: 'bonDeCommande' })
  bonDeCommande: string;

  @Column({ type: 'varchar', length: 255, name: 'bonDeLivraison' })
  bonDeLivraison: string;

  @ManyToOne(() => Supplier, {
    nullable: false,
    eager: true,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'supplierId' })
  supplier: Supplier;

  @ManyToOne(() => Manufacturer, {
    nullable: false,
    eager: true,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'manufacturerId' })
  manufacturer: Manufacturer;

  @ManyToOne(() => Account, { nullable: true, eager: true })
  @JoinColumn({ name: 'accountId' })
  account: Account;

  @OneToMany(() => ImportItem, (importItem) => importItem.import, {
    cascade: true,
    eager: true,
  })
  importItems: ImportItem[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
