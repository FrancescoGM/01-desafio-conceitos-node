const express = require("express");
const cors = require("cors");

const { v4: uuidV4 } = require("uuid");

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers;
  const user = users.find((user) => user.username === username);

  if (!user) {
    return response.status(404).json({ error: "User not found" });
  }

  request.user = user;
  return next();
}

app.post("/users", (request, response) => {
  const { name, username } = request.body;

  const hasUser = users.find((user) => user.username === username);

  if (hasUser) {
    return response.status(400).json({ error: "User already exists" });
  }

  const newUser = {
    id: uuidV4(),
    name,
    username,
    todos: [],
  };
  users.push(newUser);

  return response.status(201).send(newUser);
});

app.get("/todos", checksExistsUserAccount, (request, response) => {
  return response.json(request.user.todos);
});

app.post("/todos", checksExistsUserAccount, (request, response) => {
  const { title, deadline } = request.body;

  const newTodo = {
    id: uuidV4(),
    title,
    done: false,
    deadline: new Date(deadline),
    created_at: new Date(),
  };

  request.user.todos.push(newTodo);

  return response.status(201).json(newTodo);
});

app.put("/todos/:id", checksExistsUserAccount, (request, response) => {
  const { title, deadline } = request.body;
  const { id } = request.params;

  const todoIndex = request.user.todos.findIndex((todo) => todo.id === id);

  if (todoIndex < 0) {
    return response.status(404).json({ error: "Todo not found" });
  }

  if (title) request.user.todos[todoIndex].title = title;
  if (deadline) request.user.todos[todoIndex].deadline = new Date(deadline);

  return response.status(201).json(request.user.todos[todoIndex]);
});

app.patch("/todos/:id/done", checksExistsUserAccount, (request, response) => {
  const { id } = request.params;
  const todoIndex = request.user.todos.findIndex((todo) => todo.id === id);

  if (todoIndex < 0) {
    return response.status(404).json({ error: "Todo not found" });
  }

  request.user.todos[todoIndex].done = true;

  return response.status(201).json(request.user.todos[todoIndex]);
});

app.delete("/todos/:id", checksExistsUserAccount, (request, response) => {
  const { id } = request.params;

  const todoIndex = request.user.todos.findIndex((todo) => todo.id === id);

  if (todoIndex < 0) {
    return response.status(404).json({ error: "Todo not found" });
  }

  const filteredTodos = request.user.todos.filter((todo) => todo.id !== id);
  request.user.todos = filteredTodos;

  return response.status(204).json(request.user.todos);
});

module.exports = app;
