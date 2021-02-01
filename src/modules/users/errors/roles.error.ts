import { InValidDataError } from './users.error';

export const RoleAlreadyExistError = new InValidDataError(
  'RoleAlreadyExist',
  'role already exist'
);
