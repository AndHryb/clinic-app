CREATE TABLE IF NOT EXISTS patients (
  id varchar(255) NOT NULL,
  name varchar(255) NOT NULL,
  gender varchar(255) NOT NULL,
  birthday date NOT NULL,
  user_id varchar(255) NOT NULL,
  PRIMARY KEY (id),
  FOREIGN KEY (user_id) REFERENCES users(id)
  ON UPDATE CASCADE
  ON DELETE CASCADE
);