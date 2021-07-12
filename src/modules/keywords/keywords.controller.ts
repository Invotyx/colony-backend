import { Controller } from '@nestjs/common';
import { KeywordsService } from './keywords.service';

@Controller('keywords')
export class KeywordsController {
  constructor(private readonly service: KeywordsService) {}
}
