import { BadRequestError } from '@/errors';
import { IUser } from '@/models/User.model';
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
      console.log(file.mimetype);
      
      throw new BadRequestError('Only JPG/JPEG/PNG files are allowed.');
    }

    const maxSize = 1024 * 1024 * 2;

    if (file.size > maxSize)
      throw new BadRequestError('Please upload image under 2MB');

    const result = await Cloudinary.uploader.upload(file.tempFilePath, {
      filename_override: file.name.replace(/\.(jpg|jpeg|png)$/, ''),
      folder: `chatsUP/${upload_folder}`,
    });

    fs.unlinkSync(file.tempFilePath);

    return result;
  },
  deleteImage: (user: IUser) => Cloudinary.uploader.destroy(user.profilePicture?.public_id as string)
};

export default ImageService;