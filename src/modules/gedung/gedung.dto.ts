import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsArray, IsInt, IsOptional, IsString } from 'class-validator';

export class CreateGedungDto {
  @ApiProperty() @IsString() nama!: string;
  @ApiPropertyOptional() @IsOptional() @IsString() kategori?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() lokasi?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() deskripsi?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() deskripsiLengkap?: string;
  @ApiPropertyOptional({ type: [String] }) @IsOptional() @IsArray() @IsString({ each: true }) fasilitas?: string[];
  @ApiPropertyOptional() @IsOptional() @IsString() jamOperasional?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() fotoUrl?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() googleMapsUrl?: string;
  @ApiPropertyOptional() @IsOptional() @IsInt() urutan?: number;
}

export class UpdateGedungDto {
  @ApiPropertyOptional() @IsOptional() @IsString() nama?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() kategori?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() lokasi?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() deskripsi?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() deskripsiLengkap?: string;
  @ApiPropertyOptional({ type: [String] }) @IsOptional() @IsArray() @IsString({ each: true }) fasilitas?: string[];
  @ApiPropertyOptional() @IsOptional() @IsString() jamOperasional?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() fotoUrl?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() googleMapsUrl?: string;
  @ApiPropertyOptional() @IsOptional() @IsInt() urutan?: number;
}
