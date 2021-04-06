DROP TABLE IF EXISTS books;
CREATE TABLE books (
  id SERIAL PRIMARY KEY,
  image_url VARCHAR(2048),
  title VARCHAR(255),
  author VARCHAR(255),
  description TEXT,
  ISBN VARCHAR(255)
);