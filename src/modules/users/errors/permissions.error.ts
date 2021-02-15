import { InValidDataError } from './users.error';

export const PermissionAlreadyExistError = new InValidDataError(
  'PermissionAlreadyExist',
  'Permission already exist',
);
