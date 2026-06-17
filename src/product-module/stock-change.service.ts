// stock-change.service.ts
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { StockChange, StockChangeSource } from './entities/stock-change.entity';
import { Product } from './entities/product.entity';

@Injectable()
export class StockChangeService {
  constructor(
    @InjectRepository(StockChange)
    private readonly repo: Repository<StockChange>,
    @InjectRepository(Product)
    private readonly productRepo: Repository<Product>,
  ) {}

  async create(data: {
    productId: number;
    source: StockChangeSource;
    change: number;
    newStock: number;
    date: Date;
    referenceId?: number;
    referenceType?: string;
  }): Promise<StockChange> {
    const product = await this.productRepo.findOne({
      where: { id: data.productId },
    });

    const entry = await this.repo.save({
      product: product,
      source: data.source,
      change: data.change,
      newStock: data.newStock,
      date: data.date,
      referenceId: data.referenceId ?? null,
      referenceType: data.referenceType ?? null,
    });
    return this.repo.save(entry);
  }

  async getHistoryByProductId(productId: number): Promise<StockChange[]> {
    return this.repo.find({
      where: { product: { id: productId } }, // nested relation filter
      order: { date: 'ASC' },
    });
  }
}
