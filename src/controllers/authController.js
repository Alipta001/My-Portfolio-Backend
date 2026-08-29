const bcrypt = require('bcryptjs');
const Admin = require('../models/Admin');

class AuthController {
  constructor() {
    this.login = this.login.bind(this);
    this.logout = this.logout.bind(this);
  }

  async login(req, res) {
    console.log('Login attempt:', req.body?.email || 'missing-email');

    try {
      const email = String(req.body?.email || '').trim().toLowerCase();
      const password = String(req.body?.password || '');

      if (!email || !password) {
        return res.status(400).render('auth/login', {
          title: 'Admin Login',
          error: 'Email and password are required',
        });
      }

      const admin = await Admin.findOne({ email }).select('+password');
      const isValidPassword = admin && admin.password && await bcrypt.compare(password, admin.password);

      if (!admin || !isValidPassword) {
        return res.status(401).render('auth/login', {
          title: 'Admin Login',
          error: 'Invalid email or password',
        });
      }

      req.session.admin = {
        id: admin._id.toString(),
        email: admin.email,
      };

      req.session.save((err) => {
        if (err) {
          console.error('Session save error:', err);
          return res.status(500).render('auth/login', {
            title: 'Admin Login',
            error: 'Unable to save session. Please try again.',
          });
        }

        return res.redirect('/admin/dashboard');
      });
    } catch (error) {
      console.error('Login catch error:', error);
      return res.status(500).render('auth/login', {
        title: 'Admin Login',
        error: 'Something went wrong while signing in',
      });
    }
  }

  logout(req, res) {
    req.session.destroy(() => res.redirect('/admin/login'));
  }
}

module.exports = new AuthController();
