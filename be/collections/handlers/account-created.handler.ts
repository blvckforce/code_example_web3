import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { uuid } from 'uuidv4';
import { CollectionsService } from '../services/collections.service';
import { AccountCreatedEvent } from '../../accounts/events/account-created.event';

@Injectable()
export class AccountCreatedHandler {
  constructor(private readonly collectionsService: CollectionsService) {
  }

  @OnEvent('account.created')
  async handle(event: AccountCreatedEvent): Promise<void> {
    const UUID = uuid();

    await this.collectionsService.create(undefined, {
      name: 'Default Collection',
      token: 'default_collection',
      color: '#000000',
      bio: '',
      url: UUID,
      slug: UUID,
    }, event.id);
  }
}
