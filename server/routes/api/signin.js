const jwt=require('jsonwebtoken')
const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
// const auth = require('../../middleware/auth');
/* global localStorage, */
const config = require('config');
const { check, validationResult } = require('express-validator');

const User = require('../../models/student');

// @route    GET api/auth
// @desc     Get user by token
// @access   Private
router.get('/',  async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    res.json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route    POST api/auth
// @desc     Authenticate user & get token
// @access   Public
router.post(
  '/',
  check('email', 'Please include a valid email').isEmail(),
  check('password', 'Password is required').exists(),
  async (req, res) => {
    // const errors = validationResult(req);
    // if (!errors.isEmpty()) {
    //   return res.status(400).json({ errors: errors.array() });
    // }


    const { email, password } = req.body;
    console.log(email,password)
    try {
      let user = await User.findOne({ email });
      if (!user) {
        console.log(user)
        return res
          .status(400)
          .json({ errors: [{ msg: 'Invalid Credentials' }] });
      }
      // checks if the user exsists or not
        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
          console.log("in is match")
          return res
            .status(400)
            .json({ errors: [{ msg: 'Invalid Credentials' }] });
        }

      const payload = {
        user: {
          id: user.id
        } 
      };
      console.log(user.id)
      jwt.sign(
        payload,
        config.get('jwtSecret'),
        (err, token) => {
          if (err) throw err;
          res.json({ jwtToken:token });
          console.log(token)
          // try{localStorage.setItem("sessionUser",token);}
          // catch( error) {console.log(error)}

        }
      );
    } catch (err) {
      console.error(err.message);

      res.status(500).send('Server error');
    }
  }
);



module.exports = router;