import { Repository } from 'typeorm';

export const isExist = (repo: Repository<any>, key: any, val: any) =>
  repo.findOne({ [key]: val }, { select: [key] });
