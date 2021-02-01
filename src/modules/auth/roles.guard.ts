import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
// import { Reflector } from '@nestjs/core/services/reflector.service';
// import { Reflector } from '@nestjs/core';
import { UserEntity } from '../../entities/user.entity';

@Injectable()
export class RolesGuard implements CanActivate {
  // ref = new Reflector();
  constructor(/* private readonly reflector: Reflector */) {}

  canActivate(context: ExecutionContext): boolean {
    const roles = Reflect.getMetadata('roles', context.getHandler());
    // const roles = this.ref.get<string[]>('roles', context.getHandler());
    if (!roles || !roles.length) {
      return true;
    }
    const req = context.switchToHttp().getRequest();
    const user: UserEntity = req.user();
    return !!user.roles.map((v) => v.role).find((v) => roles.includes(v));
  }
}
