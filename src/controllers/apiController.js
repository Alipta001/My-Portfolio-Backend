const Project = require('../models/Project');
const Skill = require('../models/Skill');
const Experience = require('../models/Experience');
const Education = require('../models/Education');
const Service = require('../models/Service');
const Contact = require('../models/Contact');
const { notifyOwner } = require('../config/mailer');

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
    const contact = await Contact.create({ name: req.body.name, email: req.body.email, message: req.body.message });
    try { await notifyOwner(contact); } catch (error) { console.error('Contact email failed:', error.message); }
    return this.response(res, 'Message sent successfully', [contact]);
  }
}

module.exports = new ApiController();
