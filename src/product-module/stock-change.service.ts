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
}
