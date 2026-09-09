const { v4: uuidv4 } = require("uuid");
const sharp = require("sharp");
const fs = require('fs');

const MB = 1024 * 1024;

exports.saveFile = async (folder, key, file) => {
  if (file.size > MB * 10) {
    throw new Error("Image is very big size.");
  }
  const filename = `${uuidv4()}.webp`;
  const uploadPath = `images/${folder}/${key}_${filename}`;
  const publicPath = `public/${uploadPath}`;
  const image_url = `/` + uploadPath;
  if (Buffer.isBuffer(file)) {
    await sharp(file).webp().toFile(publicPath);
  } else {
    await sharp(file.data).webp().toFile(publicPath);
  }
  return { image_url, key };
};


exports.removeFile = async (filePath) => {
  const publicPath = `public${filePath}`;
  if (fs.existsSync(publicPath)) {
    fs.rmSync(publicPath);
  }
};
