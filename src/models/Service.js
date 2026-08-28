const mongoose = require('mongoose');

const serviceSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  icon: { type: String, default: 'Code' },
  image: { type: String, default: '' },
  description: { type: String, trim: true, default: '' },
  features: [{ type: String, trim: true }],
  tags: [{ type: String, trim: true }],
  pricing: { type: String, default: '' },
  color: { type: String, default: 'from-cyan-500/20 to-blue-500/20' },
  order: { type: Number, default: 0 },
  published: { type: Boolean, default: true },
}, { timestamps: true });

module.exports = mongoose.model('Service', serviceSchema);
