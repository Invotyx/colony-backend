import { Repository } from 'typeorm';

export const isExist = (repo: Repository<any>, key, val) =>
  repo.findOne({ [key]: val }, { select: [key] });
