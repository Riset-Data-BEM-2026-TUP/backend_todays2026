import { Body, Controller, Delete, Get, Param, Put, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { SettingsService } from './settings.service';
import { UpsertSettingDto } from './settings.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

@ApiTags('settings')
@Controller('settings')
export class SettingsController {
  constructor(private service: SettingsService) {}

  // Publik: peta key→value (dipakai FE untuk konten dinamis)
  @Get() getAll() {
    return this.service.getAll();
  }

  // Admin panel: daftar baris setting
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.admin, Role.panitia)
  @Get('list')
  list() {
    return this.service.list();
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.admin, Role.panitia)
  @Put(':key')
  set(@Param('key') key: string, @Body() dto: UpsertSettingDto) {
    return this.service.set(key, dto.value);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.admin, Role.panitia)
  @Delete(':key')
  remove(@Param('key') key: string) {
    return this.service.remove(key);
  }
}
