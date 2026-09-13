import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Role } from './entities/Role.entity';
import { Permission } from './entities/Permission.entity';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import {
  SuccessResponse,
  successResponse,
} from '../common/utils/success-response';

@Injectable()
export class RolesService {
  constructor(
    @InjectRepository(Role)
    private readonly roleRepository: Repository<Role>,
    @InjectRepository(Permission)
    private readonly permissionRepository: Repository<Permission>,
  ) {}

  async create(createRoleDto: CreateRoleDto): Promise<SuccessResponse<Role>> {
    const { name, permissions } = createRoleDto;

    // Check if role name already exists
    const existingRole = await this.roleRepository.findOne({
      where: { name },
    });
    if (existingRole) {
      throw new ConflictException(`Un rôle avec le nom "${name}" existe déjà`);
    }

    // Create the role
    const role = this.roleRepository.create({ name });
    const savedRole = await this.roleRepository.save(role);

    // Create associated permissions
    if (permissions && permissions.length > 0) {
      const permissionEntities = permissions.map((permName) =>
        this.permissionRepository.create({
          name: permName,
          role: savedRole,
        }),
      );
      await this.permissionRepository.save(permissionEntities);
    }

    // Return role with permissions
    const roleWithPermissions = await this.roleRepository.findOne({
      where: { id: savedRole.id },
      relations: ['permissions'],
    }) as Role;

    return successResponse(roleWithPermissions, 'Rôle créé avec succès');
  }

  async findAll(): Promise<SuccessResponse<Role[]>> {
    const roles = await this.roleRepository.find({
      relations: ['permissions'],
    });
    return successResponse(roles, 'Rôles récupérés avec succès');
  }

  async findOne(id: number): Promise<SuccessResponse<Role>> {
    // Explicitly check if id is valid (optional, as controller uses ParseIntPipe)
    if (!id || isNaN(id)) {
      throw new NotFoundException(`ID de rôle invalide`);
    }

    const role = await this.roleRepository.findOne({
      where: { id },
      relations: ['permissions'],
    });

    if (!role) {
      throw new NotFoundException(`Rôle avec l'ID ${id} introuvable`);
    }
    return successResponse(role, 'Rôle récupéré avec succès');
  }

  async update(
    id: number,
    updateRoleDto: UpdateRoleDto,
  ): Promise<SuccessResponse<Role>> {
    // First, ensure the role exists
    const roleResponse = await this.findOne(id);
    const role = roleResponse.data;

    // Double-check that role is not null (should never be, but just in case)
    if (!role) {
      throw new NotFoundException(`Rôle avec l'ID ${id} introuvable`);
    }

    // Update name if provided
    if (updateRoleDto.name) {
      const existingRole = await this.roleRepository.findOne({
        where: { name: updateRoleDto.name },
      });
      if (existingRole && existingRole.id !== id) {
        throw new ConflictException(
          `Un rôle avec le nom "${updateRoleDto.name}" existe déjà`,
        );
      }
      role.name = updateRoleDto.name;
      await this.roleRepository.save(role);
    }

    // Update permissions if provided (replace all)
    if (updateRoleDto.permissions) {
      // Remove existing permissions for this role
      await this.permissionRepository.delete({ role: { id } });

      // Create new permissions
      const permissionEntities = updateRoleDto.permissions.map((permName) =>
        this.permissionRepository.create({
          name: permName,
          role: role,
        }),
      );
      await this.permissionRepository.save(permissionEntities);
    }

    // Return updated role with permissions
    const updatedRole = await this.roleRepository.findOne({
      where: { id },
      relations: ['permissions'],
    }) as Role;

    return successResponse(updatedRole, 'Rôle mis à jour avec succès');
  }

  async remove(id: number): Promise<SuccessResponse<null>> {
    // Ensure role exists before deletion
    const roleResponse = await this.findOne(id);
    const role = roleResponse.data;

    if (!role) {
      throw new NotFoundException(`Rôle avec l'ID ${id} introuvable`);
    }

    // Delete associated permissions first
    await this.permissionRepository.delete({ role: { id } });

    // Delete the role
    await this.roleRepository.remove(role);

    return successResponse(null, 'Rôle supprimé avec succès');
  }
}
