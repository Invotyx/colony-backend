import { HttpException, HttpStatus } from '@nestjs/common';
import { extname } from 'path';
import { uniqueId } from 'src/shared/random-keygen';

export const imageFileFilter = (req: any, file: any, callback: any) => {
  if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/)) {
    return callback(
      new HttpException(
        'Only image files are allowed!',
        HttpStatus.BAD_REQUEST,
      ),
      false,
    );
  }
  callback(null, true);
};

export const audioFileFilter = (req: any, file: any, callback: any) => {
  if (
    !file.originalname.match(/\.(mp3|wav|mpeg|wave|x-wav|aiff|x-aifc|x-aiff|gsm|ulaw)$/)
  ) {
    return callback(
      new HttpException('Only mp3 files are allowed!', HttpStatus.BAD_REQUEST),
      false,
    );
  }
  callback(null, true);
};

export const editFileName = (req: any, file: any, callback: any) => {
  const name = file.originalname.split('.')[0];
  const fileExtName = extname(file.originalname);
  const randomName = uniqueId(6);
  callback(null, `audio-${randomName}${fileExtName}`);
};
