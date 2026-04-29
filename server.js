const express = require('express');
const bcrypt = require('bcrypt');
const { Pool } = require('pg');
//łaczenie express-strona, pg-laczenie z baza, bcrypt - szyfrowanie

const app = express();
app.use(express.urlencoded({ extended: true })); // Pozwala odczytywać dane z formularzy HTML

//Połaczenie z baza
const pool = new Pool({
    connectionString: process.env.DATABASE_URL
});

//Aplikacja CRUD

// Read -> Wyświetla formularz i pobiera listę ludzi z bazy
app.get('/', async (req, res) => {
    try {
        // Tworzenie tabeli (MUSI BYĆ TUTAJ, żeby uniknąć błędu bazy!)
        await pool.query(`
            CREATE TABLE IF NOT EXISTS users (
                id SERIAL PRIMARY KEY,
                username VARCHAR(50) UNIQUE NOT NULL,
                password VARCHAR(255) NOT NULL
            )
        `);

        // Wszyscy użytknowicy
        const result = await pool.query('SELECT * FROM users ORDER BY id DESC');
        const users = result.rows;

        // Najprostrza strona html
        let html = `
            <h2>Panel Administratora (CRUD)</h2>
            
            <div style="background: #f0f0f0; padding: 10px; margin-bottom: 20px;">
                <h3>Dodaj użytkownika (CREATE)</h3>
                <form action="/add" method="POST">
                    Login: <input type="text" name="username" required>
                    Hasło: <input type="password" name="password" required>
                    <button type="submit">Dodaj do bazy</button>
                </form>
            </div>

            <h3>Lista użytkowników w bazie (READ)</h3>
            <table border="1" cellpadding="5" cellspacing="0">
                <tr style="background: #ddd;"><th>ID</th><th>Login</th><th>Zaszyfrowane hasło (bcrypt)</th><th>Akcje</th></tr>
        `;

        // wiersz w tabeli dla każdego użytkownika
        users.forEach(user => {
            html += `
                <tr>
                    <td>${user.id}</td>
                    <td><b>${user.username}</b></td>
                    <td style="color: green; font-size: 12px;">${user.password}</td>
                    <td>
                        <form action="/update" method="POST" style="display:inline;">
                            <input type="hidden" name="id" value="${user.id}">
                            <input type="password" name="newPassword" placeholder="Nowe hasło" required>
                            <button type="submit">Zmień hasło</button>
                        </form>

                        <form action="/delete" method="POST" style="display:inline;">
                            <input type="hidden" name="id" value="${user.id}">
                            <button type="submit" style="color: red;">Usuń</button>
                        </form>
                    </td>
                </tr>
            `;
        });

        html += `</table>`;
        res.send(html);

    } catch (err) {
        res.status(500).send('Błąd bazy danych: ' + err.message);
    }
});

//Create -> Odbiera dane z formularza "Dodaj"
app.post('/add', async (req, res) => {
    const { username, password } = req.body;
    
    //Szyfrowanie
    const hashedPassword = await bcrypt.hash(password, 10);
    
    try {
        await pool.query('INSERT INTO users (username, password) VALUES ($1, $2)', [username, hashedPassword]);
    } catch (err) {
        console.error('Błąd dodawania:', err);
    }
    res.redirect('/'); // Po dodaniu odswieza stronę
});

//Update -> Odbiera dane z formularza "Zmień hasło"
app.post('/update', async (req, res) => {
    const { id, newPassword } = req.body;
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    try {
        await pool.query('UPDATE users SET password = $1 WHERE id = $2', [hashedPassword, id]);
    } catch (err) {
        console.error('Błąd edycji:', err);
    }
    res.redirect('/');
});

//Delete -> Odbiera kliknięcie w przycisk "Usuń"
app.post('/delete', async (req, res) => {
    const { id } = req.body;
    try {
        await pool.query('DELETE FROM users WHERE id = $1', [id]);
    } catch (err) {
        console.error('Błąd usuwania:', err);
    }
    res.redirect('/');
});

// Start serwera
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log("Serwer CRUD działa prawidłowo!");
});