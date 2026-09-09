import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsArray, IsInt, IsOptional, IsString } from 'class-validator';

export class CreateAcademicDto {
  @ApiProperty() @IsString() nama!: string;
  @ApiPropertyOptional() @IsOptional() @IsString() singkatan?: string;
  @ApiProperty() @IsString() kategori!: string;
  @ApiPropertyOptional() @IsOptional() @IsString() url?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() deskripsi?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() deskripsiLengkap?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() iconName?: string;
  @ApiPropertyOptional({ type: [String] }) @IsOptional() @IsArray() @IsString({ each: true }) fiturUtama?: string[];
  @ApiPropertyOptional() @IsOptional() @IsInt() urutan?: number;
}

export class UpdateAcademicDto {
  @ApiPropertyOptional() @IsOptional() @IsString() nama?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() singkatan?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() kategori?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() url?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() deskripsi?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() deskripsiLengkap?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() iconName?: string;
  @ApiPropertyOptional({ type: [String] }) @IsOptional() @IsArray() @IsString({ each: true }) fiturUtama?: string[];
  @ApiPropertyOptional() @IsOptional() @IsInt() urutan?: number;
}
