import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { Role } from './roles-module/entities/Role.entity';
import { Permission } from './roles-module/entities/Permission.entity';
import { Account } from './accounts-module/entities/account.entity';
import { PermissionName } from './roles-module/permission.enum';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);

  const roleRepository = app.get<Repository<Role>>(getRepositoryToken(Role));
  const permissionRepository = app.get<Repository<Permission>>(
    getRepositoryToken(Permission),
  );
  const accountRepository = app.get<Repository<Account>>(
    getRepositoryToken(Account),
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
