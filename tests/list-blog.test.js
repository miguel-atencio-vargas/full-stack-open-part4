const listHelper = require('../utils/list_helper');


describe('Dummy test', () => {
  test('dummy returns one', () => {
    const blogs = [];
    const result = listHelper.dummy(blogs);
    expect(result).toBe(1);
  });
});

const blogs = [
  {
    '_id': '6090726f02080a0f22c0b2d1',
    'title': 'Blog 1',
    'author': 'John Doe',
    'url': 'https://howto.com',
    'likes': 12,
  },
  {
    '_id': '6090726f02080a0f22c0b2d1',
    'title': 'Blog 1.2',
    'author': 'John Doe',
    'url': 'https://howto.com',
    'likes': 1,
  },
  {
    '_id': '6090726f02080a0f22c0b2d1',
    'title': 'Blog 1.3',
    'author': 'John Doe',
    'url': 'https://howto.com',
    'likes': 0,
  },
  {
    '_id': '609074b5a5f2f41a8f1fef2a',
    'title': 'Blog 2',
    'author': 'KJ',
    'url': 'https://howto.com',
    'likes': 4,
  },
  {
    '_id': '609074c3a5f2f41a8f1fef2b',
    'title': 'Blog 3',
    'author': 'KJ',
    'url': 'https://howto.com',
    'likes': 2,
  },
  {
    '_id': '6090af5d867d732a3ff7d5c6',
    'title': 'Blog 4',
    'author': 'Malik',
    'url': 'https://howto.com',
    'likes': 6,
  }
];

describe('total likes', () => {
  test('of empty list is zero', () => {
    expect(listHelper.totalLikes([])).toBe(0);
  });
  test('when list has only one blog, equals the likes of that', () => {
    const result = listHelper.totalLikes([{
      '_id': '609074b5a5f2f41a8f1fef2a',
      'title': 'Blog 2',
      'author': 'Joe Hampton',
      'url': 'https://howto.com',
      'likes': 4,
    }]);
    expect(result).toBe(4);
  });
  test('of a bigger list is calculated right', () => {
    const result = listHelper.totalLikes(blogs);
    expect(result).toBe(25);
  });
});

describe('obtain a blog', () => {
  test('get the most rated blog', () => {
    const result = listHelper.favoriteBlog(blogs);
    const mostRatedBlog = {
      '_id': '6090726f02080a0f22c0b2d1',
      'title': 'Blog 1',
      'author': 'John Doe',
      'url': 'https://howto.com',
      'likes': 12,
    };
    expect(result).toMatchObject(mostRatedBlog);
  });
});

describe('obtain the author with most blogs writted', () => {
  const result = listHelper.mostBlogs(blogs);
  expect(result).toMatchObject({ author: 'John Doe', blogs: 3 });
});
