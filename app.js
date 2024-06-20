const bodyParser = require('body-parser');
const mysql = require('mysql2');
const express = require('express');
const methodOverride = require('method-override');
const path = require('path');

// Cria uma instância do Express
const app = express();

// Configuração do body-parser para obter dados de formulários HTML
app.use(bodyParser.urlencoded({ extended: true }));
app.use(methodOverride('_method'));
app.use(express.static(path.join(__dirname, 'src')));

// Configuração do banco de dados
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'mysql1659',
  database: 'sistema_crud_nodejs'
});

db.connect((err) => {
  if (err) throw err;
  console.log('Conectado ao banco de dados MySQL!');
});

// Configuração da rota para exibir o formulário HTML
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

// Rota para processar o formulário de cadastro
app.post('/cadastro', (req, res) => {
  const { usuario, email, telefone } = req.body;
  const sql = 'INSERT INTO table_usuarios (usuario, email, telefone) VALUES (?, ?, ?)';
  db.query(sql, [usuario, email, telefone], (err, result) => {
    if (err) throw err;
    res.send('Cadastro realizado com sucesso!');
  });
});

// Rota para exibir os dados da tabela
app.get('/lista', (req, res) => {
  const sql = 'SELECT * FROM table_usuarios';
  db.query(sql, (err, results) => {
    if (err) throw err;
    let html = `
      <!DOCTYPE html>
      <html lang="pt-br">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Lista de Usuários</title>
      </head>
      <body>
        <h1>Lista de Pessoas</h1>
        <table border="1">
          <tr>
            <th>ID</th>
            <th>Nome</th>
            <th>Email</th>
            <th>Telefone</th>
            <th>Editar</th>
            <th>Excluir</th>
          </tr>`;

    results.forEach(person => {
      html += `
        <tr>
          <td>${person.id}</td>
          <td>${person.usuario}</td>
          <td>${person.email}</td>
          <td>${person.telefone}</td>
          <td><a href='http://localhost:3000/editar/${person.id}' ><button>Editar</button></a></td>
          <td><form action="/deletar/${results[0].id}?_method=DELETE" method="POST"><button type="submit">Excluir</button></form></td>
        </tr>`;
    });
    html += `
        </table>
      </body>
      </html>`;

    res.send(html);
  });
});

app.get('/editar/:id', (req, res) => {
  const { id } = req.params
  const sql = 'SELECT * FROM table_usuarios WHERE id = ?'
  db.query(sql,[id], (err,results)=>{
      if(err) throw err;
      let html = 
      `
      <!DOCTYPE html>
          <html lang="pt-br">
          <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Cadastro de Pessoa</title>
          </head>
          <body>
            <h1>Editar pessoa</h1>
            <form action="/atualizar/${results[0].id}?_method=PUT" method="POST">
                <label for="usuario">Nome:</label><br>
                <input type="text" id="usuario" name="usuario" value="${results[0].usuario}" required><br>
                <label for="email">Email:</label><br>
                <input type="email" id="email" name="email" value="${results[0].email}" required><br>
                <label for="telefone">Telefone:</label><br>
                <input type="tel" id="telefone" name="telefone" value="${results[0].telefone}" required><br><br>
                <button type="submit">Atualizar dados</button>
            </form>
          </body>
          </html>`;
      res.send(html);
  })
});

app.put('/atualizar/:id', (req,res)=>{
  const { id } = req.params;
  const { usuario, email, telefone } = req.body;
  const sql = "UPDATE table_usuarios SET usuario = ?, email = ?, telefone = ? WHERE id = ?";
  db.query(sql, [usuario, email, telefone, id], (err, results)=>{
      if(err) throw err;
      res.redirect('/lista');
  });
});

app.delete('/deletar/:id', (req,res)=>{
  const { id } = req.params;
  const sql = "DELETE FROM table_usuarios WHERE id = ?";
  db.query(sql, [id], (err, results)=>{
      if(err) throw err;
      res.redirect('/lista');
  });
});

// Iniciar o servidor
app.listen(3000, () => {
  console.log('Servidor rodando na porta 3000');
});
