import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsInt, IsOptional, IsString } from 'class-validator';

export class CreateFaqDto {
  @ApiProperty({ example: 'clx...kategoriId' })
  @IsString()
  kategoriId!: string;

  @ApiProperty({ example: 'Apa saja yang harus dibawa saat pembagian almamater?' })
  @IsString()
  pertanyaan!: string;

  @ApiProperty({ example: 'Membawa bukti registrasi dan kartu identitas.' })
  @IsString()
  jawaban!: string;

  @ApiPropertyOptional({ default: false })
  @IsOptional()
  @IsBoolean()
  isFeatured?: boolean;

  @ApiPropertyOptional({ default: 0 })
  @IsOptional()
  @IsInt()
  urutan?: number;
}

export class UpdateFaqDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  kategoriId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  pertanyaan?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  jawaban?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isFeatured?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  urutan?: number;
}
