import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  ParseIntPipe,
} from '@nestjs/common';
import { FamilyService } from './family.service';
import * as createFamilyDto_1 from './dto/create-family.dto';
import * as updateFamilyDto_1 from './dto/update-family.dto';
import { SuccessResponse } from '../common/utils/success-response';
import { Family } from './entities/family.entity';

@Controller('classification/families')
export class FamilyController {
  constructor(private readonly familyService: FamilyService) {}

  @Post()
  create(
    @Body() createFamilyDto: createFamilyDto_1.CreateFamilyDto,
  ): Promise<SuccessResponse<Family>> {
    return this.familyService.create(createFamilyDto);
  }

  @Get()
  findAll(): Promise<SuccessResponse<Family[]>> {
    return this.familyService.findAll();
  }

  @Get(':id')
  findOne(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<SuccessResponse<Family>> {
    return this.familyService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateFamilyDto: updateFamilyDto_1.UpdateFamilyDto,
  ): Promise<SuccessResponse<Family>> {
    return this.familyService.update(id, updateFamilyDto);
  }

  @Delete(':id')
  remove(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<SuccessResponse<null>> {
    return this.familyService.remove(id);
  }
}
