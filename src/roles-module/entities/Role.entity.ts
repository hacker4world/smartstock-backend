import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Permission } from './Permission.entity';
import { Account } from '../../accounts-module/entities/account.entity';

@Entity()
export class Role {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => Permission, (permission) => permission.role, {
    cascade: true,
    eager: true,
  })
  permissions: Permission[];

  @OneToMany(() => Account, (account) => account.role)
  accounts: Account[];
}
