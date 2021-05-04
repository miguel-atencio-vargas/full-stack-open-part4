const dummy = () => {
  return 1;
};

const totalLikes = (blogList) => {
  return blogList.reduce((acc, blog) => acc + blog.likes, 0);
};

const favoriteBlog = (blogList) => {
  return blogList.sort((a,b) => b.likes - a.likes)[0];
};

const mostBlogs = (blogsList) => {
  const cAuthorBlogs = {};
  blogsList.forEach(blog => {
    if(!cAuthorBlogs[blog.author]) {
      cAuthorBlogs[blog.author] = 1;
    } else {
      cAuthorBlogs[blog.author]++;
    }
  });
  const author = Object.entries(cAuthorBlogs).sort((a, b) => {
    return b[1] - a[1];
  })[0];
  return {
    author: author[0],
    blogs: author[1]
  };
};

const mostLikes = (blogsList) => {
  const cAuthorLikes = {};
  blogsList.forEach(blog => {
    if (!cAuthorLikes[blog.author]) {
      cAuthorLikes[blog.author] = blog.likes;
    } else {
      cAuthorLikes[blog.author] += blog.likes;
    }
  });
  const author = Object.entries(cAuthorLikes).sort((a, b) => {
    return b[1] - a[1];
  })[0];
  return {
    author: author[0],
    likes: author[1]
  };
};

module.exports = {
  dummy,
  totalLikes,
  favoriteBlog,
  mostBlogs,
  mostLikes
};
