import { Body, Controller, Delete, Get, Param, Post, Put, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { OrmawaService } from './ormawa.service';
import { CreateOrmawaDto, UpdateOrmawaDto } from './ormawa.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

@ApiTags('ormawa')
@Controller('ormawa')
export class OrmawaController {
  constructor(private service: OrmawaService) {}

  // Publik: daftar ormawa/UKM (filter opsional ?kategori= & ?search=)
  @Get()
  list(@Query('kategori') kategori?: string, @Query('search') search?: string) {
    return this.service.list({ kategori, search });
  }

  // Publik: detail satu ormawa berdasarkan slug
  @Get(':slug')
  getBySlug(@Param('slug') slug: string) {
    return this.service.getBySlug(slug);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.admin, Role.panitia)
  @Post()
  create(@Body() dto: CreateOrmawaDto) {
    return this.service.create(dto);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.admin, Role.panitia)
  @Put(':id')
  update(@Param('id') id: string, @Body() dto: UpdateOrmawaDto) {
    return this.service.update(id, dto);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.admin, Role.panitia)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
