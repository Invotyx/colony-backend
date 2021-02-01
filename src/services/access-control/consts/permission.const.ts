import { dotCase, snakeCase } from 'change-case';

export class PermissionData {
  action = '';
  subject = '';
  meta: any = {};
}

//add permissions here
export const PermissionsList = {
  create$PostMessenger: new PermissionData(),
  read$PostMessenger: new PermissionData(),
  update$PostMessenger: new PermissionData(),
  delete$PostMessenger: new PermissionData(),
  manage$PostMessenger: new PermissionData()
};

const permissionsMapper = (k, v) => {
  const [action, subject] = k.split('$');
  v.action = snakeCase(action);
  v.subject = dotCase(subject);
};

Object.keys(PermissionsList).forEach((k) =>
  permissionsMapper(k, PermissionsList[k])
);
