import { applyDecorators, SetMetadata, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../modules/auth/jwt-auth.guard';
import { LocalAuthGuard } from '../modules/auth/local-auth.guard';
import { RolesGuard } from '../modules/auth/roles.guard';

export const Auth = (data: { roles?: string[] } = {}) => {
  return applyDecorators(
    SetMetadata('roles', data.roles),
    UseGuards(JwtAuthGuard),
    UseGuards(RolesGuard),
    // ApiBearerAuth(),
    // ApiUnauthorizedResponse({ description: 'Unauthorized"' })
  );
};
export const Authenticate = () => UseGuards(LocalAuthGuard);
