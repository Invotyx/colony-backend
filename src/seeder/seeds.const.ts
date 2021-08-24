import { CreateAdminSeed } from './seeds/adminUser.seed';
import { CitySeed } from './seeds/city.seed';
import { CountrySeed } from './seeds/country.seed';
import { PermissionSeed } from './seeds/permission.seed';
import { PlanSeed } from './seeds/plan.seed';
import { RolesSeed } from './seeds/roles.seed';
export const SEEDS: any = {
  RolesSeed,
  PermissionSeed,
  CreateAdminSeed,
  CountrySeed,
  CitySeed,
  PlanSeed,
};
