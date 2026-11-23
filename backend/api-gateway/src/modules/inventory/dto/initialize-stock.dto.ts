import { IsUUID, IsInt, Min } from 'class-validator';

export class InitializeStockDto {
  @IsUUID()
  productId!: string;

  @IsInt()
  @Min(0)
  initialQuantity!: number;
}
