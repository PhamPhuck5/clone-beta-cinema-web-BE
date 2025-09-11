import movieServices from "./baseService/movieServices.js";
import path from "path";
import fs from "fs";
import sharp from "sharp";

async function convertToJpg(inputPath, outputPath) {
  await sharp(inputPath)
    .jpeg({ quality: 90 }) // nén ảnh JPG, quality tuỳ chỉnh
    .toFile(outputPath);
}

async function changePosterName(name, destination, originalName, oldPath) {
  let Movies = await movieServices.findMovieByName(name);
  const movieID = Movies.id;
  const ext = path.extname(originalName).toLowerCase();
  const newFileName = `${movieID}.jpg`;
  const newPath = path.join(destination, newFileName);

  if (ext !== ".jpg" && ext !== ".jpeg") {
    await convertToJpg(oldPath, newPath);
    await fs.promises.unlink(oldPath); // xóa file gốc sau khi convert
  } else {
    await fs.promises.rename(oldPath, newPath); // dùng promises
  }
}

const storageServices = {
  changePosterName: changePosterName,
};
export default storageServices;
