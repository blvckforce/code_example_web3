import { PartialType } from '@nestjs/mapped-types';
import { PaginationQueryDto } from '../../../common/dto/pagination-query.dto';
import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsOptional, IsString } from 'class-validator';
import { ToBoolean } from '../../../common/decorators';

export class GetListCollectionsDto extends PartialType(PaginationQueryDto) {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  name_contains?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  slug?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @ToBoolean()
  @IsBoolean()
  best?: boolean;

  @ApiProperty({ required: false })
  @IsOptional()
  @ToBoolean()
  @IsBoolean()
  disableDefault?: boolean;
}
