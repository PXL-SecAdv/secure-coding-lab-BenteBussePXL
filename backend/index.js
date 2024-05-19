const pg = require('pg');
require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const cors = require('cors')
const crypto = require('crypto');


const port=3000;

const pool = new pg.Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_DATABASE,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
    connectionTimeoutMillis: 5000
})

console.log("Connecting...:")

const allowedOrigins = ['http://localhost:8081', "http://localhost:5432"];
const corsOptions = {
    origin: function (origin, callback) {
        console.log(origin);
        if (allowedOrigins.indexOf(origin) !== -1) {
            callback(null, true);
        } else {
            callback(new Error('No access allowed!'));
        }
    }
};

app.use(cors(corsOptions));
app.use(bodyParser.json());
app.use(
    bodyParser.urlencoded({
        extended: true,
    })
)

app.get('/authenticate/:username/:password', async (request, response) => {
    const username = request.params.username;
    const password = request.params.password;
    const hash = crypto.createHash('sha512').update(password).digest('hex');

    if (!username || !password) {
        return response.status(400).json({ error: 'Username and password are required' });
    }

    //const usernameRegex = /^[a-zA-Z0-9-]+$/;
    //if (!usernameRegex.test(username)) {
    //return response.status(400).json({ error: 'Invalid username format' });
    //}

    const sanitizedUsername = username.replace(/[^a-zA-Z0-9-]/g, '');

    const query = `SELECT * FROM users WHERE user_name='${sanitizedUsername}' and password='${hash}'`;
    console.log(query);
    pool.query(query, (error, results) => {
        if (error) {
            throw error
        }
        response.status(200).json(results.rows)});

});

app.listen(port, () => {
    console.log(`App running on port ${port}.`)
})

