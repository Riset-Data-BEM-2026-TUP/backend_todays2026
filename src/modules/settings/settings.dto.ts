import { ApiProperty } from '@nestjs/swagger';
import { IsDefined } from 'class-validator';

export class UpsertSettingDto {
  // value bebas (string/number/boolean/object) — cukup wajib ada agar lolos whitelist.
  @ApiProperty()
  @IsDefined()
  value!: unknown;
}
