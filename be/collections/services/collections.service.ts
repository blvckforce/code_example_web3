import * as _ from 'lodash';
import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CollectionsRepository } from '../repositories/collections.repository';
import { CollectionDtoMapper } from '../mappers/collection.dto.mapper';
import { CollectionDto } from '../dto/collection.dto';
import { GetListCollectionsDto } from '../dto/get-list-collections.dto';
import { CreateCollectionDto } from '../dto/create-collection.dto';
import { UpdateCollectionDto } from '../dto/update-collection.dto';
import { FileTypeEnum } from '../../storage/enums/file-type.enum';
import { StorageService } from '../../storage/services/storage.service';
import { CreateCollectionType } from '../types/CreateCollectionType';

@Injectable()
export class CollectionsService {
  constructor(
    private readonly collectionsRepository: CollectionsRepository,
    private readonly collectionDtoMapper: CollectionDtoMapper,
    private readonly storageService: StorageService,
  ) {
  }

  async findAllMy(dto: GetListCollectionsDto, currentAccount: any): Promise<CollectionDto[]> {
    const items = await this.collectionsRepository.findAllMy(dto, currentAccount);
    return items.map(this.collectionDtoMapper.toDto);
  }

  async findAll(dto: GetListCollectionsDto): Promise<CollectionDto[]> {
    const items = await this.collectionsRepository.findAll(dto);
    return items.map(this.collectionDtoMapper.toDto);
  }

  async findOne(id: number) {
    const item = await this.collectionsRepository.findOne(id);
    return this.collectionDtoMapper.toDto(item);
  }

  async findOneByIdOrSlug(slug: number | string) {
    const item = await this.collectionsRepository.findOneByIdOrSlug(slug);
    if (!item) {
      throw new NotFoundException('Collection not found');
    }
    return this.collectionDtoMapper.toDto(item);
  }

  async findAllProperties(id: number) {
    return this.collectionsRepository.findAllProperties(id);
  }

  async create(
    files: { files_avatar?: Express.Multer.File[], files_background?: Express.Multer.File[] },
    dto: CreateCollectionDto,
    currentAccountId: number,
  ) {
    if (files) {
      const filesUploads = await this.uploadFiles(files);
      dto = {
        ...dto,
        ...filesUploads,
      };
    }

    return this.collectionsRepository.create(dto, currentAccountId);
  }

  async update(id: number, files: { files_avatar?: Express.Multer.File[], files_background?: Express.Multer.File[] },
    dto: UpdateCollectionDto, currentAccountId: number) {
    const filesUploads = await this.uploadFiles(files);
    dto = {
      ...dto,
      ...filesUploads,
    };
    return this.collectionsRepository.update(id, dto, currentAccountId);
  }

  async delete(id: number, currentAccountId: number) {
    return this.collectionsRepository.delete(id, currentAccountId);
  }

  private async uploadFiles(files: { files_avatar?: Express.Multer.File[], files_background?: Express.Multer.File[] }): Promise<{ avatar?: string, background?: string }> {
    if (_.isEmpty(files)) {
      return {};
    }

    // eslint-disable-next-line @typescript-eslint/naming-convention
    const { files_avatar, files_background } = files;
    let result = {};
    if (files_avatar) {
      const res = await this.uploadFile(files_avatar, 'avatar');
      result = {
        ...result,
        ...res,
      };
    }

    if (files_background) {
      const res = await this.uploadFile(files_background, 'background');
      result = {
        ...result,
        ...res,
      };
    }
    return result;
  }

  private async uploadFile(files: Array<Express.Multer.File>, fileField: string): Promise<{ avatar?: string, background?: string }> {
    const [file] = files;
    if (!file) {
      throw new BadRequestException('There is no file in the files field!');
    }
    const { Location } = await this.storageService.uploadFile(file, file.originalname);
    if (Location) {
      if (fileField === FileTypeEnum.avatar) {
        return { avatar: Location };
      }
      if (fileField === FileTypeEnum.background) {
        return { background: Location };
      }
      throw new BadRequestException('Invalid "field" field');
    }
  }

  findOrCreate(data: CreateCollectionType) {
    return this.collectionsRepository.findOrCreate(data);
  }
}
