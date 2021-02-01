import { env } from 'process';
export interface IFileSystemConfig {
  s3: {
    driver: string;
    key: string;
    secret: string;
    region: string;
    bucket: string;
    endpoint: string;
    view_url: string;
    use_path_style_endpoint: boolean;
  };
}

export const FileSystemConfig = async () => {
  return {
    s3: {
      driver: 's3',
      key: env.ACCESS_KEY_ID,
      secret: env.AWS_SECRET_ACCESS_KEY,
      region: env.AWS_REGION,
      bucket: env.AWS_BUCKET,
      view_url: env.AWS_VIEW_URL,
      // 'url' : environment.AWS.URL,
      endpoint: env.AWS_URL,
      use_path_style_endpoint: true,
    },
  } as IFileSystemConfig;
};
