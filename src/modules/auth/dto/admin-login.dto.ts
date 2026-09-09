import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, MinLength } from 'class-validator';

export class AdminLoginDto {
  @ApiProperty({ example: 'admin@bhumara.telkomuniversity.ac.id' })
  @IsEmail({}, { message: 'Format email tidak valid' })
  email!: string;

  @ApiProperty({ example: 'AdminBhumara2026!' })
  @IsString()
  @MinLength(6, { message: 'Password minimal 6 karakter' })
  password!: string;
}
