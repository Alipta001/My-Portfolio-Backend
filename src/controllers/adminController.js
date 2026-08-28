const bcrypt = require('bcryptjs');
const Admin = require('../models/Admin');
const Project = require('../models/Project');
const Skill = require('../models/Skill');
const Experience = require('../models/Experience');
const Education = require('../models/Education');
const Service = require('../models/Service');
const Contact = require('../models/Contact');
const slugify = require('slugify');

const resources = { projects: Project, skills: Skill, experience: Experience, education: Education, services: Service };
const fields = {
  projects: ['title', 'category', 'desc', 'tech', 'image', 'gradient', 'size', 'link', 'published'],
  skills: ['category', 'tools', 'icon', 'order'],
  experience: ['role', 'company', 'location', 'startDate', 'endDate', 'description', 'order'],
  education: ['degree', 'institution', 'startDate', 'endDate', 'description', 'order'],
  services: ['title', 'icon', 'image', 'description', 'features', 'tags', 'pricing', 'color', 'order', 'published'],
};

class AdminController {
  constructor() {
    this.resources = resources;
    this.fields = fields;
    this.dashboard = this.dashboard.bind(this);
    this.contacts = this.contacts.bind(this);
    this.toggleContact = this.toggleContact.bind(this);
    this.deleteContact = this.deleteContact.bind(this);
    this.seedAdmin = this.seedAdmin.bind(this);
    this.resourceController = this.resourceController.bind(this);
  }

  clean(value) {
    if (Array.isArray(value)) return value.filter(Boolean);
    if (typeof value === 'string' && value.includes('\n')) return value.split('\n').map(item => item.trim()).filter(Boolean);
    return value;
  }

  payload(resource, body, file) {
    const result = {};
    this.fields[resource].forEach(field => { if (body[field] !== undefined) result[field] = this.clean(body[field]); });
    if (file) result.image = `/uploads/${file.filename}`;
    if (resource === 'projects' && result.title && !body.slug) result.slug = slugify(result.title, { lower: true, strict: true });
    return result;
  }

  resourceController(resource) {
    const Model = this.resources[resource];
    return {
      index: async (req, res) => res.render(`${resource}/index`, { title: resource, resource, records: await Model.find().sort({ order: 1, createdAt: -1 }).lean() }),
      newForm: async (req, res) => res.render(`${resource}/form`, { title: `New ${resource}`, resource, record: {}, errors: [] }),
      create: async (req, res) => { await Model.create(this.payload(resource, req.body, req.file)); res.redirect(`/admin/${resource}`); },
      editForm: async (req, res) => res.render(`${resource}/form`, { title: `Edit ${resource}`, resource, record: await Model.findById(req.params.id).lean(), errors: [] }),
      update: async (req, res) => { await Model.findByIdAndUpdate(req.params.id, this.payload(resource, req.body, req.file), { runValidators: true }); res.redirect(`/admin/${resource}`); },
      remove: async (req, res) => { await Model.findByIdAndDelete(req.params.id); res.redirect(`/admin/${resource}`); },
    };
  }

  async dashboard(req, res) {
    const [projects, skills, experience, education, services, unread] = await Promise.all([Project.countDocuments(), Skill.countDocuments(), Experience.countDocuments(), Education.countDocuments(), Service.countDocuments(), Contact.countDocuments({ read: false })]);
    return res.render('dashboard/index', { title: 'Dashboard', counts: { projects, skills, experience, education, services, unread } });
  }

  async contacts(req, res) { return res.render('contacts/index', { title: 'Contacts', contacts: await Contact.find().sort({ createdAt: -1 }).lean() }); }
  async toggleContact(req, res) { await Contact.findByIdAndUpdate(req.params.id, { read: req.body.read === 'true' }); return res.redirect('/admin/contacts'); }
  async deleteContact(req, res) { await Contact.findByIdAndDelete(req.params.id); return res.redirect('/admin/contacts'); }

  async seedAdmin(req, res) {
    if (await Admin.countDocuments()) return res.status(409).send('An admin already exists.');
    const { name, email, password } = req.body;
    await Admin.create({ name, email, password: await bcrypt.hash(password, 12) });
    return res.redirect('/admin/login');
  }
}

module.exports = new AdminController();
