import { Injectable } from '@nestjs/common';
import { CollectionCollectorRepository } from './collection-collector.repository';

@Injectable()
export class CollectionCollectorService {
  constructor(
    private readonly collectionCollectorRepository: CollectionCollectorRepository,
  ) {
  }

  start() {
    return this.collectionCollectorRepository.setAllIsInProgress(false);
  }

  getJobs() {
    return this.collectionCollectorRepository.getNotInProgress();
  }

  setInProgress(address: string) {
    return this.collectionCollectorRepository.setInProgress(address, true);
  }
}
