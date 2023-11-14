import { ApiProperty } from '@nestjs/swagger';
import { AccountDto } from '../../accounts/dto/account.dto';

export class CollectionDto {
  @ApiProperty()
  id: number;

  @ApiProperty()
  name: string;

  @ApiProperty()
  token: string;

  @ApiProperty()
  color: string;

  @ApiProperty()
  bio: string;

  @ApiProperty()
  url: string;

  @ApiProperty()
  slug: string;

  @ApiProperty()
  account: AccountDto;

  @ApiProperty()
  cover_image: string;

  @ApiProperty()
  avatar: string;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}
