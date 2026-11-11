const mongoose = require("mongoose");

const bannerSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Banner title is required."],
      trim: true,
    },
    image: {
      type: String,
      required: [true, "Banner image is required."],
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

exports.Banner = mongoose.model("Banner", bannerSchema);
