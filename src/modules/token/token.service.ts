import { Injectable } from '@nestjs/common';
import { plainToClass } from 'class-transformer';
import { TokenEntity } from '../../entities/token.entity';
import { FileMgrService } from '../../services/file-mgr/file-mgr.service';
import { TokenDto, TokenUpdateDto } from './token.dto';
import { TokenRepository } from './token.repo';

@Injectable()
export class TokenService {
  constructor(
    public readonly repository: TokenRepository,
    public readonly fileMgrService: FileMgrService,
  ) {}

  async createToken(token: TokenDto) {
    try {
      const newToken = await this.repository.save(token);
      return { token: plainToClass(TokenEntity, newToken) };
    } catch (error) {
      throw error;
    }
  }

  findToken(userId: number): Promise<TokenEntity> {
    return this.repository.findOne({ where: { userId } });
  }

  public async updateToken(token: TokenUpdateDto, id: string | number) {
    try {
      const updateToken = await this.repository.update(id, token);
      return { group: plainToClass(TokenEntity, updateToken) };
    } catch (error) {
      throw error;
    }
  }
}
