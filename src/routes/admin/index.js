const express = require('express');
const methodOverride = require('method-override');
const { requireAdmin } = require('../../middleware/auth');
const { imageUpload } = require('../../middleware/upload');
const auth = require('../../controllers/authController');
const controller = require('../../controllers/adminController');

const router = express.Router();
router.use(methodOverride('_method'));
router.get('/login', (req, res) => res.render('auth/login', { title: 'Admin Login', error: null }));
router.post('/login', auth.login);
router.get('/logout', auth.logout);
router.get('/setup', (req, res) => res.render('auth/setup', { title: 'Create Admin' }));
router.post('/setup', controller.seedAdmin);
router.use(requireAdmin);
router.get('/dashboard', controller.dashboard);
router.get('/contacts', controller.contacts);
router.post('/contacts/:id/read', controller.toggleContact);
router.delete('/contacts/:id', controller.deleteContact);

Object.entries(controller.resources).forEach(([resource]) => {
  const actions = controller.resourceController(resource);
  router.get(`/${resource}`, actions.index);
  router.get(`/${resource}/new`, actions.newForm);
  router.post(`/${resource}`, imageUpload.single('image'), actions.create);
  router.get(`/${resource}/:id/edit`, actions.editForm);
  router.put(`/${resource}/:id`, imageUpload.single('image'), actions.update);
  router.delete(`/${resource}/:id`, actions.remove);
});
module.exports = router;
