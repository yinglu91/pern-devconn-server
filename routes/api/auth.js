const express = require('express');
const { check, validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const gravatar = require('gravatar');
const jwt = require('jsonwebtoken');
const pool = require('../../db');
const auth = require('../../middleware/auth');

const router = express.Router();

// @route   GET api/auth/user
// @desc    get user by token
// @access  Private
router.get('/user', auth, async (req, res) => {
  try {
    const user = await pool.query(`SELECT id, name, email, avatar, date FROM users WHERE id = $1`, [
      req.user.id
    ]);

    res.json(user.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   POST api/auth/register
// @desc    Register user (create user)
// @access  Public
router.post(
  '/register',
  [
    check('name', 'Name is required').not().isEmpty(),
    check('email', 'Please include a valid email').isEmail(),
    check(
      'password',
      'Please enter a password with 6 or more characters'
    ).isLength({ min: 6 }),
  ],
  async (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, email, password } = req.body;

    try {
      const user = await pool.query("SELECT * FROM users WHERE email = $1", [email]);

    if (user.rows.length > 0) {
      return res.status(400).json("User already exist!");
    }

    const avatar = gravatar.url(email, {
        s: '200',
        r: 'pg',
        d: 'mm',
      });

    const salt = await bcrypt.genSalt(10);
    const bcryptPassword = await bcrypt.hash(password, salt);

    let newUser = await pool.query(
      `INSERT INTO users (name, email, password, avatar) VALUES ($1, $2, $3, $4)  RETURNING *`,
        [name, email, bcryptPassword, avatar]
    );

    // Return jsonwebtoken
    const payload = {
        user: {
          id: newUser.rows[0].id,
          name: newUser.rows[0].name,
          email: newUser.rows[0].email
        },
      };

    const token = jwt.sign(payload, process.env.JWT_SECRET, {
        expiresIn: 3600000,
      });

      return res.json({ token });
    } catch (err) {
      console.error(err.message);
      return res.status(500).send('Server error');
    }
  }
);

// @route   POST api/auth/login
// @desc    Authenticate user & get token
// @access  Public
router.post(
  '/login',
  [
    check('email', 'Please include a valid email').isEmail(),
    check('password', 'Password is required').not().isEmpty(),
  ],
  async (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    try {
      const user = await pool.query("SELECT * FROM users WHERE email = $1", [
      email
    ]);

    if (user.rows.length === 0) {
      return res.status(401).json([
          {
            msg: 'Invalid Credential',
          },
        ]);
    }

      const isMatch = await bcrypt.compare(password, user.rows[0].password);
      if (!isMatch) {
        return res.status(401).json([
          {
            msg: 'Invalid Credential',
          },
        ]);
      }

      // Return jsonwebtoken
      const payload = {
        user: {
          id: user.rows[0].id,
          name: user.rows[0].name,
          email: user.rows[0].email
        },
      };

      const token = jwt.sign(payload, process.env.JWT_SECRET, {
        expiresIn: 3600000,
      });

      return res.json({ token });
    } catch (err) {
      console.error(err.message);
      return res.status(500).send('Server error');
    }
  }
);

// default export
module.exports = router;

/*
GET http://localhost:5000/api/auth/user
header: token with token as value
response body
{
    "id": 1,
    "name": "test1",
    "email": "test1@gmail.com",
    "avatar": "//www.gravatar.com/avatar/245cf079454dc9a3374a7c076de247cc?s=200&r=pg&d=mm",
    "date": "2020-10-08T02:14:09.848Z"
}

---
POST http://localhost:5000/api/auth/register
request body
{
   "name": "test3",
    "email":"test3@gmail.com",
    "password":"test123"
}

response body
{
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyIjp7ImlkIjo0LCJuYW1lIjoidGVzdDMiLCJlbWFpbCI6InRlc3QzQGdtYWlsLmNvbSJ9LCJpYXQiOjE2MDIxMjkzODYsImV4cCI6MTYwNTcyOTM4Nn0.dqaFG-rIdK_aT_Tisj1YInVQUuUcqJJNlr5DiogMS2M"
}

token's payload
{
  "user": {
    
    "id": 4,
    "name": "test3",
    "email": "test3@gmail.com"
  },
  "iat": 1602129386,
  "exp": 1605729386
}
---
POST http://localhost:5000/api/auth/login
request body
{
    "email":"test1@gmail.com",
    "password":"test123"
}

response body
{
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyIjp7ImlkIjoxLCJuYW1lIjoidGVzdDEiLCJlbWFpbCI6InRlc3QxQGdtYWlsLmNvbSJ9LCJpYXQiOjE2MDIxMjM3NDYsImV4cCI6MTYwNTcyMzc0Nn0.LsvyJzR0hcDefP12usFBCCODS7VwaQ34iM7CKiO_s1Y"
}
*/
