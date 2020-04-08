const express = require("express");
const cors = require("cors");

const { uuid, isUuid } = require("uuidv4");

const app = express();

app.use(express.json());
app.use(cors());

const repo_arr = [];

function validadeProjectId(request, response, next) {
  const { id } = request.params;

  if(!isUuid(id)){   // importamos lá em cima a função isUuid() pra verificar se o id do route param é um id único universal
    return response.status(400).json({ message: 'Invalid project ID'})    //se não for, interrompa a requisição e exiba log de erro
  }
  return next();   //caso seja um uuid, siga pra próxima middleware
}

function logRequests(request, response, next) {      
  const { method, url } = request;  

  const logLabel = `[${method.toUpperCase()}]${url}`;  
  console.time(logLabel);                     

  next(); // próxima middleware
  console.timeEnd(logLabel);
}
  
//middlewares
app.use("/repositories/:id", validadeProjectId);
app.use(logRequests);

//GET ==> List
app.get("/repositories", (request, response) => {
  return response.json(repo_arr);
});
//POST ==> Create
app.post("/repositories", (request, response) => {
  const { title, url, techs } = request.body;
  const repository = {
    id: uuid(),
    title, url, techs, likes:0,
  };
  repo_arr.push(repository);
  return response.json(repository);
});
//PUT ==> Update
app.put("/repositories/:id", (request, response) => {
  const { title , url , techs } = request.body;
  const { id } = request.params;

  const repoIndex = repo_arr.findIndex( repo => repo.id === id);
  if (repoIndex < 0) {
    return response.status(400).json({ error: "Repository not found"});
  }
  const repository = { id, title, url, techs, likes:0 }
  repo_arr[repoIndex] = repository;
  return response.json(repository);
});
//DELETE ==> 🐵
app.delete("/repositories/:id", (req, res) => {
  const { id } = req.params;

  const repoIndex = repo_arr.findIndex( repo => repo.id === id);
  if (repoIndex < 0) {
    return res.status(400).json({ error: "Repository not found"});
  }
  repo_arr.splice(repoIndex, 1);
  return res.status(204).send();

});
//POST ==> Like
app.post("/repositories/:id/like", (request, response) => {
  const { id } = request.params;

  const repository = repo_arr.find(repo => repo.id === id);
  
  if (!repository) {
    return response.status(400).json({ error: "repository not found"})
  }

  repository.likes += 1;
  return response.json(repository);

});

module.exports = app;
