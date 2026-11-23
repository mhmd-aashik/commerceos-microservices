import { IsUUID, IsInt, Min } from 'class-validator';

export class CheckStockDto {
  @IsUUID()
  productId!: string;

  @IsInt()
  @Min(1)
  quantity!: number;
}
