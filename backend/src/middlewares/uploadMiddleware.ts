import multer from 'multer';
import path from 'path';
import { Request } from 'express';

// 1. Konfigurasi Storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'public/uploads/'); // Simpan dimari
  },
  filename: (req, file, cb) => {
    // Format: "Abangcolisluv.jpg"
    // Biar gak bentrok kalau ada user upload file bernama "foto.jpg" barengan
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

// 2. Filter Tipe File 
const fileFilter = (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true); // Terima
  } else {
    cb(new Error('Hanya boleh upload file gambar! (jpg/jpeg/png)')); // Tolak
  }
};

export const upload = multer({ 
  storage: storage,
  fileFilter: fileFilter,
  limits: { fileSize: 2 * 1024 * 1024 } // Limit 2MB ye biar server gak jebol
});