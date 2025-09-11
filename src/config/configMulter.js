import multer from "multer";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import { dirname } from "path";

const _filename = fileURLToPath(import.meta.url); // Lấy đường dẫn tuyệt đối của file hiện tại
const storagePath = path.join(dirname(_filename), "..", "public");
fs.mkdirSync(storagePath, { recursive: true });
fs.mkdirSync(path.join(storagePath, "/posters"), { recursive: true });

const storage = multer.diskStorage({
  //==> disk |><| memoryStorage => in main memory
  destination: (req, file, cb) => cb(null, path.join(storagePath, "/posters")),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase(); // lấy đuôi file gốc (.jpg, .png, ...)
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const fileName = `${uniqueSuffix}${ext}`;
    cb(null, fileName);
  },
});
const upload = multer({
  storage,
  //   limits: { fileSize: 15 * 1024 * 1024 }, // 15MB
  //   fileFilter: (req, file, cb) => {
  //     if (/^image\/(jpeg|png|webp)$/.test(file.mimetype)) cb(null, true);
  //     else cb(new Error("Only jpeg/png/webp allowed"));
  //   },
});

export default upload;
