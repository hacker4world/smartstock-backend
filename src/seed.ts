import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { Role } from './roles-module/entities/Role.entity';
import { Permission } from './roles-module/entities/Permission.entity';
import { Account } from './accounts-module/entities/account.entity';
import { PermissionName } from './roles-module/permission.enum';
import { Product } from './product-module/entities/product.entity';
import { Unit } from './configuration-module/entities/unit.entity';
import { Warehouse } from './configuration-module/entities/warehouse.entity';
import { Category } from './classification-module/entities/category.entity';
import { Supplier } from './supplier-manufacturer-module/entities/supplier.entity';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);

  const roleRepository = app.get<Repository<Role>>(getRepositoryToken(Role));
  const permissionRepository = app.get<Repository<Permission>>(
    getRepositoryToken(Permission),
  );
  const accountRepository = app.get<Repository<Account>>(
    getRepositoryToken(Account),
  );
  const productRepository = app.get<Repository<Product>>(
    getRepositoryToken(Product),
  );
  const unitRepository = app.get<Repository<Unit>>(getRepositoryToken(Unit));
  const warehouseRepository = app.get<Repository<Warehouse>>(
    getRepositoryToken(Warehouse),
  );
  const categoryRepository = app.get<Repository<Category>>(
    getRepositoryToken(Category),
  );
  const supplierRepository = app.get<Repository<Supplier>>(
    getRepositoryToken(Supplier),
  );
  // ── Create "Super admin" role with all permissions ──
  let superAdminRole = await roleRepository.findOne({
    where: { name: 'Super admin' },
  });

  if (!superAdminRole) {
    superAdminRole = roleRepository.create({ name: 'Super admin' });
    superAdminRole = await roleRepository.save(superAdminRole);

    const allPermissionNames = Object.values(PermissionName);
    const permissionEntities = allPermissionNames.map((name) =>
      permissionRepository.create({ name, role: { id: superAdminRole!.id } }),
    );
    await permissionRepository.save(permissionEntities);

    console.log(
      `✅ Role "Super admin" created with ${allPermissionNames.length} permissions.`,
    );
  } else {
    console.log(
      'ℹ️  Role "Super admin" already exists, skipping role creation.',
    );
  }

  // ── Create super admin account ──
  const existingAccount = await accountRepository.findOne({
    where: { username: 'superadmin' },
  });

  if (!existingAccount) {
    const hashedPassword = await bcrypt.hash('admin123', 10);
    const superAdminAccount = accountRepository.create({
      firstname: 'Super',
      lastname: 'Admin',
      username: 'superadmin',
      password: hashedPassword,
      confirmed: true,
      role: { id: superAdminRole.id },
    });
    await accountRepository.save(superAdminAccount);

    console.log(
      '✅ Super admin account created (username: "superadmin", password: "admin123").',
    );
  } else {
    console.log(
      'ℹ️  Super admin account already exists, skipping account creation.',
    );
  // ── Create 20 fake products ──
  const existingProducts = await productRepository.count();

  if (existingProducts === 0) {
    // Fetch existing related entities to attach to the products (if any)
    const units = await unitRepository.find();
    const warehouses = await warehouseRepository.find();
    const categories = await categoryRepository.find();
    const suppliers = await supplierRepository.find();

    const productNames = [
      'Ciment Portland 42.5',
      'Sable de construction',
      'Gravier concassé',
      'Fer à béton 12mm',
      'Briques rouges',
      'Carrelage 60x60',
      'Peinture acrylique blanche',
      'Enduit de façade',
      'Tuyau PVC 110mm',
      'Câble électrique 2.5mm²',
      'Interrupteur simple',
      'Prise de courant double',
      'Plaque de plâtre BA13',
      'Laine de verre',
      'Parquet stratifié',
      'Porte intérieure en bois',
      'Fenêtre PVC double vitrage',
      'Robinet de lavabo',
      'WC suspendu',
      'Lavabo céramique',
    ];

    const products = productNames.map((name, index) => {
      const product = productRepository.create({
        name,
        stock: Math.round(Math.random() * 500),
        minimumStock: 10 + (index % 5) * 5,
        averagePrice: Math.round((5 + Math.random() * 200) * 100) / 100,
        unit: units.length ? { id: units[index % units.length].id } : undefined,
        warehouse: warehouses.length
          ? { id: warehouses[index % warehouses.length].id }
          : undefined,
        category: categories.length
          ? { id: categories[index % categories.length].id }
          : undefined,
        suppliers: suppliers.length
          ? [{ id: suppliers[index % suppliers.length].id }]
          : undefined,
      });
      return product;
    });

    await productRepository.save(products);
    console.log(`✅ ${products.length} fake products created.`);
  } else {
    console.log(
      `ℹ️  ${existingProducts} products already exist, skipping product seeding.`,
    );
  }

  await app.close();
}

bootstrap()
  .then(() => {
    console.log('🌱 Seeding complete!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  });
}