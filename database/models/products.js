const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    productImg: {
      type: String,
      required: true,
    },
    productName: {
      type: String,
      required: true,
    },
    productPrice: {
      type: String,
      required: true,
    },
    productDescription: {
      type: String,
      required: true,
    },
    productQuantity: {
      type: Number,
      required: true,
    },
    adminId: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

const productModel = mongoose.model("products", productSchema);

module.exports = productModel;
