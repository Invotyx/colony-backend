import { Injectable } from '@nestjs/common';
var cloudinary = require('cloudinary');

@Injectable()
export class CloudinaryService {
  constructor() {
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_SECRET,
    });
  }

  async uploadImage(file: any, folder: string): Promise<any> {
    const options = {
      unique_filename: true,
      folder: folder,
    };
    
    const image = await cloudinary.v2.uploader.upload(file.path, options);
    return image;
  }
}
