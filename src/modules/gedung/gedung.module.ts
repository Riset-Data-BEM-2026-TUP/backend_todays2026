import { Module } from '@nestjs/common';
import { GedungController } from './gedung.controller';
import { GedungService } from './gedung.service';

@Module({ controllers: [GedungController], providers: [GedungService] })
export class GedungModule {}
