import { IsUUID, IsInt, Min } from 'class-validator';

export class ReserveStockDto {
  @IsUUID()
  productId!: string;

  @IsUUID()
  orderId!: string;

  @IsInt()
  @Min(1)
  quantity!: number;
}
