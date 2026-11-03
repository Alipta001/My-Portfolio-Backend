const bcrypt = require('bcryptjs');
const Admin = require('../models/Admin');
const Project = require('../models/Project');
const Skill = require('../models/Skill');
const Experience = require('../models/Experience');
const Education = require('../models/Education');
const Service = require('../models/Service');
const Contact = require('../models/Contact');
const slugify = require('slugify');

const resources = {
  projects: Project,
  skills: Skill,
  experience: Experience,
  education: Education,
  services: Service,
};

const fields = {
  projects: ['title', 'category', 'desc', 'tech', 'image', 'gradient', 'size', 'link', 'published'],
  skills: ['category', 'tools', 'icon', 'order'],
  experience: ['role', 'company', 'location', 'startDate', 'endDate', 'description', 'order'],
  education: ['degree', 'institution', 'startDate', 'endDate', 'description', 'order'],
  services: ['title', 'icon', 'image', 'description', 'features', 'tags', 'pricing', 'color', 'order', 'published'],
};

const arrayFields = new Set(['tech', 'tools', 'features', 'tags']);

class AdminController {
  constructor() {
    this.resources = resources;
    this.fields = fields;
    this.arrayFields = arrayFields;
    this.dashboard = this.dashboard.bind(this);
    this.contacts = this.contacts.bind(this);
    this.toggleContact = this.toggleContact.bind(this);
    this.deleteContact = this.deleteContact.bind(this);
    this.seedAdmin = this.seedAdmin.bind(this);
    this.resourceController = this.resourceController.bind(this);
  }

  clean(value, isArray = false) {
    if (isArray) {
      if (Array.isArray(value)) {
        return value.map(item => String(item).trim()).filter(Boolean);
      }
      if (typeof value === 'string') {
        return value.split(/[\r\n,]+/).map(item => item.trim()).filter(Boolean);
      }
      return [];
    }

    if (Array.isArray(value)) {
      return value.map(item => String(item).trim()).filter(Boolean).join('\n');
    }
    if (typeof value === 'string') {
      return value.trim();
    }
    return value;
  }

  async generateUniqueSlug(Model, title, requestedSlug, currentId = null) {
    let baseSlug = (requestedSlug || slugify(title || 'project', { lower: true, strict: true })).trim();
    if (!baseSlug) baseSlug = `project-${Date.now()}`;
    let slug = baseSlug;
    let counter = 1;

    try {
      if (Model.db && Model.db.readyState === 1) {
        while (true) {
          const query = { slug };
          if (currentId) {
            query._id = { $ne: currentId };
          }
          const existing = await Model.findOne(query).lean();
          if (!existing) {
            return slug;
          }
          slug = `${baseSlug}-${counter++}`;
        }
      }
    } catch (e) {
      console.warn('Slug uniqueness check skipped due to DB state:', e.message);
    }

    return slug;
  }

  async payload(resource, body, file, currentId = null) {
    const result = {};
    const resourceFields = this.fields[resource] || [];

    resourceFields.forEach(field => {
      if (field === 'published') {
        result.published = body.published === true || body.published === 'true' || body.published === 'on';
        return;
      }
      if (field === 'order') {
        result.order = body.order !== undefined && body.order !== '' ? Number(body.order) : 0;
        return;
      }
      if (body[field] !== undefined) {
        const isArray = this.arrayFields.has(field);
        result[field] = this.clean(body[field], isArray);
      }
    });

    // Handle uploaded file or image URL
    if (file) {
      result.image = `/uploads/${file.filename}`;
    } else if (body.imageUrl && typeof body.imageUrl === 'string' && body.imageUrl.trim()) {
      result.image = body.imageUrl.trim();
    } else if (body.image && typeof body.image === 'string' && body.image.trim()) {
      result.image = body.image.trim();
    }

    if (resource === 'projects') {
      if (!result.gradient) result.gradient = 'from-cyan-500 to-blue-500';
      if (!result.size) result.size = 'lg:col-span-6';
      result.slug = await this.generateUniqueSlug(
        this.resources.projects,
        result.title || body.title,
        body.slug,
        currentId
      );
    }

    return result;
  }

  extractErrors(error) {
    if (!error) return ['An unexpected error occurred.'];
    if (error.errors) {
      return Object.values(error.errors).map(err => err.message || `${err.path} is invalid`);
    }
    if (error.code === 11000) {
      const keys = Object.keys(error.keyValue || {}).join(', ');
      return [`A record with this ${keys || 'value'} already exists.`];
    }
    return [error.message || 'Operation failed. Please review your input.'];
  }

  resourceController(resource) {
    const Model = this.resources[resource];
    return {
      index: async (req, res) => {
        const records = await Model.find().sort({ order: 1, createdAt: -1 }).lean();
        return res.render(`${resource}/index`, { title: resource, resource, records });
      },
      newForm: async (req, res) => {
        return res.render(`${resource}/form`, {
          title: `New ${resource}`,
          resource,
          record: {},
          errors: [],
        });
      },
      create: async (req, res) => {
        try {
          const data = await this.payload(resource, req.body, req.file);
          await Model.create(data);
          return res.redirect(`/admin/${resource}`);
        } catch (error) {
          console.error(`Failed to create ${resource}:`, error);
          const errors = this.extractErrors(error);
          return res.status(400).render(`${resource}/form`, {
            title: `New ${resource}`,
            resource,
            record: req.body,
            errors,
          });
        }
      },
      editForm: async (req, res) => {
        const record = await Model.findById(req.params.id).lean();
        if (!record) {
          return res.redirect(`/admin/${resource}`);
        }
        return res.render(`${resource}/form`, {
          title: `Edit ${resource}`,
          resource,
          record,
          errors: [],
        });
      },
      update: async (req, res) => {
        try {
          const data = await this.payload(resource, req.body, req.file, req.params.id);
          await Model.findByIdAndUpdate(req.params.id, data, { runValidators: true });
          return res.redirect(`/admin/${resource}`);
        } catch (error) {
          console.error(`Failed to update ${resource}:`, error);
          const errors = this.extractErrors(error);
          return res.status(400).render(`${resource}/form`, {
            title: `Edit ${resource}`,
            resource,
            record: { ...req.body, _id: req.params.id },
            errors,
          });
        }
      },
      remove: async (req, res) => {
        await Model.findByIdAndDelete(req.params.id);
        return res.redirect(`/admin/${resource}`);
      },
    };
  }

  async dashboard(req, res) {
    const [projects, skills, experience, education, services, unread] = await Promise.all([
      Project.countDocuments(),
      Skill.countDocuments(),
      Experience.countDocuments(),
      Education.countDocuments(),
      Service.countDocuments(),
      Contact.countDocuments({ read: false }),
    ]);
    return res.render('dashboard/index', {
      title: 'Dashboard',
      counts: { projects, skills, experience, education, services, unread },
    });
  }

  async contacts(req, res) {
    const contacts = await Contact.find().sort({ createdAt: -1 }).lean();
    return res.render('contacts/index', { title: 'Contacts', contacts });
  }

  async toggleContact(req, res) {
    const isRead = req.body.read === 'true';
    await Contact.findByIdAndUpdate(req.params.id, { isRead, read: isRead }, { runValidators: true });
    return res.redirect('/admin/contacts');
  }

  async deleteContact(req, res) {
    await Contact.findByIdAndDelete(req.params.id);
    return res.redirect('/admin/contacts');
  }

  async seedAdmin(req, res) {
    if (await Admin.countDocuments()) return res.status(409).send('An admin already exists.');
    const { name, email, password } = req.body;
    await Admin.create({ name, email, password: await bcrypt.hash(password, 12) });
    return res.redirect('/admin/login');
  }
}

module.exports = new AdminController();
