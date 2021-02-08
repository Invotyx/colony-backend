import { EntityRepository, Repository } from 'typeorm';
import { ButtonsEntity } from '../../../entities/buttons.entity';

@EntityRepository(ButtonsEntity)
export class ButtonsRepository extends Repository<ButtonsEntity> {}
