import {
  BadRequestException,
  Body,
  Controller,
  Get,
  HttpStatus,
  Post,
} from '@nestjs/common';
import { Auth } from '../../decorators/auth.decorator';
import { LoginUser } from '../../decorators/user.decorator';
import { ROLES } from '../../services/access-control/consts/roles.const';
import { error } from '../../shared/error.dto';
import { UserEntity } from '../users/entities/user.entity';
import { SupportService } from './support.service';

@Controller('support')
export class SupportController {
  constructor(private readonly service: SupportService) {}

  @Auth({ roles: [ROLES.INFLUENCER, ROLES.ADMIN] })
  @Post('contact-us')
  public async sendEmail(
    @LoginUser() user: UserEntity,
    @Body('body') body: string,
    @Body('subject') subject: string,
  ) {
    let errors = [];
    if (!body || body.length < 10) {
      errors.push({
        key: 'body',
        description: 'Body should be minimum of 10 characters.',
        reason: 'MinimumLengthConstraint',
      });
    }
    if (!subject || subject.length < 10) {
      errors.push({
        key: 'subject',
        description: 'Subject should be minimum of 10 characters.',
        reason: 'MinimumLengthConstraint',
      });
    }
    if (errors.length > 0) {
      throw new BadRequestException(
        error(errors, HttpStatus.BAD_REQUEST, 'Validation Errors'),
      );
    }

    await this.service.sendEmail(user, body, subject);
  }
}
