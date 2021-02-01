import { Injectable } from '@nestjs/common';
import { ModuleRef } from '@nestjs/core';
import { FACTORIES } from './factories.const';
import { IFactory } from './factory.interface';

@Injectable()
export class FactoriesService {
  constructor(private moduleRef: ModuleRef) {}
  async produce({ klass, param }) {
    const factoryService: IFactory = await this.moduleRef.resolve(
      FACTORIES[klass]
    );
    return await factoryService.run(param);
  }
}
