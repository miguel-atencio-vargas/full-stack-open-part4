const mongoose = require('mongoose');
const supertest = require('supertest');
const bcrypt = require('bcrypt');

const app = require('../app');
const helper = require('./test_helper');
const Blog = require('../models/blog');
const User = require('../models/user');

const api = supertest(app);

let jwt;
beforeEach(async() => {
  const idListUsers = [];
  await User.deleteMany({});
  for (let i = 1; i <= 6; i++) {
    const passwordHash = await bcrypt.hash(`Abc@${i}`, 10);
    const user = new User({ username: `user${i}`, passwordHash });
    idListUsers.push((await user.save())._id);
  }
  await Blog.deleteMany({});
  const blogObjects = helper.initialBlogs.map((blog, i) => {
    return new Blog({ ...blog, user: idListUsers[i] });
  });
  const promiseArray = blogObjects.map(blog => blog.save());
  await Promise.all(promiseArray);

  const userForLogin = {
    username: 'user2',
    password: 'Abc@2'
  };
  const response = await api.post('/api/login').send(userForLogin).expect(200);
  expect(response.body.username).toBe(userForLogin.username);
  jwt = response.body.token;
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

    await api
      .post('/api/blogs')
      .set('Authorization', `bearer ${jwt}`)
      .send(newBlog)
      .expect(201)
      .expect('Content-Type', /application\/json/);

    const blogsAtEnd = await helper.blogsInDB();
    expect(blogsAtEnd).toHaveLength(helper.initialBlogs.length + 1);
    const titles = blogsAtEnd.map(blog => blog.title);
    expect(titles).toContain(newBlog.title);
  });

  test('POST - likes should be zero when property likes is not provided',
    async() => {
      const newBlog = {
        title: 'Clean Code',
        author: 'Robert Martin',
        url: 'https://cleancode.com/'
      };
      const response = await api.post('/api/blogs')
        .set('Authorization', `bearer ${jwt}`)
        .send(newBlog);
      expect(response.body.likes).toBe(0);
    });

  test('POST - if title or url is not provided should respond with 400',
    async() => {
      const newBlog = {
        likes: 10,
        url: 'https://somethig.com'
      };
      await api.post('/api/blogs')
        .set('Authorization', `bearer ${jwt}`)
        .send(newBlog)
        .expect(400);
    }
  );

  test('POST - failed with status 401 when the token is not provided',
    async() => {
      const newBlog = {
        title: 'Clean Code',
        author: 'Robert Martin',
        url: 'https://cleancode.com/',
        likes: 15
      };
      await api.post('/api/blogs').send(newBlog)
        .expect(401);
    }
  );
});

describe('/api/blogs - test with the owner of the blog', () => {
  let jwtUser5;
  let blogToOperate;
  beforeEach(async() => {
    // create a blog with a specific user
    // 1. login with a specific user
    const userToLogin = { username: 'user5', password: 'Abc@5' };
    const response = await api.post('/api/login')
      .send(userToLogin).expect(200);
    jwtUser5 = response.body.token;
    // 2. create a blog with that user
    const newBlog = {
      title: 'JS the weird parts',
      author: 'Somebody',
      url: 'http://blog.com',
      likes: 1
    };
    const respBlog = await api.post('/api/blogs').send(newBlog)
      .set('Authorization', `bearer ${jwtUser5}`)
      .expect(201);
    blogToOperate = respBlog.body;
  });

  test('DELETE - succeed with a valid ID & valid owner token',
    async () => {
      const blogsAtStart = await helper.blogsInDB();
      await api.delete(`/api/blogs/${blogToOperate.id}`)
        .set('Authorization', `bearer ${jwtUser5}`)
        .expect(204);
      const blogsAtEnd = await helper.blogsInDB();
      expect(blogsAtEnd).toHaveLength(blogsAtStart.length - 1);

      const titles = blogsAtEnd.map(blog => blog.title);
      expect(titles).not.toContain(blogToOperate.title);
    }
  );

  test('DELETE - failed with status 400 if id is not valid',
    async () => {
      await api.delete('/api/blogs/aabbcc')
        .set('Authorization', `bearer ${jwtUser5}`)
        .expect(400);
    });

  test('PUT - succeed with a valid ID and data provided',
    async () => {
      blogToOperate.likes = 300;
      const response = await api.put(`/api/blogs/${blogToOperate.id}`)
        .set('Authorization', `bearer ${jwtUser5}`)
        .send(blogToOperate)
        .expect(200)
        .expect('Content-Type', /application\/json/);
      const blogUpdated = response.body;
      expect(blogToOperate).toMatchObject(blogUpdated);
    });
});

describe('/api/users', () => {
  test('new user added succeeded', async () => {
    const usersAtStart = await helper.usersInDB();
    const newUser = {
      username: 'root',
      name: 'Admin user',
      password: 'Abcd@123'
    };
    await api.post('/api/users').send(newUser)
      .expect(200).expect('Content-Type', /application\/json/);
    const usersAtEnd = await helper.usersInDB();

    expect(usersAtEnd).toHaveLength(usersAtStart.length + 1);

    const userNames = usersAtEnd.map(user => user.username);
    expect(userNames).toContain(newUser.username);
  });

  test('user is not created with not valid information', async() => {
    const usersAtStart = await helper.usersInDB();
    const newNotValidUser = {
      username: 'u',
      name: 'not valid user',
      password: '12'
    };
    await api.post('/api/users').send(newNotValidUser)
      .expect(400).expect('Content-Type', /application\/json/);
    const usersAtEnd = await helper.usersInDB();
    expect(usersAtEnd).toHaveLength(usersAtStart.length);
  });
});

afterAll(() => mongoose.connection.close());
