import { Body, Controller, Delete, Get, Param, Post, Put, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { faqQuerySchema } from '../../common/validation/validation';
import { FaqService } from './faq.service';
import { CreateFaqDto, UpdateFaqDto } from './dto/faq.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

@ApiTags('faq')
@Controller()
export class FaqController {
  constructor(private service: FaqService) {}

  // Public: Siapapun dapat membaca FAQ
  @Get('faq')
  findAll(@Query() query: unknown) {
    const { category, search } = faqQuerySchema.parse(query);
    return this.service.findAll({ category, search });
  }

  @Get('faq-kategori')
  findKategori() {
    return this.service.findKategori();
  }

  @Get('faq/:id')
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  // Protected: Hanya Admin & Super Admin yang dapat menambah FAQ
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.admin, Role.panitia)
  @Post('faq')
  create(@Body() dto: CreateFaqDto) {
    return this.service.create(dto);
  }

  // Protected: Hanya Admin & Super Admin yang dapat mengubah FAQ
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.admin, Role.panitia)
  @Put('faq/:id')
  update(@Param('id') id: string, @Body() dto: UpdateFaqDto) {
    return this.service.update(id, dto);
  }

  // Protected: Hanya Admin & Super Admin yang dapat menghapus FAQ
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.admin, Role.panitia)
  @Delete('faq/:id')
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
