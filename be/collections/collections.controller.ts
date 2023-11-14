import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ApiBody, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { CollectionsService } from './services/collections.service';
import { CurrentAccount } from '../../common/decorators/current-account.decorator';
import { CreateCollectionDto } from './dto/create-collection.dto';
import { CollectionDto } from './dto/collection.dto';
import { GetListCollectionsDto } from './dto/get-list-collections.dto';
import { UpdateCollectionDto } from './dto/update-collection.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { SignatureGuard } from '../auth/guards/signature.guard';

@ApiTags('Collections')
@Controller('collections')
export class CollectionsController {
  constructor(private readonly collectionsService: CollectionsService) {
  }

  @ApiOkResponse({ type: [CollectionDto] })
  @Get()
  async findAll(@Query() dto: GetListCollectionsDto) {
    return this.collectionsService.findAll(dto);
  }

  @ApiOkResponse({ type: [CollectionDto] })
  @UseGuards(JwtAuthGuard)
  @Get('my')
  async findAllMy(@Query() dto: GetListCollectionsDto, @CurrentAccount() currentAccount: any) {
    return this.collectionsService.findAllMy(dto, currentAccount);
  }

  // @ApiOkResponse({ type: [CollectionDto] })
  // @Get(':id')
  // async findOne(@Param('id') id: number) {
  //   return this.collectionsService.findOne(id);
  // }

  @ApiOkResponse({ type: CollectionDto })
  @Get(':slug')
  async findOneBySlug(@Param('slug') slug: number | string) {
    return this.collectionsService.findOneByIdOrSlug(slug);
  }

  // TODO: add ApiOkResponse
  // @ApiOkResponse({ type: [CollectionDto] })
  @Get(':id/properties')
  async findAllProperties(@Param('id') id: number) {
    return this.collectionsService.findAllProperties(id);
  }

  @UseGuards(JwtAuthGuard)
  @UseGuards(SignatureGuard)
  @ApiBody({ type: CreateCollectionDto })
  @ApiOkResponse({ type: CollectionDto })
  @Post()
  @UseInterceptors(FileFieldsInterceptor([
    { name: 'files_avatar', maxCount: 1 },
    { name: 'files_background', maxCount: 1 },
  ]))
  async create(@UploadedFiles() files: { files_avatar?: Express.Multer.File[], files_background?: Express.Multer.File[] },
    @Body() dto: CreateCollectionDto, @CurrentAccount() currentAccount: any) {
    return this.collectionsService.create(files, dto, currentAccount.id);
  }

  @UseGuards(JwtAuthGuard)
  @UseGuards(SignatureGuard)
  @ApiBody({ type: UpdateCollectionDto })
  @ApiOkResponse({ type: CollectionDto })
  @Put(':id')
  @UseInterceptors(FileFieldsInterceptor([
    { name: 'files_avatar', maxCount: 1 },
    { name: 'files_background', maxCount: 1 },
  ]))
  async update(@UploadedFiles() files: { files_avatar?: Express.Multer.File[], files_background?: Express.Multer.File[] },
    @Param('id') id: number, @Body() dto: UpdateCollectionDto, @CurrentAccount() currentAccount: any) {
    return this.collectionsService.update(id, files, dto, currentAccount.id);
  }

  @UseGuards(JwtAuthGuard)
  @UseGuards(SignatureGuard)
  @ApiOkResponse({ type: CollectionDto })
  @Delete(':id')
  async delete(@Param('id') id: number, @CurrentAccount() currentAccount: any) {
    // TODO: user can't delete mot empty collection
    // return this.collectionsService.delete(id, currentAccountId);
  }
}
