const Project = require('../models/Project');
const Skill = require('../models/Skill');
const Experience = require('../models/Experience');
const Education = require('../models/Education');
const Service = require('../models/Service');
const Contact = require('../models/Contact');
const { notifyOwner } = require('../utils/mailer');

class ApiController {
  constructor() {
    this.listProjects = this.listProjects.bind(this);
    this.projectBySlug = this.projectBySlug.bind(this);
    this.listSkills = this.listSkills.bind(this);
    this.listExperience = this.listExperience.bind(this);
    this.listEducation = this.listEducation.bind(this);
    this.listServices = this.listServices.bind(this);
    this.createContact = this.createContact.bind(this);
  }

  response(res, message, data = []) {
    return res.json({ success: true, message, data });
  }

  async list(model, req, res) {
    const filter = model === Project || model === Service ? { published: true } : {};
    const data = await model.find(filter).sort({ order: 1, createdAt: -1 }).lean();
    return this.response(res, 'Records loaded', data);
  }

  listProjects(req, res) { return this.list(Project, req, res); }
  listSkills(req, res) { return this.list(Skill, req, res); }
  listExperience(req, res) { return this.list(Experience, req, res); }
  listEducation(req, res) { return this.list(Education, req, res); }
  listServices(req, res) { return this.list(Service, req, res); }

  async projectBySlug(req, res) {
    const project = await Project.findOne({ slug: req.params.slug, published: true }).lean();
    if (!project) return res.status(404).json({ success: false, message: 'Project not found', data: [] });
    return this.response(res, 'Project loaded', [project]);
  }

  async createContact(req, res) {
    console.log('📩 Contact request received');

    try {
      const { name, email, message } = req.body;
      const contact = await Contact.create({
        name: String(name || '').trim(),
        email: String(email || '').trim().toLowerCase(),
        message: String(message || '').trim(),
      });

      console.log('✅ Contact saved to MongoDB');

      let emailSent = false;

      try {
        emailSent = await notifyOwner(contact);
      } catch (error) {
        console.error('Contact email failed:', error.message || error);
        emailSent = false;
      }

      console.log(`📧 Email result: ${emailSent}`);
      console.log('🚀 Sending API response');

      return res.status(201).json({
        success: true,
        message: 'Your message has been received.',
        emailSent,
        data: [contact],
      });
    } catch (error) {
      console.error('Contact create failed:', error.message || error);
      return res.status(500).json({
        success: false,
        message: 'Unable to save your message right now.',
        data: [],
      });
    }
  }
}

module.exports = new ApiController();
