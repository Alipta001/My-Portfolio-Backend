// const express = require('express');
// const methodOverride = require('method-override');
// const { requireAdmin } = require('../../middleware/auth');
// const { imageUpload } = require('../../middleware/upload');
// const auth = require('../../controllers/authController');
// const controller = require('../../controllers/adminController');

// const router = express.Router();
// router.use(methodOverride('_method'));
// router.get('/login', (req, res) => res.render('auth/login', { title: 'Admin Login', error: null }));
// router.post('/login', auth.login);
// router.get('/logout', auth.logout);
// router.get('/setup', (req, res) => res.render('auth/setup', { title: 'Create Admin' }));
// router.post('/setup', controller.seedAdmin);
// router.use(requireAdmin);
// router.get('/dashboard', controller.dashboard);
// router.get('/contacts', controller.contacts);
// router.post('/contacts/:id/read', controller.toggleContact);
// router.delete('/contacts/:id', controller.deleteContact);

// Object.entries(controller.resources).forEach(([resource]) => {
//   const actions = controller.resourceController(resource);
//   router.get(`/${resource}`, actions.index);
//   router.get(`/${resource}/new`, actions.newForm);
//   router.post(`/${resource}`, imageUpload.single('image'), actions.create);
//   router.get(`/${resource}/:id/edit`, actions.editForm);
//   router.put(`/${resource}/:id`, imageUpload.single('image'), actions.update);
//   router.delete(`/${resource}/:id`, actions.remove);
// });
// module.exports = router;


const express = require("express");
const methodOverride = require("method-override");

const { requireAdmin } = require("../../middleware/auth");
const { imageUpload } = require("../../middleware/upload");

const auth = require("../../controllers/authController");
const controller = require("../../controllers/adminController");

// ======================================================
// ROUTER
// ======================================================

const router = express.Router();

// ======================================================
// METHOD OVERRIDE
// ======================================================

router.use(methodOverride("_method"));

// ======================================================
// ADMIN ROOT
// ======================================================

// GET /admin
// If the admin is already logged in, go to dashboard.
// Otherwise, go to login.

router.get("/", (req, res) => {
  if (req.session?.admin) {
    return res.redirect("/admin/dashboard");
  }

  return res.redirect("/admin/login");
});

// ======================================================
// AUTH ROUTES
// ======================================================

// GET /admin/login
router.get("/login", (req, res) => {
  // If already logged in, don't show login again
  if (req.session?.admin) {
    return res.redirect("/admin/dashboard");
  }

  return res.render("auth/login", {
    title: "Admin Login",
    error: null,
  });
});

// POST /admin/login
router.post("/login", auth.login);

// GET /admin/logout
router.get("/logout", auth.logout);

// ======================================================
// ADMIN SETUP ROUTES
// ======================================================

// GET /admin/setup
router.get("/setup", (req, res) => {
  // If already logged in, go to dashboard
  if (req.session?.admin) {
    return res.redirect("/admin/dashboard");
  }

  return res.render("auth/setup", {
    title: "Create Admin",
  });
});

// POST /admin/setup
router.post("/setup", controller.seedAdmin);

// ======================================================
// PROTECTED ADMIN ROUTES
// ======================================================

// Everything below this middleware requires admin authentication.

router.use(requireAdmin);

// ======================================================
// DASHBOARD
// ======================================================

// GET /admin/dashboard
router.get("/dashboard", controller.dashboard);

// ======================================================
// CONTACT MANAGEMENT
// ======================================================

// GET /admin/contacts
router.get("/contacts", controller.contacts);

// POST /admin/contacts/:id/read
router.post(
  "/contacts/:id/read",
  controller.toggleContact
);

// DELETE /admin/contacts/:id
router.delete(
  "/contacts/:id",
  controller.deleteContact
);

// ======================================================
// DYNAMIC RESOURCE ROUTES
// ======================================================

Object.entries(controller.resources).forEach(
  ([resource]) => {
    const actions =
      controller.resourceController(resource);

    // GET /admin/projects
    // GET /admin/skills
    // GET /admin/services
    router.get(
      `/${resource}`,
      actions.index
    );

    // GET /admin/projects/new
    // GET /admin/skills/new
    // GET /admin/services/new
    router.get(
      `/${resource}/new`,
      actions.newForm
    );

    // POST /admin/projects
    // POST /admin/skills
    // POST /admin/services
    router.post(
      `/${resource}`,
      imageUpload.single("image"),
      actions.create
    );

    // GET /admin/projects/:id/edit
    router.get(
      `/${resource}/:id/edit`,
      actions.editForm
    );

    // PUT /admin/projects/:id
    router.put(
      `/${resource}/:id`,
      imageUpload.single("image"),
      actions.update
    );

    // DELETE /admin/projects/:id
    router.delete(
      `/${resource}/:id`,
      actions.remove
    );
  }
);

// ======================================================
// EXPORT
// ======================================================

module.exports = router;
