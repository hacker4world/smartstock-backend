// src/seed.ts

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DataSource, Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';

// Entities
import { Warehouse } from './configuration-module/entities/warehouse.entity';
import { Unit } from './configuration-module/entities/unit.entity';
import { Family } from './classification-module/entities/family.entity';
import { Subfamily } from './classification-module/entities/subfamily.entity';
import { Category } from './classification-module/entities/category.entity';
import { Supplier } from './supplier-manufacturer-module/entities/supplier.entity';
import { Manufacturer } from './supplier-manufacturer-module/entities/manufacturer.entity';
import { Account } from './accounts-module/entities/account.entity';
import { ConstructionSite } from './construction-site-module/entities/construction-site.entity';
import { AccountRole } from './common/enums/account-role.enum';
import { Product } from './product-module/entities/product.entity';

const SEED_COUNT = 40;
const DEFAULT_PASSWORD = '12345678';

async function seed() {
  const app = await NestFactory.createApplicationContext(AppModule);

  const dataSource = app.get(DataSource);

  // Get all repositories
  const warehouseRepo: Repository<Warehouse> =
    dataSource.getRepository(Warehouse);
  const unitRepo: Repository<Unit> = dataSource.getRepository(Unit);
  const familyRepo: Repository<Family> = dataSource.getRepository(Family);
  const subfamilyRepo: Repository<Subfamily> =
    dataSource.getRepository(Subfamily);
  const categoryRepo: Repository<Category> = dataSource.getRepository(Category);
  const supplierRepo: Repository<Supplier> = dataSource.getRepository(Supplier);
  const manufacturerRepo: Repository<Manufacturer> =
    dataSource.getRepository(Manufacturer);
  const accountRepo: Repository<Account> = dataSource.getRepository(Account);
  const constructionSiteRepo: Repository<ConstructionSite> =
    dataSource.getRepository(ConstructionSite);

  const productRepo: Repository<Product> = dataSource.getRepository(Product);

  // ─── Clear existing data in reverse dependency order ───────────────────────
  console.log('🗑️  Clearing existing data...');
  await constructionSiteRepo.deleteAll();
  await categoryRepo.deleteAll();
  await subfamilyRepo.deleteAll();
  await familyRepo.deleteAll();
  await supplierRepo.deleteAll();
  await manufacturerRepo.deleteAll();
  await unitRepo.deleteAll();
  await warehouseRepo.deleteAll();
  await accountRepo.deleteAll();
  await productRepo.deleteAll();
  console.log('✅ Existing data cleared.');

  // ─── 1. Seed Accounts (no dependencies) ────────────────────────────────────
  console.log('👤 Seeding accounts...');
  const hashedPassword = await bcrypt.hash(DEFAULT_PASSWORD, 10);
  const roles = Object.values(AccountRole);
  const accounts: Account[] = [];
  for (let i = 1; i <= SEED_COUNT; i++) {
    const account = accountRepo.create({
      firstname: `Firstname${i}`,
      lastname: `Lastname${i}`,
      username: `user${i}`,
      password: hashedPassword,
      role: roles[i % roles.length],
      confirmed: i % 3 !== 0, // some unconfirmed (~33%)
    });
    accounts.push(account);
  }
  await accountRepo.save(accounts);
  console.log(`✅ ${accounts.length} accounts seeded.`);

  // ─── 2. Seed Warehouses (no dependencies) ──────────────────────────────────
  console.log('🏭 Seeding warehouses...');
  const warehouses: Warehouse[] = [];
  for (let i = 1; i <= SEED_COUNT; i++) {
    const warehouse = warehouseRepo.create({
      name: `Warehouse ${i}`,
      address: `${i} Example Street, City ${i}`,
    });
    warehouses.push(warehouse);
  }
  await warehouseRepo.save(warehouses);
  console.log(`✅ ${warehouses.length} warehouses seeded.`);

  // ─── 3. Seed Units (no dependencies) ───────────────────────────────────────
  console.log('📏 Seeding units...');
  const unitNames = [
    'Piece',
    'Kilogram',
    'Gram',
    'Liter',
    'Milliliter',
    'Meter',
    'Square Meter',
    'Cubic Meter',
    'Box',
    'Pack',
    'Dozen',
    'Roll',
    'Sheet',
    'Bag',
    'Bottle',
    'Can',
    'Pallet',
    'Set',
    'Pair',
    'Bundle',
    'Carton',
    'Drum',
    'Tube',
    'Jar',
    'Case',
    'Spool',
    'Coil',
    'Reel',
    'Strip',
    'Bar',
    'Tablet',
    'Capsule',
    'Ampoule',
    'Vial',
    'Sachet',
    'Tin',
    'Bucket',
    'Crate',
    'Tank',
    'Container',
  ];
  const units: Unit[] = [];
  for (let i = 0; i < SEED_COUNT; i++) {
    const unit = unitRepo.create({
      name: unitNames[i % unitNames.length],
    });
    units.push(unit);
  }
  await unitRepo.save(units);
  console.log(`✅ ${units.length} units seeded.`);

  // ─── 4. Seed Families (no dependencies) ────────────────────────────────────
  console.log('📂 Seeding families...');
  const families: Family[] = [];
  for (let i = 1; i <= SEED_COUNT; i++) {
    const family = familyRepo.create({
      name: `Family ${i}`,
    });
    families.push(family);
  }
  await familyRepo.save(families);
  console.log(`✅ ${families.length} families seeded.`);

  // ─── 5. Seed Manufacturers (no dependencies) ───────────────────────────────
  console.log('🏭 Seeding manufacturers...');
  const manufacturers: Manufacturer[] = [];
  for (let i = 1; i <= SEED_COUNT; i++) {
    const manufacturer = manufacturerRepo.create({
      name: `Manufacturer ${i}`,
      contact: `contact${i}@manufacturer.com`,
      address: `${i} Industrial Zone, City ${i}`,
    });
    manufacturers.push(manufacturer);
  }
  await manufacturerRepo.save(manufacturers);
  console.log(`✅ ${manufacturers.length} manufacturers seeded.`);

  // ─── 6. Seed Suppliers (no dependencies) ───────────────────────────────────
  console.log('📦 Seeding suppliers...');
  const suppliers: Supplier[] = [];
  for (let i = 1; i <= SEED_COUNT; i++) {
    const supplier = supplierRepo.create({
      name: `Supplier ${i}`,
      contact: `supplier${i}@supply.com`,
    });
    suppliers.push(supplier);
  }
  await supplierRepo.save(suppliers);
  console.log(`✅ ${suppliers.length} suppliers seeded.`);

  // ─── 7. Seed Subfamilies (depends on Family) ───────────────────────────────
  console.log('📁 Seeding subfamilies...');
  const subfamilies: Subfamily[] = [];
  for (let i = 1; i <= SEED_COUNT; i++) {
    // Distribute subfamilies evenly across families
    const parentFamily = families[(i - 1) % families.length];
    const subfamily = subfamilyRepo.create({
      name: `Subfamily ${i}`,
      family: parentFamily,
    });
    subfamilies.push(subfamily);
  }
  await subfamilyRepo.save(subfamilies);
  console.log(`✅ ${subfamilies.length} subfamilies seeded.`);

  // ─── 8. Seed Categories (depends on Subfamily) ─────────────────────────────
  console.log('📄 Seeding categories...');
  const categories: Category[] = [];
  for (let i = 1; i <= SEED_COUNT; i++) {
    // Distribute categories evenly across subfamilies
    const parentSubfamily = subfamilies[(i - 1) % subfamilies.length];
    const category = categoryRepo.create({
      name: `Category ${i}`,
      subfamily: parentSubfamily,
    });
    categories.push(category);
  }
  await categoryRepo.save(categories);
  console.log(`✅ ${categories.length} categories seeded.`);

  // ─── 9. Seed Construction Sites (depends on Account) ───────────────────────
  console.log('🚧 Seeding construction sites...');
  const constructionSites: ConstructionSite[] = [];
  for (let i = 1; i <= SEED_COUNT; i++) {
    // Distribute managers evenly across accounts
    const manager = accounts[(i - 1) % accounts.length];
    const site = constructionSiteRepo.create({
      name: `Construction Site ${i}`,
      address: `${i} Building Road, District ${i}`,
      manager,
    });
    constructionSites.push(site);
  }
  await constructionSiteRepo.save(constructionSites);
  console.log(`✅ ${constructionSites.length} construction sites seeded.`);

  // ─── 10. Seed Products (depends on Unit, Warehouse, Category) ────────────────
  console.log('📦 Seeding products...');
  const productNames = [
    'Ciment Portland 42.5',
    'Sable fin lavé',
    'Gravier concassé 8/16',
    'Fer à béton 12mm',
    'Parpaing creux 20x20x40',
    'Carreau de plâtre',
    'Tuyau PVC 32mm',
    'Câble électrique 2.5mm²',
    'Peinture acrylique blanche',
    'Carrelage mural 30x60',
    'Robinet de lavabo',
    'Radiateur acier 1000W',
    'Porte blindée 2 vantaux',
    'Fenêtre PVC 120x120',
    'Tuile romane terre cuite',
    'Isolant laine de verre',
    'Panneau OSB 250x125',
    'Collage carrelage 25kg',
    'Joint silicone transparent',
    'Échafaudage roulant 2m',
  ];
  const products: Product[] = [];
  for (let i = 0; i < 20; i++) {
    const product = productRepo.create({
      name: productNames[i],
      stock: Math.floor(Math.random() * 500) + 10,
      minimumStock: Math.floor(Math.random() * 50) + 5,
      averagePrice: parseFloat((Math.random() * 200 + 1).toFixed(2)),
      unit: units[i % units.length],
      warehouse: warehouses[i % warehouses.length],
      category: categories[i % categories.length],
    });
    products.push(product);
  }
  await productRepo.save(products);
  console.log(`✅ ${products.length} products seeded.`);

  // ─── Summary ──────────────────────────────────────────────────────────────
  console.log('\n═══════════════════════════════════════════');
  console.log('🎉 Seeding completed successfully!');
  console.log(`   Accounts          : ${accounts.length}`);
  console.log(`   Warehouses        : ${warehouses.length}`);
  console.log(`   Units             : ${units.length}`);
  console.log(`   Families          : ${families.length}`);
  console.log(`   Subfamilies       : ${subfamilies.length}`);
  console.log(`   Categories        : ${categories.length}`);
  console.log(`   Manufacturers     : ${manufacturers.length}`);
  console.log(`   Suppliers         : ${suppliers.length}`);
  console.log(`   Construction Sites: ${constructionSites.length}`);
  console.log(`   Products          : ${products.length}`);
  console.log('═══════════════════════════════════════════\n');

  await app.close();
}

seed().catch((err) => {
  console.error('❌ Seed failed:', err);
  process.exit(1);
});
