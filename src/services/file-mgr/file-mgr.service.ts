import { Injectable, OnModuleInit } from '@nestjs/common';
import * as S3 from 'aws-sdk/clients/s3';
import { AppConfig } from '../../configs/app.config';
import {
  FileSystemConfig,
  IFileSystemConfig,
} from '../../configs/filesystem.config';
import { FileEntity } from '../../entities/file.entity';
import { FileRepository } from '../../repos/file.repo';
import { AppMainBucket } from '../../shared/buckets.aws';
export interface IAppFile {
  moduleId: number;
  itemId: number;
  name: string;
  size: number;
  type: string;
  desc?: string;
  buffer?: Buffer;
  meta?: any;
}
const genUniqKey = (suffix) => {
  const ft = new Date().getTime();
  const s = Math.floor(ft / 1000);
  const a = new Uint8Array(new Uint32Array([s]).buffer);
  const b = new Uint8Array([
    Math.floor(Math.random() * 256),
    Math.floor(Math.random() * 256),
    Math.floor(Math.random() * 256),
    Math.floor(Math.random() * 256),
  ]);
  const c = new Uint8Array(new Uint16Array([suffix]).buffer);
  return Buffer.from([...a, ...b, ...c]).toString('hex');
};

export interface IFileParam {
  app?: string;
  moduleId?: number;
  itemId?: number;
  path?: string;
}

@Injectable()
export class FileMgrService implements OnModuleInit {
  private s3: S3;
  private bucketName: string;
  private appConfig;
  private fileSystemConfig: IFileSystemConfig;

  constructor(public readonly repository: FileRepository) {}
  async onModuleInit() {
    const mainBucket = await AppMainBucket();
    this.s3 = mainBucket.bucket;
    this.bucketName = mainBucket.bucketName;
    this.appConfig = await AppConfig();
    this.fileSystemConfig = await FileSystemConfig();
  }

  public async uploadFiles(files: IAppFile[]) {
    const res = files.map(async (file, index) => {
      const ext = file.name.match(/\..*$/)?.[0] ?? '';
      const vName = genUniqKey(index) + ext;
      const s3File = await this.s3
        .upload({
          Bucket: this.bucketName,
          Key: this.genFileKey({
            app: this.appConfig.name,
            moduleId: file.moduleId,
            itemId: file.itemId,
            path: vName,
          }),
          Body: file.buffer,
          ACL: 'public_read',
        })
        .promise();
      const newFile = new FileEntity();
      newFile.tableId = file.moduleId;
      newFile.itemId = file.itemId;
      newFile.name = file.name;
      newFile.path = vName;
      newFile.size = file.size;
      newFile.meta = file.meta;
      newFile.type = file.type;
      const dbFile = await this.repository.save(newFile);
      return { s3File, dbFile };
    });
    return Promise.all(res);
  }

  findOne(id: number, tableId: number): Promise<FileEntity> {
    return this.repository.findOne({ where: { itemId: id, tableId: tableId } });
  }
  findUser(id: number): Promise<FileEntity> {
    return this.repository.findOne({ where: { itemId: id } });
  }

  public async deleteFile(files: FileEntity[]) {
    const res = files.map(async (file) => {
      const s3File = await this.s3
        .deleteObject({
          Bucket: this.bucketName,
          Key: this.genFileKey({
            app: this.appConfig.name,
            moduleId: file.tableId,
            itemId: file.itemId,
            path: file.path,
          }),
        })
        .promise();

      const dbFile = await this.repository.delete(file.id);
      return { s3File, dbFile };
    });
    return Promise.all(res);
  }

  public async deleteFiles(files: FileEntity[]) {
    console.log(files, 'message');
    const appConfig = await AppConfig();
    const Objects = files.map((file) => {
      return {
        Key: this.genFileKey({
          app: appConfig.name,
          moduleId: file.tableId,
          itemId: file.itemId,
          path: file.path,
        }),
      };
    });
    const s3File = await this.s3
      .deleteObjects({
        Bucket: this.bucketName,
        Delete: { Objects },
      })
      .promise();
    const dbFile = await this.repository.delete(files.map((v) => v.id));
    return { s3File, dbFile };
  }

  private genFileKey({
    app = this.appConfig.name,
    moduleId,
    itemId,
    path,
  }: IFileParam) {
    return `${app}/${moduleId}/${itemId}/${path}`;
  }

  public genFileUrl(data: IFileParam) {
    return `${this.fileSystemConfig.s3.view_url}${
      this.bucketName
    }/${this.genFileKey(data)}`;
  }

  public async getPreURL(file: IAppFile, expire = 60) {
    const ext = file.name.match(/\..*$/)?.[0] ?? '';
    const vName = genUniqKey(0) + ext;
    const preUrl = await this.s3.getSignedUrlPromise('putObject', {
      Bucket: this.bucketName,
      Key: this.genFileKey({
        app: this.appConfig.name,
        moduleId: file.moduleId,
        itemId: file.itemId,
        path: vName,
      }),
      // Body: file.buffer,
      Expires: expire,
      ACL: 'public_read',
    });
    const newFile = new FileEntity();
    newFile.tableId = file.moduleId;
    newFile.itemId = file.itemId;
    newFile.name = file.name;
    newFile.path = vName;
    newFile.size = file.size;
    newFile.meta = file.meta;
    newFile.type = file.type;
    const dbFile = await this.repository.save(newFile);
    return { preUrl, dbFile };
  }
}
