const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  slug: { type: String, required: true, unique: true, trim: true },
  category: { type: String, trim: true, default: '' },
  desc: { type: String, trim: true, default: '' },
  tech: [{ type: String, trim: true }],
  image: { type: String, default: '' },
  gradient: { type: String, default: 'from-cyan-500 to-blue-500' },
  size: { type: String, default: 'lg:col-span-6' },
  link: { type: String, default: '' },
  published: { type: Boolean, default: true },
}, { timestamps: true });

module.exports = mongoose.model('Project', projectSchema);
