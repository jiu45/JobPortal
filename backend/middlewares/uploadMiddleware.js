const multer = require('multer');

//configure storage

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + '-' + file.originalname);
    }
});

//File filter

const fileFilter = (req, file, cb) => {
  const allowedTypes = [
    // images
    "image/jpeg",
    "image/jpg",
    "image/png",

    // resume/docs
    "application/pdf",
    "application/msword", // .doc
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document", // .docx
    "text/plain", // .txt
    "application/rtf", // .rtf
  ];

  if (allowedTypes.includes(file.mimetype)) cb(null, true);
  else cb(new Error("Invalid file type."), false);
};

const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    //limits: {fileSize: 5 * 1024 * 1024} //5MB limit
});

module.exports = upload;