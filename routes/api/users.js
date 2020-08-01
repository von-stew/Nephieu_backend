const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator/check');

// @route   GET api/users
// @desc    Register user
// @access  Public
router.post(
  '/',
  [
    //check for name
    check('name', 'Name is Required').not().isEmpty(),
    //check for email
    check('email', 'Please enter a valid email').isEmail(),
    //check for password
    check(
      'password',
      'Please enter a password with 6 or mote characters'
    ).isLength({ min: 6 })
  ],
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    res.send('Passed!');
  }
);

module.exports = router;
