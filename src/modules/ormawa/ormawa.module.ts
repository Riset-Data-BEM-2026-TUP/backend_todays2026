import { Module } from '@nestjs/common';
import { OrmawaController } from './ormawa.controller';
import { OrmawaService } from './ormawa.service';

@Module({ controllers: [OrmawaController], providers: [OrmawaService] })
export class OrmawaModule {}
