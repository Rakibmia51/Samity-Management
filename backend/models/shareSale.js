const mongoose = require('mongoose');

const shareSaleSchema = new mongoose.Schema({
  saleNumber: { type: String, unique: true },
  projectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // শুধু এটিই যথেষ্ট
  quantity: { type: Number, required: true },
  pricePerShare: { type: Number, required: true },
  totalAmount: { type: Number},
  paymentMethod: { 
    type: String, 
    enum: ['Cash', 'Bank', 'Mobile Bank'],  
            },
  soldBy: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', // Reference to the Admin/Staff who made the sale 
  },
  saleDate: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model('ShareSale', shareSaleSchema);