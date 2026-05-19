const mongoose = require('mongoose');

const investmentEndpointSchema = new mongoose.Schema({

  endNumber: { type: String, unique: true },
  // ১. কোন প্রজেক্টের আন্ডারে এই লেনদেন (Reference)
  projectId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
    required: [true, "Project ID obossoi lagbe"]
  },
  
  // ২. এন্ডপয়েন্ট বা খাতের নাম (যেমন: সার কেনা, মাছ বিক্রি, ইত্যাদি)
  endpointName: {
    type: String,
    required: [true, "Endpoint name dorkar"],
    trim: true
  },

  // ৩. টাইপ: এটি কি আয় নাকি ব্যয়?
  type: {
    type: String,
    enum: ['Income', 'Expense'],
    required: [true, "Type select korun (Income ba Expense)"]
  },

  // ৪. লেনদেনের তারিখ
  date: {
    type: Date,
    default: Date.now,
    required: true
  },
  paymentMethod: { 
    type: String, 
    enum: ['Cash', 'Bank', 'Mobile Bank'],
  },
  // ৫. টাকার পরিমাণ
  amount: {
    type: Number,
    required: [true, "Amount obossoi dite hobe"],
    min: [0, "Amount negative hote parbe na"]
  },

  // ৬. বিস্তারিত বর্ণনা
  description: {
    type: String,
    trim: true
  },

  // অতিরিক্ত তথ্য (কে এন্ট্রি দিয়েছে)
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, { 
  timestamps: true // createdAt এবং updatedAt অটো তৈরি হবে
});

const InvestmentEndpoint = mongoose.model('InvestmentEndpoint', investmentEndpointSchema);

module.exports = InvestmentEndpoint;
