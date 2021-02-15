import { dotCase, snakeCase } from 'change-case';

export class PermissionData {
  action = '';
  subject = '';
  meta: any = {};
}

//add permissions here
export const PermissionsList: any = {
  create$Users: new PermissionData(),
};

const permissionsMapper = (k: any, v: any) => {
  const [action, subject] = k.split('$');
  v.action = snakeCase(action);
  v.subject = dotCase(subject);
};

Object.keys(PermissionsList).forEach((k: any) =>
  permissionsMapper(k, PermissionsList[k]),
);
