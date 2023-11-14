import { IsInt, IsOptional, IsPositive, Min } from 'class-validator';

export class PaginationQueryDto {
  @IsOptional()
  @IsInt()
  @IsPositive()
  limit: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  offset: number;
}
