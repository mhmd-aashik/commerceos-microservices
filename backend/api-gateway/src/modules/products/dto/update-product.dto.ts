import {
  IsBoolean,
  IsOptional,
  IsString,
  IsNotEmpty,
  Matches,
} from 'class-validator';

export class UpdateProductDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  name?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  @Matches(/^(?:0|[1-9]\d{0,9})\.\d{2}$/)
  price?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
