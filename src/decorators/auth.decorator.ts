import { applyDecorators, SetMetadata, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiUnauthorizedResponse } from '@nestjs/swagger';
import { JwtAuthGuard } from '../modules/auth/jwt-auth.guard';
import { LocalAuthGuard } from '../modules/auth/local-auth.guard';
import { RolesGuard } from '../modules/auth/roles.guard';

export const Auth = (data: { roles?: string[] } = {}) => {
  return applyDecorators(
    SetMetadata('roles', data.roles),
    UseGuards(JwtAuthGuard),
    UseGuards(RolesGuard),
    ApiBearerAuth(),
    ApiUnauthorizedResponse({
      description: 'Unauthorized to access this resource.',
    }),
  );
};
export const Authenticate = () => UseGuards(LocalAuthGuard);
