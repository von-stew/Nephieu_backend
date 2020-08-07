const express = require('express');
const auth = require('../../middleware/auth');
const User = require('../../models/User');
const Post = require('../../models/Post');
const Profile = require('../../models/Profile');
const { json } = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');

// @route   POST api/posts
// @desc    Create post route
// @access  PRIVATE
router.post(
  '/',
  [auth, [check('text', 'Text is required').not().isEmpty()]],
  async (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty())
      return res.status(400).json({ errors: errors.array() });

    try {
      const user = await User.findById(req.user.id).select('-password');

      const newPost = new Post({
        text: req.body.text,
        name: user.name,
        avatar: user.avatar,
        user: req.user.id
      });

      const post = await newPost.save();

      res.json(post);
    } catch (err) {
      console.error(err);
      res.status(500).send('Server Error');
    }
  }
);

// @route   GET api/posts
// @desc    GET all posts
// @access  PRIVATE

router.get('/', auth, async (req, res) => {
  try {
    const posts = await Post.find().sort({ date: -1 });
    res.json(posts);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});

// @route   GET api/posts/:id
// @desc    GET post by ID
// @access  PRIVATE

router.get('/:id', auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) return res.status(404).json({ msg: 'post not found' });

    res.json(post);
  } catch (err) {
    console.error(err);

    if (err.kind === 'ObjectId')
      return res.status(404).json({ msg: 'post not found' });

    res.status(500).send('Server Error');
  }
});

// @route   DELETE api/posts/:id
// @desc    DELETE a post by ID
// @access  PRIVATE

router.delete('/:id', auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) return res.status(404).json({ msg: 'post not found' });

    // Check user
    if (post.user.toString() !== req.user.id)
      return res.status(401).json({ msg: 'User not authorized' });

    await post.remove();

    res.json({ msg: 'Post removed' });
  } catch (err) {
    console.error(err);

    if (err.kind === 'ObjectId')
      return res.status(404).json({ msg: 'post not found' });

    res.status(500).send('Server Error');
  }
});

module.exports = router;
