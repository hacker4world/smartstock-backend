// src/import-export-module/entities/export.entity.ts
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
import { Warehouse } from '../../configuration-module/entities/warehouse.entity';
import { ConstructionSite } from '../../construction-site-module/entities/construction-site.entity';
import { ExportItem } from './export-item.entity';

export enum ExportType {
  TO_WAREHOUSE = 'to-warehouse',
  TO_CONSTRUCTION_SITE = 'to-construction-site',
  EXTERNAL = 'external',
}

@Entity('exports')
export class Export {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'date' })
  date: Date;

  @Column({ type: 'varchar', length: 500, nullable: true })
  observation: string;

  @Column({ type: 'boolean', default: false })
  confirmed: boolean;

  @Column({ type: 'enum', enum: ExportType, name: 'export_type' })
  exportType: ExportType;

  // --- Warehouse relation (for to-warehouse) ---
  @ManyToOne(() => Warehouse, { nullable: true, eager: true })
  @JoinColumn({ name: 'warehouseId' })
  warehouse: Warehouse;

  // --- Construction site relation (for to-construction-site) ---
  @ManyToOne(() => ConstructionSite, { nullable: true, eager: true })
  @JoinColumn({ name: 'constructionSiteId' })
  constructionSite: ConstructionSite;

  // --- External export fields ---
  @Column({
    type: 'varchar',
    length: 255,
    nullable: true,
    name: 'entreprise_name',
  })
  entrepriseName: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  address: string;

  @Column({
    type: 'varchar',
    length: 255,
    nullable: true,
    name: 'matricule_fiscale',
  })
  matriculeFiscale: string;

  @Column({ type: 'varchar', length: 255, nullable: true, name: 'client_name' })
  clientName: string;

  // --- Transporter fields ---
  @Column({ type: 'boolean', default: false, name: 'with_transporter' })
  withTransporter: boolean;

  @Column({
    type: 'varchar',
    length: 255,
    nullable: true,
    name: 'transporter_name',
  })
  transporterName: string;

  @Column({
    type: 'varchar',
    length: 255,
    nullable: true,
    name: 'transporter_matricule',
  })
  transporterMatricule: string;

  // --- Items ---
  @OneToMany(() => ExportItem, (exportItem) => exportItem.export, {
    cascade: true,
    eager: true,
  })
  exportItems: ExportItem[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
