// src/returns-module/entities/return.entity.ts
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ReturnItem } from './return-item.entity';
import { ConstructionSite } from 'src/construction-site-module/entities/construction-site.entity';
import { Account } from 'src/accounts-module/entities/account.entity';

@Entity()
export class Return {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'date' })
  date: Date;

  @Column({ type: 'varchar', length: 500, nullable: true })
  observation: string;

  @Column({ type: 'boolean', default: false })
  confirmed: boolean;

  @OneToMany(() => ReturnItem, (item) => item.return, {
    cascade: true,
    eager: true,
  })
  returnItems: ReturnItem[];

  @ManyToOne(() => ConstructionSite, { nullable: true, eager: true })
  @JoinColumn({ name: 'constructionSiteId' })
  constructionSite: ConstructionSite;

  @ManyToOne(() => Account, { nullable: true, eager: true })
  @JoinColumn({ name: 'accountId' })
  account: Account;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
