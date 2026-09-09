import { Body, Controller, Delete, Get, Param, Post, Put, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { TimelineService } from './timeline.service';
import { CreateTimelineDto, UpdateTimelineDto } from './dto/timeline.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

@ApiTags('timeline')
@Controller('timeline')
export class TimelineController {
  constructor(private service: TimelineService) {}

  // Public: Siapapun dapat melihat agenda timeline
  @Get()
  findAll() {
    return this.service.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  // Protected: Hanya Admin & Super Admin yang dapat menambah agenda
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.admin, Role.panitia)
  @Post()
  create(@Body() dto: CreateTimelineDto) {
    return this.service.create(dto);
  }

  // Protected: Hanya Admin & Super Admin yang dapat mengubah agenda
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.admin, Role.panitia)
  @Put(':id')
  update(@Param('id') id: string, @Body() dto: UpdateTimelineDto) {
    return this.service.update(id, dto);
  }

  // Protected: Hanya Admin & Super Admin yang dapat menghapus agenda
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.admin, Role.panitia)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
