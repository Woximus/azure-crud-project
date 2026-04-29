const express = require('express');
const bcrypt = require('bcrypt');
const { Pool } = require('pg');
//łaczenie express-strona, pg-laczenie z baza, bcrypt - szyfrowanie

//ucze strone czytac json
const app = express();
app.use(express.json());

//laczy z baza
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

//budowanie tabeli
const initDb = async () => {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (id SERIAL PRIMARY KEY, username VARCHAR(50), password VARCHAR(255));
    CREATE TABLE IF NOT EXISTS tasks (id SERIAL PRIMARY KEY, title VARCHAR(255));
  `);
};
initDb().catch(console.error);

//haslo idzie przez bcrpyt (urywa haslo)
app.post('/register', async (req, res) => {
  const { username, password } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);
  try {
    await pool.query('INSERT INTO users (username, password) VALUES ($1, $2)', [username, hashedPassword]);
    res.status(201).send('Uzytkownik zarejestrowany - haslo zaszyfrowane w bazie');
  } catch (err) { res.status(500).send(err.message); }
});

//Dodaje zadania
app.post('/tasks', async (req, res) => {
  const { title } = req.body;
  await pool.query('INSERT INTO tasks (title) VALUES ($1)', [title]);
  res.status(201).send('Zadanie dodane');
});

//Czyta zadania
app.get('/tasks', async (req, res) => {
  const { rows } = await pool.query('SELECT * FROM tasks');
  res.json(rows);
});

app.get('/', (req, res) => res.send('Aplikacja CRUD dziala!'));

app.listen(3000, () => console.log('Serwer wystartowal na porcie 3000'));