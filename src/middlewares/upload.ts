import multer from 'multer';
import { AppError } from './errorHandler';

export const uploadImage = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (!file.mimetype.startsWith('image/')) {
      return cb(new AppError('Only image files are allowed', 400) as unknown as null, false);
    }
    cb(null, true);
  },
}).single('image');
