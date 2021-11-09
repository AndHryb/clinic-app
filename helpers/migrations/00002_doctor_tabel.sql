CREATE TABLE IF NOT EXISTS doctors (
  id varchar(255) NOT NULL,
  name varchar(255) NOT NULL,
  email varchar(255) UNIQUE,
  userId varchar(255) NOT NULL,
  PRIMARY KEY (id),
  FOREIGN KEY (userId) REFERENCES users(id)
  ON UPDATE CASCADE
  ON DELETE CASCADE
);
