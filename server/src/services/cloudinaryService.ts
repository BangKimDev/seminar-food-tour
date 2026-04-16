import { v2 as cloudinary } from 'cloudinary';
import { config } from '../config/index.js';

cloudinary.config({
  cloud_name: config.cloudinary.cloudName,
  api_key: config.cloudinary.apiKey,
  api_secret: config.cloudinary.apiSecret,
});

export interface UploadResult {
  url: string;
  publicId: string;
  duration?: number;
}

export const cloudinaryService = {
  async uploadAudio(
    fileBase64: string,
    filename: string = 'audio'
  ): Promise<UploadResult> {
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          resource_type: 'video',
          folder: 'food-tour/audio',
          public_id: `${filename}_${Date.now()}`,
          format: 'mp3',
        },
        (error, result) => {
          if (error) {
            reject(error);
          } else if (result) {
            resolve({
              url: result.secure_url,
              publicId: result.public_id,
              duration: result.duration,
            });
          } else {
            reject(new Error('Upload failed'));
          }
        }
      );

      const buffer = Buffer.from(fileBase64, 'base64');
      uploadStream.end(buffer);
    });
  },

  async uploadFromBuffer(
    buffer: Buffer,
    options: {
      filename?: string;
      resourceType?: 'video' | 'image' | 'raw';
    } = {}
  ): Promise<UploadResult> {
    const { filename = 'file', resourceType = 'video' } = options;

    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          resource_type: resourceType,
          folder: 'food-tour/audio',
          public_id: `${filename}_${Date.now()}`,
          format: 'mp3',
        },
        (error, result) => {
          if (error) {
            reject(error);
          } else if (result) {
            resolve({
              url: result.secure_url,
              publicId: result.public_id,
              duration: result.duration,
            });
          } else {
            reject(new Error('Upload failed'));
          }
        }
      );

      uploadStream.end(buffer);
    });
  },

  async delete(publicId: string): Promise<void> {
    await cloudinary.uploader.destroy(publicId, {
      resource_type: 'video',
    });
  },

  getConfigStatus(): { configured: boolean; cloudName: string } {
    return {
      configured: !!(
        config.cloudinary.cloudName &&
        config.cloudinary.apiKey &&
        config.cloudinary.apiSecret
      ),
      cloudName: config.cloudinary.cloudName || '',
    };
  },
};
