import mongoose from "mongoose";

const productSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  description: String,
  media: [String],
  category: {
    type: String,
    required: true
  },
  collections: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Collection'
  }],
  tags: [String],
  sizes: [String],
  colors: [String],
  price: {
    type: mongoose.Schema.Types.Decimal128,
    required: true,
    min: 0
  },
  expense: {
    type: mongoose.Schema.Types.Decimal128,
    required: true,
    min: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

const Product = mongoose.models.Product || mongoose.model("Product", productSchema);

export default Product;