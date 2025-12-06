const multer = require("multer");
const path = require("path");
const fs = require("fs");

const messagesUploadPath = path.join(__dirname, "..", "uploads", "messages");

// đảm bảo thư mục tồn tại
if (!fs.existsSync(messagesUploadPath)) {
  fs.mkdirSync(messagesUploadPath, { recursive: true });
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, messagesUploadPath);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix =
      Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, file.fieldname + "-" + uniqueSuffix + ext);
  },
});

const fileFilter = (req, file, cb) => {
  // nếu muốn giới hạn loại file thì check mimetype ở đây
  cb(null, true);
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB / file
  },
});

// nhận nhiều file với field name "attachments"
const messageUploadMiddleware = upload.array("attachments", 5);

module.exports = messageUploadMiddleware;
