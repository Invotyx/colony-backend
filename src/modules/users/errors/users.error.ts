export class InValidDataError extends Error {
  key: string;
  constructor(key: string, message: string) {
    super();
    this.key = key;
    this.message = message;
  }
}

export const EmailAlreadyExistError = new InValidDataError(
  'EmailAlreadyExistError',
  'email already exist'
);

export const PhoneAlreadyExistError = new InValidDataError(
  'PhoneAlreadyExistError',
  'Phone already exist'
);

export const UserNotExistError = new InValidDataError(
  'UserNotExistError',
  'user not exist'
);

export const UserNameAlreadyExistError = new InValidDataError(
  'UserNameAlreadyExistError',
  'username already exist'
);
