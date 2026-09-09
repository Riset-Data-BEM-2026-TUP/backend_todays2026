import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { ReferenceService } from './reference.service';

@ApiTags('reference')
@Controller('reference')
export class ReferenceController {
  constructor(private service: ReferenceService) {}

  // Publik: dipakai form login Maba untuk dropdown fakultas & prodi (tanpa hardcode di FE)
  @Get('fakultas')
  getFakultas() {
    return this.service.getFakultas();
  }
}
