import { dotCase, snakeCase } from 'change-case';

export class PermissionData {
  action = '';
  subject = '';
  meta: any = {};
}

//add permissions here
export const PermissionsList = {
  create$Users: new PermissionData(),
};

const permissionsMapper = (k, v) => {
  const [action, subject] = k.split('$');
  v.action = snakeCase(action);
  v.subject = dotCase(subject);
};

Object.keys(PermissionsList).forEach((k) =>
  permissionsMapper(k, PermissionsList[k])
);
