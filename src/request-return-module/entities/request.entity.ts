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
import { RequestItem } from './request-items.entity';
import { ConstructionSite } from 'src/construction-site-module/entities/construction-site.entity';
import { Account } from 'src/accounts-module/entities/account.entity';

@Entity()
export class ProductRequest {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'date' })
  date: Date;

  @Column({ type: 'varchar', length: 500, nullable: true })
  observation: string;

  @Column({ type: 'boolean', default: false })
  confirmed: boolean;

  @OneToMany(() => RequestItem, (requestItem) => requestItem.request, {
    cascade: true,
    eager: true,
  })
  requestItems: RequestItem[];

  @ManyToOne(() => ConstructionSite, {
    nullable: true,
    eager: true,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'constructionSiteId' })
  constructionSite: ConstructionSite;

  @ManyToOne(() => Account, { nullable: true, eager: true })
  @JoinColumn({ name: 'accountId' })
  account: Account;

  @Column({ type: 'varchar', length: 500, nullable: true })
  ficheExpedition: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
