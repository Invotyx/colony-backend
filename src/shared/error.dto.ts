import { HttpStatus } from '@nestjs/common';

class err {
  key: string;
  reason: string;
  description: string;
}
export const error = (err: err[], statusCode: HttpStatus, message: string) => {
  let errors = {};
  err.forEach((e) => {
    errors[e.key] = {
      [e.reason]: e.description,
    };
  });

  return {
    errors: errors,
    statusCode: statusCode,
    message: message,
  };
};
