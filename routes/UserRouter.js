const express = require("express");
const User = require("../db/userModel");
const router = express.Router();
const Photo = require('../db/photoModel');

router.post("/", async (request, response) => {
  
});

router.get("/", async (request, response) => {
  
});

// GET /user/list - Trả về danh sách user cho sidebar
router.get('/list', async (req, res) => {
  try {
    const users = await User.find({}, '_id first_name last_name');
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /user/:id - Trả về thông tin chi tiết user
router.get('/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id, '_id first_name last_name location description occupation');
    if (!user) {
      return res.status(400).json({ error: 'User not found' });
    }
    res.json(user);
  } catch (err) {
    res.status(400).json({ error: 'Invalid user id' });
  }
});

// GET /photosOfUser/:id - Trả về tất cả ảnh của user kèm comments
router.get('/photosOfUser/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(400).json({ error: 'User not found' });
    }
    const photos = await Photo.find({ user_id: req.params.id });
    const result = await Promise.all(photos.map(async (photo) => {
      const comments = await Promise.all((photo.comments || []).map(async (comment) => {
        const commentUser = await User.findById(comment.user_id, '_id first_name last_name');
        return {
          _id: comment._id,
          comment: comment.comment,
          date_time: comment.date_time,
          user: commentUser ? {
            _id: commentUser._id,
            first_name: commentUser.first_name,
            last_name: commentUser.last_name
          } : null
        };
      }));
      return {
        _id: photo._id,
        user_id: photo.user_id,
        file_name: photo.file_name,
        date_time: photo.date_time,
        comments
      };
    }));
    res.json(result);
  } catch (err) {
    res.status(400).json({ error: 'Invalid user id' });
  }
});

module.exports = router;