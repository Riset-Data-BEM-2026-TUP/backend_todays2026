import { Controller, Get, Query } from '@nestjs/common';
import { ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { KelompokService } from './kelompok.service';

@ApiTags('kelompok')
@Controller('kelompok')
export class KelompokController {
  constructor(private service: KelompokService) {}

  // Publik: guest/maba mencari kelompoknya dengan memasukkan NIM.
  @Get('search')
  @ApiOperation({ summary: 'Cari identitas & anggota kelompok berdasarkan NIM' })
  @ApiQuery({ name: 'nim', required: true, description: 'NIM (atau nomor pendaftaran)' })
  search(@Query('nim') nim: string) {
    return this.service.searchByNim(nim);
  }
}
