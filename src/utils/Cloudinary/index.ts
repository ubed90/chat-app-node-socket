import { BadRequestError } from '@errors';
import { IUser } from '@models/User.model';
import { v2 as Cloudinary } from 'cloudinary';
import { UploadedFile } from 'express-fileupload';
import fs from 'fs';

Cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

type UploadImageArgs = {
  file: UploadedFile;
  upload_folder: string;
};

const ImageService = {
  uploadImage: async ({ file, upload_folder }: UploadImageArgs) => {
    if ((!file.mimetype.startsWith('image/')) && (!file.mimetype.match(/(jpg|jpeg|png)$/))) {      
      throw new BadRequestError('Only JPG/JPEG/PNG files are allowed.');
    }

    const maxSize = 1024 * 1024;

    if (file.size > maxSize)
      throw new BadRequestError('Please upload image under 1MB');

    const result = await Cloudinary.uploader.upload(file.tempFilePath, {
      filename_override: file.name.replace(/\.(jpg|jpeg|png)$/, ''),
      folder: `chatsUP/${upload_folder}`,
    });

    fs.unlinkSync(file.tempFilePath);

    return result;
  },
  uploadVideo: async ({ file, upload_folder }: UploadImageArgs) => {
    if ((!file.mimetype.startsWith('video/')) && (!file.mimetype.match(/(mp4|mov|webm)$/))) {
      throw new BadRequestError('Only MP4/MOV/WEBM files are allowed.');
    }

    const maxSize = 1024 * 1024 * 5;

    if (file.size > maxSize)
      throw new BadRequestError('Please upload Video under 5MB');

    const result = await Cloudinary.uploader.upload(file.tempFilePath, {
      resource_type: 'video',
      filename_override: file.name.replace(/\.(jpg|jpeg|png)$/, ''),
      folder: `chatsUP/${upload_folder}`,
    });

    fs.unlinkSync(file.tempFilePath);

    return result;
  },
  deleteImage: (user: IUser) => Cloudinary.uploader.destroy(user.profilePicture?.public_id as string)
};

export default ImageService;