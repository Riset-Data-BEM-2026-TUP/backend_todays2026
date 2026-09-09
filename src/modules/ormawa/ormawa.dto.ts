import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class CreateOrmawaDto {
  @ApiProperty() @IsString() slug!: string;
  @ApiProperty() @IsString() nama!: string;
  @ApiProperty() @IsString() kategori!: string;
  @ApiPropertyOptional() @IsOptional() @IsString() logoUrl?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() thumbnailVideoUrl?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() videoProfilUrl?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() deskripsi?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() visiMisi?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() programKerja?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() prestasi?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() instagramUrl?: string;
}

export class UpdateOrmawaDto {
  @ApiPropertyOptional() @IsOptional() @IsString() slug?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() nama?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() kategori?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() logoUrl?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() thumbnailVideoUrl?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() videoProfilUrl?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() deskripsi?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() visiMisi?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() programKerja?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() prestasi?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() instagramUrl?: string;
}
