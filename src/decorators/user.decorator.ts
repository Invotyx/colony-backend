import {
  createParamDecorator,
  ExecutionContext,
  Headers,
} from '@nestjs/common';

export const LoginUser = createParamDecorator(
  (data: string, ctx: ExecutionContext) => {
    const req = ctx.switchToHttp().getRequest();
    const user = req.user();
    return data ? user && user[data] : user;
  }
);

export const ActiveOrg = () => Headers('org');
