const bcrypt = require('bcryptjs');
const Admin = require('../models/Admin');

class AuthController {
  constructor() {
    this.login = this.login.bind(this);
    this.logout = this.logout.bind(this);
  }

  async login(req, res) {
    const admin = await Admin.findOne({ email: req.body.email }).select('+password');
    if (!admin || !(await bcrypt.compare(req.body.password, admin.password))) {
      return res.status(401).render('auth/login', { title: 'Admin Login', error: 'Invalid email or password' });
    }
    req.session.admin = { id: admin._id.toString(), name: admin.name, email: admin.email };
    return res.redirect('/admin/dashboard');
  }

  logout(req, res) {
    req.session.destroy(() => res.redirect('/admin/login'));
  }
}

module.exports = new AuthController();
