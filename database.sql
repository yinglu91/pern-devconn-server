CREATE DATABASE pern_devconn_database;
\c pern_devconn_database
--users

CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  avatar VARCHAR(255),
  date TIMESTAMPTZ DEFAULT Now()
);

--todos

CREATE TABLE todos(
  todo_id SERIAL,
  user_id INTEGER,
  description VARCHAR(255) NOT NULL,
  PRIMARY KEY (todo_id),
  FOREIGN KEY (user_id) REFERENCES users(id)
);

--fake users data

insert into users (name, email, password) values ('test11', 'test11@gmail.com', 'test123');

--fake todos data

insert into todos (user_id, description) values (1, 'clean room');

-------
authtodolist=> \d
               List of relations
 Schema |       Name        |   Type   | Owner
--------+-------------------+----------+-------
 public | todos             | table    | dba
 public | todos_todo_id_seq | sequence | dba
 public | users             | table    | dba
 public | users_user_id_seq | sequence | dba
(4 rows)
