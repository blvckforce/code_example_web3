import { Module } from '@nestjs/common';
import { CollectionSchema } from './schemas/collection.schema';
import { CollectionsService } from './services/collections.service';
import { CollectionsRepository } from './repositories/collections.repository';
import { CollectionsController } from './collections.controller';
import { CollectionDtoMapper } from './mappers/collection.dto.mapper';
import { AccountCreatedHandler } from './handlers/account-created.handler';
import { StorageModule } from '../storage/storage.module';

@Module({
  imports: [StorageModule],
  providers: [
    {
      provide: CollectionSchema.name,
      useValue: CollectionSchema,
    },
    CollectionsRepository,
    CollectionsService,
    CollectionDtoMapper,
    AccountCreatedHandler,
  ],
  exports: [CollectionsService],
  controllers: [CollectionsController],
})
export class CollectionsModule {
}
