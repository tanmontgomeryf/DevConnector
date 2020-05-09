const express = require('express');
const auth = require('../../middleware/auth');
const { check, validationResult } = require('express-validator');
const request = require('request');
const config = require('config');

const Profile = require('../../models/Profile');
const User = require('../../models/User');
const Post = require('../../models/Post');

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

//route: POST api/profile
//desc: create a user profile
//access: Private
router.post(
  '/me/new',
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
      const profile = await Profile.findOne({ user: req.user.id });

      if (profile) {
        return res.status(400).json({ msg: 'Profile already exists' });
      }
      //Create new profile then save it to DB
      newProfile = new Profile(profileFields);
      await newProfile.save();
      res.json(newProfile);
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server Error');
    }
  }
);

//route: GET api/profile/me
//desc: get the current user's profile
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

//route: PUT api/profile/me
//desc: update a user profile
//access: Private
router.put(
  '/me',
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
      //update profile
      const profile = await Profile.findOneAndUpdate(
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

//route: Delete api/profile/me
//desc: delete profiles, user & posts
//access: private
router.delete('/me', auth, async (req, res) => {
  try {
    //remove profile
    await Post.deleteMany({ user: req.user.id });
    await Profile.findOneAndRemove({ user: req.user.id });
    await User.findOneAndRemove({ _id: req.user.id });

    res.json({ msg: 'User Removed' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

//route: PUT api/profile/experience
//desc: create new experience
//access: Private
router.put(
  '/experience/new',
  [
    auth,
    check('title', 'Title is required').not().isEmpty(),
    check('company', 'Company is required').not().isEmpty(),
    check('from', 'From date is required').not().isEmpty(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const profile = await Profile.findOne({ user: req.user.id });

      profile.experience.unshift({ ...req.body });

      await profile.save();

      return res.json(profile);
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server Error');
    }
  }
);

//route: DELETE api/profile/experience/:exp_id
//desc: Delete experience
//access: Private
router.delete('/experience/:exp_id', auth, async (req, res) => {
  try {
    const profile = await Profile.findOne({ user: req.user.id });

    //get the index of the exprience to be deleted
    const removeIndex = profile.experience
      .map((exp) => exp.id)
      .indexOf(req.params.exp_id);

    profile.experience.splice(removeIndex, 1);

    await profile.save();

    return res.json(profile);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

//route: PUT api/profile/experience/:exp_id
//desc: Edit experience
//access: Private
router.put(
  '/experience/:exp_id',
  [
    auth,
    check('title', 'Title is required').not().isEmpty(),
    check('company', 'Company is required').not().isEmpty(),
    check('from', 'From date is required').not().isEmpty(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const profile = await Profile.findOne({ user: req.user.id });

      if (
        profile.experience.filter((exp) => exp.id === req.params.exp_id)
          .length === 0
      ) {
        return res.status(404).json({ msg: 'Experience not found' });
      }

      // get the index of the exprience to be deleted
      const removeIndex = profile.experience
        .map((exp) => exp.id)
        .indexOf(req.params.exp_id);

      //update the oldExp to the new one while retaining its id
      const oldExp = profile.experience[removeIndex];

      profile.experience[removeIndex] = {
        ...oldExp,
        ...req.body,
        _id: oldExp._id,
      };

      await profile.save();

      return res.json(profile);
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server Error');
    }
  }
);

//route: PUT api/profile/education
//desc: create new education
//access: Private
router.put(
  '/education/new',
  [
    auth,
    check('school', 'School is required').not().isEmpty(),
    check('degree', 'Degree is required').not().isEmpty(),
    check('from', 'From date is required').not().isEmpty(),
    check('fieldofstudy', 'Field of study is required').not().isEmpty(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const profile = await Profile.findOne({ user: req.user.id });

      profile.education.unshift({ ...req.body });

      await profile.save();

      return res.json(profile);
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server Error');
    }
  }
);

//route: DELETE api/profile/education/:edu_id
//desc: Delete education
//access: Private
router.delete('/education/:edu_id', auth, async (req, res) => {
  try {
    const profile = await Profile.findOne({ user: req.user.id });

    //get the index of the education to be deleted
    const removeIndex = profile.education
      .map((edu) => edu.id)
      .indexOf(req.params.edu);

    profile.education.splice(removeIndex, 1);

    await profile.save();

    return res.json(profile);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

//route: PUT api/profile/education/:edu_id
//desc: Edits education from profile
//access: Private
router.put(
  '/education/:edu_id',
  [
    auth,
    check('school', 'School is required').not().isEmpty(),
    check('degree', 'Degree is required').not().isEmpty(),
    check('from', 'From date is required').not().isEmpty(),
    check('fieldofstudy', 'Field of study is required').not().isEmpty(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const profile = await Profile.findOne({ user: req.user.id });

      // get the index of the education to be deleted
      const removeIndex = profile.education
        .map((edu) => edu.id)
        .indexOf(req.params.edu_id);

      //update the oldEdu to the new one while retaining its id
      const oldEdu = profile.education[removeIndex];

      profile.education[removeIndex] = {
        ...oldEdu,
        ...req.body,
        _id: oldEdu._id,
      };

      await profile.save();

      return res.json(profile);
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server Error');
    }
  }
);

//route: GET api/profile/github/:username
//desc: Get user repos from Github
//access: Public

router.get('/github/:username', (req, res) => {
  try {
    const options = {
      uri: `https://api.github.com/users/${
        req.params.username
      }/repos?per_page=5&sort=created:asc&client_id=${config.get(
        'githubClientId'
      )}&client_secret=${config.get('githubSecret')}`,
      method: 'GET',
      headers: { 'user-agent': 'node.js' },
    };

    request(options, (error, response, body) => {
      if (error) console.error(error);

      if (response.statusCode !== 200) {
        return res.status(404).json({ msg: 'No Github profile found' });
      }

      res.json(JSON.parse(body));
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;

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
