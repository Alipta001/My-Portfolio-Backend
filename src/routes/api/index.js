const express = require('express');
const controller = require('../../controllers/apiController');
const { contactValidation } = require('../../middleware/validation');

const router = express.Router();
router.get('/projects', controller.listProjects);
router.get('/projects/:slug', controller.projectBySlug);
router.get('/skills', controller.listSkills);
router.get('/experience', controller.listExperience);
router.get('/education', controller.listEducation);
router.get('/services', controller.listServices);
router.post('/contact', contactValidation, controller.createContact);

module.exports = router;
