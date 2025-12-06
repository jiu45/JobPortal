const mongoose = require("mongoose");

const attachmentSchema = new mongoose.Schema(
  {
    url: { type: String, required: true },       // file path, vd: /uploads/messages/xxx.png
    filename: { type: String, required: true },  // original file name
    mimetype: { type: String, required: true },  // image/png, application/pdf...
    size: { type: Number, required: true },      // byte
    type: {
      type: String,
      enum: ["image", "file"],
      required: true, // image file: pdf/doc/zip...
    },
  },
  { _id: false }
);

const messageSchema = new mongoose.Schema(
  {
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    receiver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    text: {
      type: String,
      default: "",
    },
    attachments: [attachmentSchema],
    isRead: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Message", messageSchema);
