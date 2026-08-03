import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { faqQuerySchema } from '../../common/validation/validation';
import { FaqService } from './faq.service';

@ApiTags('faq')
@Controller()
export class FaqController {
  constructor(private service: FaqService) {}

  @Get('faq')
  findAll(@Query() query: unknown) {
    const { category, search } = faqQuerySchema.parse(query);
    return this.service.findAll({ category, search });
  }

  @Get('faq-kategori')
  findKategori() {
    return this.service.findKategori();
  }
}
