import { FactoriesService } from './factories.service';

export const FactoriesProviders = [FactoriesService];

/*

@Module({
  // imports: [MainMysqlModule],
  providers: [SeederService, ...Object.values(SEEDS)],
  exports: [SeederService, ...Object.values(SEEDS)],
})
export class SeederModule {}
 */
