'use strict';
const blogRouter = require('express').Router();
const Blog = require('../models/blog');
const User = require('../models/user');

blogRouter.get('/', async(req, res) => {
  const blogs = await Blog.find({}).populate('user');
  res.json(blogs);
});

blogRouter.post('/', async(req, res) => {
  const user = await User.findOne({});
  const blog = { ...req.body, user: user._id };
  const blogToSave = new Blog(blog);
  const result = await blogToSave.save();
  user.blogs = user.blogs.concat(result._id);
  await user.save();
  res.status(201).json(result);
});

blogRouter.delete('/:id', async(req, res) => {
  await Blog.findByIdAndRemove(req.params.id);
  res.status(204).end();
});

blogRouter.put('/:id', async(req, res) => {
  const body = req.body;
  const blog = {
    title: body.title,
    author: body.author,
    likes: body.likes,
    url: body.url
  };
  const options = { new: true };
  const updatedBlog = await Blog.findByIdAndUpdate(req.params.id, blog, options);
  const updatedAndFormattedBlog = await updatedBlog.toJSON();
  res.json(updatedAndFormattedBlog);
});

module.exports = blogRouter;
