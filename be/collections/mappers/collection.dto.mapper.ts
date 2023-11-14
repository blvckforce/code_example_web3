import { CollectionDto } from '../dto/collection.dto';
import { CollectionSchema } from '../schemas/collection.schema';
import { Injectable } from '@nestjs/common';

@Injectable()
export class CollectionDtoMapper {
  toDto(collection: CollectionSchema): CollectionDto {
    // TODO: perhaps you are tempted to remove this method/class? Feel free to delete it and refactor the code. I just don't have time for this now/
    return collection.toJSON() as CollectionDto;
  }
}
