import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsEmail, IsString, Matches, MinLength } from 'class-validator';

/** Mirror dari loginSchema (Zod) di @bhumara/shared-validation. */
export class LoginDto {
  @ApiProperty() @IsString() @MinLength(4) nomorPendaftaran!: string;
  @ApiProperty() @IsDateString() tanggalLahir!: string;
  @ApiProperty() @IsEmail() email!: string;
  @ApiProperty() @Matches(/^(\+62|62|0)8[1-9][0-9]{6,11}$/, { message: 'Nomor HP tidak valid' }) noHp!: string;
  @ApiProperty() @IsString() fakultas!: string;
  @ApiProperty() @IsString() prodi!: string;
}
