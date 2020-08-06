const express = require('express');
const request = require('request');
const config = require('config');
const mongoose = require('mongoose');
const { restart } = require('nodemon');
const { check, validationResult } = require('express-validator');

const auth = require('../../middleware/auth');
const Profile = require('../../models/Profile');
const User = require('../../models/User');

const router = express.Router();

/*********************************************************************************************************************************************************************************************************************************


                                                        PLEASE FOR THE LOVE OF GOD REMEMBER TO MAKE AN UPDATE EXPERIENCE ROUTE!


*********************************************************************************************************************************************************************************************************************************/

// @route   GET api/profile/me
// @desc    GET current users profile
// @access  Private
router.get('/me', auth, async (req, res) => {
  try {
    const profile = await Profile.findOne({
      user: req.user.id
    }).populate('user', ['name', 'avatar']);

    if (!profile)
      return res.status(400).json({ msg: 'There is no profile for this user' });

    res.json(profile);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   POST api/profile
// @desc    CREATE/UPDATE user profile
// @access  Private

router.post(
  '/',
  [
    auth,
    [
      check('status', 'Status is required').not().isEmpty(),
      check('skills', 'Skills is required').not().isEmpty()
    ]
  ],
  async (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty())
      return res.status(400).json({ errors: errors.array() });

    const {
      company,
      website,
      location,
      bio,
      status,
      githubusername,
      skills,
      youtube,
      facebook,
      twitter,
      instagram,
      linkedin
    } = req.body;

    //Build profile object
    const profileFields = {};
    profileFields.user = req.user.id;

    if (company) profileFields.company = company;
    if (website) profileFields.website = website;
    if (location) profileFields.location = location;
    if (bio) profileFields.bio = bio;
    if (status) profileFields.status = status;
    if (githubusername) profileFields.githubusername = githubusername;
    if (skills)
      profileFields.skills = skills.split(',').map((skill) => skill.trim());

    // Build social object
    profileFields.social = {};
    if (youtube) profileFields.social.youtube = youtube;
    if (twitter) profileFields.social.twitter = twitter;
    if (facebook) profileFields.social.facebook = facebook;
    if (linkedin) profileFields.social.linkedin = linkedin;
    if (instagram) profileFields.social.instagram = instagram;

    try {
      let profile = await Profile.findOne({ user: req.user.id });

      //Update
      if (profile) {
        profile = await Profile.findOneAndUpdate(
          { user: req.user.id },
          { $set: profileFields },
          { new: true }
        );

        return res.json(profile);
      }

      //Create
      profile = new Profile(profileFields);
      await profile.save();

      res.json(profile);
    } catch (err) {
      console.error(err.message);
      res.status;
    }
  }
);

// @route   GET api/profile
// @desc    GET all profiles
// @access  Public

router.get('/', async (req, res) => {
  try {
    const profiles = await Profile.find().populate('user', ['name', 'avatar']);
    res.json(profiles);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET api/profile/user/:user_id
// @desc    GET profile by user ID
// @access  Public

router.get('/user/:user_id', async (req, res) => {
  try {
    const profiles = await Profile.findOne({
      user: req.params.user_id
    }).populate('user', ['name', 'avatar']);

    if (!profiles) return res.status(400).json({ msg: 'Profile not found' });

    res.json(profiles);
  } catch (err) {
    console.error(err.message);
    if (err.kind == 'ObjectId')
      return res.status(400).json({ msg: 'Profile not found' });
    res.status(500).send('Server Error');
  }
});

// @route   DELETE api/profile
// @desc    DELETE profile, user & posts
// @access  PRIVATE

router.delete('/', auth, async (req, res) => {
  try {
    // @todo -- remove uses posts
    // Remove Profile
    await Profile.findOneAndRemove({ user: req.user.id });
    // Remove User
    await User.findOneAndRemove({ _id: req.user.id });

    res.json({ msg: 'User removed' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   PUT api/profile/experience
// @desc    Add profile experience
// @access  PRIVATE

router.put(
  '/experience',
  [
    auth,
    [
      check('title', 'Title is required').not().isEmpty(),
      check('company', 'Company is required').not().isEmpty(),
      check('from', 'From date is required').not().isEmpty()
    ]
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      title,
      company,
      location,
      from,
      to,
      current,
      description
    } = req.body;

    const newExp = {
      title,
      company,
      location,
      from,
      to,
      current,
      description
    };

    try {
      const profile = await Profile.findOne({ user: req.user.id });

      profile.experience.unshift(newExp);

      await profile.save();

      return res.json(profile);
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server Error');
    }
  }
);

// @route   DELETE api/profile/experience/:exp_id
// @desc    Delete profile experience
// @access  PRIVATE

router.delete('/experience/:exp_id', auth, async (req, res) => {
  try {
    const profile = await Profile.findOne({ user: req.user.id });

    //Get remove index
    const removeIndex = profile.experience
      .map((item) => item.id)
      .indexOf(req.params.exp_id);

    if (removeIndex === undefined || removeIndex === -1)
      throw Error('Server Error');

    profile.experience.splice(removeIndex, 1);

    await profile.save();

    res.json(profile);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   PUT api/profile/experience/:exp_id
// @desc    UPDATE profile experience
// @access  PRIVATE

router.put('/experience/:exp_id', auth, async (req, res) => {
  try {
    var objectid = req.params.exp_id;
    const profile = await Profile.findOne({ user: req.user.id });

    const updateIndex = profile.experience
      .map((item) => item.id)
      .indexOf(objectid);

    if (updateIndex === undefined || updateIndex === -1)
      throw Error('Server Error');

    var oldExperience = { ...profile.experience[updateIndex] };
    var newExperience = { ...req.body };

    const newUpdatedProfile = {};
    newUpdatedProfile.current = newExperience.current;
    newUpdatedProfile.title = newExperience.title || oldExperience.title;
    newUpdatedProfile.company = newExperience.company || oldExperience.company;
    newUpdatedProfile.location =
      newExperience.location || oldExperience.location;
    newUpdatedProfile.from = newExperience.from || oldExperience.from;
    newUpdatedProfile.to = newExperience.to || oldExperience.to;
    newUpdatedProfile.description =
      newExperience.description || oldExperience.description;

    profile.experience[updateIndex] = {
      _id: mongoose.Types.ObjectId(`${objectid}`),
      ...newUpdatedProfile
    };

    await profile.save();
    // Code removed but good to look at for findOneAndUpdate
    // let profileUpdate = await Profile.findOneAndUpdate(
    //   {
    //     user: mongoose.Types.ObjectId(`${req.user.id}`),
    //     'experience._id': mongoose.Types.ObjectId(`${objectid}`)
    //   },
    //   {
    //     $set: {
    //       'experience.$.current': newUpdatedProfile.current,
    //       'experience.$.title': newUpdatedProfile.title,
    //       'experience.$.company': newUpdatedProfile.company,
    //       'experience.$.location': newUpdatedProfile.location,
    //       'experience.$.from': newUpdatedProfile.from,
    //       'experience.$.to': newUpdatedProfile.to,
    //       'experience.$.description': newUpdatedProfile.description
    //     }
    //   },
    //   { new: true }
    // );
    res.json(profile);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   PUT api/profile/education
// @desc    Add profile education
// @access  PRIVATE

router.put(
  '/education',
  [
    auth,
    [
      check('school', 'School is required').not().isEmpty(),
      check('degree', 'Degree is required').not().isEmpty(),
      check('fieldofstudy', 'Field of study is required').not().isEmpty(),
      check('from', 'From date is required').not().isEmpty()
    ]
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      school,
      degree,
      fieldofstudy,
      from,
      to,
      current,
      description
    } = req.body;

    const newEdu = {
      school,
      degree,
      fieldofstudy,
      from,
      to,
      current,
      description
    };

    try {
      const profile = await Profile.findOne({ user: req.user.id });

      profile.education.unshift(newEdu);

      await profile.save();

      return res.json(profile);
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server Error');
    }
  }
);

// @route   DELETE api/profile/education/:exp_id
// @desc    Delete profile education
// @access  PRIVATE

router.delete('/education/:edu_id', auth, async (req, res) => {
  try {
    const profile = await Profile.findOne({ user: req.user.id });

    //Get remove index
    const removeIndex = profile.education
      .map((item) => item.id)
      .indexOf(req.params.edu_id);

    if (removeIndex === undefined || removeIndex === -1)
      throw Error('Server Error');

    profile.education.splice(removeIndex, 1);

    await profile.save();

    res.json(profile);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET api/profile/github/:username
// @desc    Get user repos from GitHub
// @access  PUBLIC

router.get('/github/:username', async (req, res) => {
  try {
    const options = {
      uri: `https://api.github.com/users/${
        req.params.username
      }/repos?per_page=5&sort=created:asc&client_id=${config.get(
        'githubClientId'
      )}&client_secret=${config.get('githubSecret')}`,
      method: 'GET',
      headers: { 'user-agent': 'node.js' }
    };

    request(options, (err, response, body) => {
      if (err) console.log(err);

      if (response.statusCode !== 200)
        return res.status(404).json({ msg: 'No Github profile found' });

      res.json(JSON.parse(body));
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;
