const Project = require("../models/Project");
const Skill = require("../models/Skill");
const Experience = require("../models/Experience");
const Education = require("../models/Education");
const Service = require("../models/Service");
const Contact = require("../models/Contact");

const { notifyOwner } = require("../utils/mailer");

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

  // ======================================================
  // SUCCESS RESPONSE
  // ======================================================

  response(res, message, data = []) {
    return res.json({
      success: true,
      message,
      data,
    });
  }

  // ======================================================
  // GENERIC LIST
  // ======================================================

  async list(model, req, res) {
    try {
      const filter =
        model === Project || model === Service
          ? { published: true }
          : {};

      const data = await model
        .find(filter)
        .sort({
          order: 1,
          createdAt: -1,
        })
        .lean();

      return this.response(
        res,
        "Records loaded",
        data
      );
    } catch (error) {
      console.error(
        "Failed to load records:",
        error.message
      );

      return res.status(500).json({
        success: false,
        message: "Unable to load records",
        data: [],
      });
    }
  }

  // ======================================================
  // PROJECTS
  // ======================================================

  listProjects(req, res) {
    return this.list(Project, req, res);
  }

  // ======================================================
  // SKILLS
  // ======================================================

  listSkills(req, res) {
    return this.list(Skill, req, res);
  }

  // ======================================================
  // EXPERIENCE
  // ======================================================

  listExperience(req, res) {
    return this.list(Experience, req, res);
  }

  // ======================================================
  // EDUCATION
  // ======================================================

  listEducation(req, res) {
    return this.list(Education, req, res);
  }

  // ======================================================
  // SERVICES
  // ======================================================

  listServices(req, res) {
    return this.list(Service, req, res);
  }

  // ======================================================
  // PROJECT BY SLUG
  // ======================================================

  async projectBySlug(req, res) {
    try {
      const project = await Project.findOne({
        slug: req.params.slug,
        published: true,
      }).lean();

      if (!project) {
        return res.status(404).json({
          success: false,
          message: "Project not found",
          data: [],
        });
      }

      return this.response(
        res,
        "Project loaded",
        [project]
      );
    } catch (error) {
      console.error(
        "Failed to load project:",
        error.message
      );

      return res.status(500).json({
        success: false,
        message: "Unable to load project",
        data: [],
      });
    }
  }

  // ======================================================
  // CREATE CONTACT
  // ======================================================

  async createContact(req, res) {
    console.log("📩 Contact request received");

    try {
      const { name, email, message } = req.body;

      // ==========================================
      // BASIC VALIDATION
      // ==========================================

      const cleanName = String(name || "").trim();

      const cleanEmail = String(
        email || ""
      )
        .trim()
        .toLowerCase();

      const cleanMessage = String(
        message || ""
      ).trim();

      if (!cleanName || !cleanEmail || !cleanMessage) {
        return res.status(400).json({
          success: false,
          message:
            "Name, email and message are required.",
          data: [],
        });
      }

      // ==========================================
      // SAVE TO MONGODB
      // ==========================================

      const contact = await Contact.create({
        name: cleanName,
        email: cleanEmail,
        message: cleanMessage,
      });

      console.log(
        "✅ Contact saved to MongoDB"
      );

      // ==========================================
      // SEND EMAIL THROUGH BREVO
      // ==========================================

      let emailSent = false;

      let emailResult = null;

      try {
        emailResult = await notifyOwner(
          contact
        );

        /*
          notifyOwner returns:

          {
            success: true,
            messageId: "..."
          }

          OR

          {
            success: false,
            error: "..."
          }
        */

        emailSent =
          emailResult?.success === true;

        console.log(
          "📧 Email success:",
          emailSent
        );

        if (emailResult?.messageId) {
          console.log(
            "📨 Brevo Message ID:",
            emailResult.messageId
          );
        }

        if (!emailSent) {
          console.error(
            "❌ Email sending failed:",
            emailResult?.error ||
              "Unknown error"
          );
        }

      } catch (error) {
        console.error(
          "❌ Contact email failed:",
          error.message || error
        );

        emailSent = false;
      }

      // ==========================================
      // SEND RESPONSE
      // ==========================================

      console.log(
        "🚀 Sending API response"
      );

      return res.status(201).json({
        success: true,

        message:
          "Your message has been received successfully.",

        emailSent,

        data: contact,
      });

    } catch (error) {
      console.error(
        "❌ Contact creation failed:",
        error.message || error
      );

      return res.status(500).json({
        success: false,

        message:
          "Unable to save your message right now.",

        data: [],
      });
    }
  }
}

module.exports = new ApiController();