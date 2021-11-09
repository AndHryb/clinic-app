CREATE TABLE IF NOT EXISTS users (
  id varchar(255) NOT NULL,
  email varchar(255) UNIQUE,
  password varchar(255) NOT NULL,
  role varchar(255) NOT NULL,
  PRIMARY KEY (id)
);