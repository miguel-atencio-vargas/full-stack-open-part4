const mongoose = require('mongoose');
const supertest = require('supertest');
const app = require('../app');
const Blog = require('../models/blog');
const helper = require('../utils/test_helper');

const api = supertest(app);

beforeEach(async() => {
  await Blog.deleteMany({});
  const blogObjects = helper.initialBlogs.map(blog => new Blog(blog));
  const promiseArray = blogObjects.map(blog => blog.save());
  await Promise.all(promiseArray);
});

describe('/api/blogs', () => {
  test('GET - correct number of blogs in JSON format', async() => {
    const response = await api.get('/api/blogs')
      .expect(200)
      .expect('Content-Type', /application\/json/);
    expect(response.body).toHaveLength(helper.initialBlogs.length);
  });

  test('GET - the unique identifier property of blog posts is called "id"', async() => {
    const response = await api.get('/api/blogs');
    response.body.forEach(blog => expect(blog.id).toBeDefined());
  });

  test('POST - a blog can be added',  async() => {
    const newBlog = {
      title: 'Clean Code',
      author: 'Robert Martin',
      url: 'https://cleancode.com/',
      likes: 10
    };
    await api.post('/api/blogs')
      .send(newBlog)
      .expect(201)
      .expect('Content-Type', /application\/json/);
    const blogsAtEnd = await helper.blogsInDB();
    expect(blogsAtEnd).toHaveLength(helper.initialBlogs.length + 1);
    const titles = blogsAtEnd.map(blog => blog.title);
    expect(titles).toContain(newBlog.title);
  });

  test('POST - likes should be zero when property likes is not provided', async() => {
    const newBlog = {
      title: 'Clean Code',
      author: 'Robert Martin',
      url: 'https://cleancode.com/'
    };
    const response = await api.post('/api/blogs').send(newBlog);
    expect(response.body.likes).toBe(0);
  });

  test('POST - if title or url is not provided should respond with 400', async() => {
    const newBlog = {
      likes: 10,
      url: 'https://somethig.com'
    };
    await api.post('/api/blogs').send(newBlog).expect(400);
  });
});

afterAll(() => mongoose.connection.close());
