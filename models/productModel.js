const mongoose = require("mongoose");

const productSchema = mongoose.Schema({
  name: {
    type: String,
    required: [true, "Please enter the name"],
    trim: true,
  },
  description: {
    type: String,
    required: [true, "Please enter the description"],
  },
  price: {
    type: Number,
    required: [true, "Please enter the price"],
    maxlength: [8, "price cannot exceed of 8 character"],
  },
  rating: {
    type: Number,
    default: 0,
  },
  images: [
    {
      public_id: {
        type: String,
        required: true,
      },
      url: {
        type: String,
        required: true,
      },
    },
  ],
  category: {
    type: String,
    required: [true, "plaese enter the category"],
  },
  stock: {
    type: Number,
    required: [true, "plaese enter the stock"],
    maxlength: [4, "stock cannot exceed of 4 character"],
    default: 1,
  },
  numOfReviews: {
    type: Number,
    default: 0,
  },
  reviews: [
    {
      user: {
        type: mongoose.Schema.ObjectId,
        ref: "User",
        required: true,
      },
      name: {
        type: String,
        required: true,
      },
      rating: {
        type: Number,
        required: true,
      },
      comment: {
        type: String,
        required: true,
      },
    },
  ],
  user: {
    type: mongoose.Schema.ObjectId,
    ref: "User",
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Product", productSchema);
