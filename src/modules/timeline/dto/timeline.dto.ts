import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsArray, IsDateString, IsInt, IsOptional, IsString } from 'class-validator';

export class CreateTimelineDto {
  @ApiProperty({ example: 'PKKMB — Day 1' })
  @IsString()
  judul!: string;

  @ApiPropertyOptional({ example: 'Opening Ceremony, Sambutan Rektor, Pengenalan Universitas.' })
  @IsOptional()
  @IsString()
  deskripsi?: string;

  @ApiPropertyOptional({ example: 'Auditorium' })
  @IsOptional()
  @IsString()
  lokasi?: string;

  @ApiProperty({ example: '2026-09-09T08:00:00+07:00' })
  @IsDateString()
  startAt!: string;

  @ApiPropertyOptional({ example: '2026-09-09T16:00:00+07:00' })
  @IsOptional()
  @IsDateString()
  endAt?: string;

  @ApiPropertyOptional({ example: ['Jas Almamater', 'KTM', 'Air Minum'] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  checklistItems?: string[];

  @ApiPropertyOptional({ description: 'Ketentuan dresscode kegiatan' })
  @IsOptional()
  @IsString()
  dresscode?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  attachmentUrl?: string;

  @ApiPropertyOptional({ default: 0 })
  @IsOptional()
  @IsInt()
  urutan?: number;
}

export class UpdateTimelineDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  judul?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  deskripsi?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  lokasi?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  startAt?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  endAt?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  checklistItems?: string[];

  @ApiPropertyOptional({ description: 'Ketentuan dresscode kegiatan' })
  @IsOptional()
  @IsString()
  dresscode?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  attachmentUrl?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  urutan?: number;
}
