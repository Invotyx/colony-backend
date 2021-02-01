import { SeederService } from './seeder.service';
import { SEEDS } from './seeds.const';

export const SeederProviders = [SeederService, ...Object.values(SEEDS)];

/*

@Module({
  // imports: [MainMysqlModule],
  providers: [SeederService, ...Object.values(SEEDS)],
  exports: [SeederService, ...Object.values(SEEDS)],
})
export class SeederModule {}
 */
