import { Injectable } from '@nestjs/common';
import { ModuleRef } from '@nestjs/core';
import { SEEDS } from './seeds.const';
import { ISeed } from './seeds.interface';

@Injectable()
export class SeederService {
  constructor(private moduleRef: ModuleRef) {}
  async sow({ klass, up }) {
    const seedService: ISeed = await this.moduleRef.resolve(SEEDS[klass]);
    if (up) {
      return await seedService.up();
    } else {
      return await seedService.down();
    }
  }
}
