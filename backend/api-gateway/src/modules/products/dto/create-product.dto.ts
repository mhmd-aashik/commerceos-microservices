import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsIn,
  Matches,
} from 'class-validator';

export class CreateProductDto {
  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsString()
  @IsNotEmpty()
  sku!: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsString()
  @Matches(/^(?:0|[1-9]\d{0,9})\.\d{2}$/, {
    message: 'Price must have exactly two decimal places',
  })
  price!: string;

  @IsOptional()
  @IsIn(['AED'])
  currency?: string;
}
