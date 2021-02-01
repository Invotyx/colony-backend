import { BadRequestException } from '@nestjs/common';

export const inValidDataRes = (messages: string[]) =>
  new BadRequestException({ message: messages, error: 'Bad Request' });
