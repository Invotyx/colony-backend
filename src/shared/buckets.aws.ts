import * as S3 from 'aws-sdk/clients/s3';
import { FileSystemConfig } from '../configs/filesystem.config';

export async function AppMainBucket() {
  const fileConfig = await FileSystemConfig();

  const APP_MAIN_BUCKET = new S3({
    credentials: {
      accessKeyId: fileConfig.s3.key,
      secretAccessKey: fileConfig.s3.secret,
    },
    region: fileConfig.s3.region,
    // s3BucketEndpoint: true,
    endpoint: fileConfig.s3.endpoint,
    s3ForcePathStyle: fileConfig.s3.use_path_style_endpoint,
  });

  const APP_MAIN_BUCKET_NAME = fileConfig.s3.bucket;
  return {
    bucket: APP_MAIN_BUCKET,
    bucketName: APP_MAIN_BUCKET_NAME,
  };
}
