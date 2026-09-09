import { Module } from '@nestjs/common';
import { KelompokController } from './kelompok.controller';
import { KelompokService } from './kelompok.service';

@Module({ controllers: [KelompokController], providers: [KelompokService] })
export class KelompokModule {}
