const mongoose = require("mongoose");

const cartSchema = new mongoose.Schema(
  {
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "products",
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    productQuantity: {
      type: Number,
      default: 1,
      required: true,
    }
  },
  { timestamps: true }
);

const cartModel = mongoose.model("userCart", cartSchema);

module.exports = cartModel;
