const ApiResponse = require("./ApiResponse");

exports.checkImageFile = (req, res, next) => {
  if (!req.files || !req.files.image) {
    return res
      .status(400)
      .json(new ApiResponse().error("Image file is required"));
  }
  const allowedExtensions = [
    "image/png",
    "image/jpeg",
    "image/jpg",
    "image/webp",
    "video/mp4",
    "image/gif"
  ];
  const extension = req.files.image.mimetype;
  if (allowedExtensions.includes(extension)) {
    next();
  } else {
    res.status(400).json(new ApiResponse().error("Unsupported file type."));
  }
};
