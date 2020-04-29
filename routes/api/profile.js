const express = require('express');
const auth = require('../../middleware/auth');
const { check, validationResult } = require('express-validator');

const Profile = require('../../models/Profile');
const User = require('../../models/User');

const router = express.Router();

//route: GET api/profile
//desc: Get all existing profiles
//access: public
router.get('/', async (req, res) => {
  try {
    const profiles = await Profile.find().populate('user', ['name', 'avatar']);
    res.json(profiles);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

//route: GET api/profile/user/:user_id
//desc: Get profile by user ID
//access: public
router.get('/user/:user_id', async (req, res) => {
  try {
    const profile = await Profile.findOne({
      user: req.params.user_id,
    }).populate('user', ['name', 'avatar']);

    if (!profile) return res.status(400).json({ msg: 'Profile not found' });

    res.json(profile);
  } catch (err) {
    console.error(err.message);
    if (err.name == 'CastError') {
      return res.status(400).json({ msg: 'Profile not found' });
    }
    res.status(500).send('Server Error');
  }
});

//route: GET api/profile/me
//desc: get current users profile
//access: Private
router.get('/me', auth, async (req, res) => {
  try {
    //check db if there is a profile connected from your user id
    const profile = await Profile.findOne({
      user: req.user.id,
    }).populate('user', ['name', 'avatar']);

    if (!profile) {
      return res.status(400).json({ msg: 'Profile not found' });
    }

    res.json(profile);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

//route: POST api/profile
//desc: create or update a user profile
//access: Private
router.post(
  '/',
  [
    auth,
    check('status', 'Status is required').not().isEmpty(),
    check('skills', 'Skills is required').not().isEmpty(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { skills, social } = req.body;

    //Build profile object
    const profileFields = {
      user: req.user.id,
      ...req.body,
      skills: skills.split(',').map((skill) => skill.trim()),
      social,
    };

    try {
      let profile = await Profile.findOne({ user: req.user.id });

      if (profile) {
        return res.status(400).json({ msg: 'Profile already exists' });
      }
      //Create new profile then save it to DB
      profile = new Profile(profileFields);
      await profile.save();
      res.json(profile);
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server Error');
    }
  }
);

//route: PUT api/profile
//desc: update a user profile
//access: Private
router.put(
  '/',
  [
    auth,
    check('status', 'Status is required').not().isEmpty(),
    check('skills', 'Skills is required').not().isEmpty(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { skills, social } = req.body;

    //Build profile object
    const profileFields = {
      user: req.user.id,
      ...req.body,
      skills: skills.split(',').map((skill) => skill.trim()),
      social,
    };

    try {
      let profile = await Profile.findOne({ user: req.user.id });

      //update profile
      profile = await Profile.findOneAndUpdate(
        { user: req.user.id },
        { $set: profileFields },
        { new: true }
      );

      return res.json(profile);
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server Error');
    }
  }
);

//old post/put route
// router.post(
//   '/',
//   [
//     auth,
//     check('status', 'Status is required').not().isEmpty(),
//     check('skills', 'Skills is required').not().isEmpty(),
//   ],
//   async (req, res) => {
//     const errors = validationResult(req);
//     if (!errors.isEmpty()) {
//       return res.status(400).json({ errors: errors.array() });
//     }

//     const { skills, social } = req.body;

//     //Build profile object
//     const profileFields = {
//       user: req.user.id,
//       ...req.body,
//       skills: skills.split(',').map((skill) => skill.trim()),
//       social,
//     };

//     try {
//       let profile = await Profile.findOne({ user: req.user.id });

//       if(profile){
//         profile = await Profile.findOneAndUpdate(
//           { user: req.user.id },
//           { $set: profileFields },
//           { new: true }
//         );

//         return res.json(profile);
//       }

//       //Create new profile then save it to DB
//       profile = new Profile(profileFields);
//       await profile.save();
//       res.json(profile);
//     } catch (err) {
//       console.error(err.message);
//       res.status(500).send('Server Error');
//     }
//   }
// );

module.exports = router;