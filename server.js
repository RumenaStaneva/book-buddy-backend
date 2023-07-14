const express = require('express');
const app = express();
const dotenv = require('dotenv');
const axios = require('axios');
var cors = require('cors');

dotenv.config();
app.use(express.json());
app.use(cors());
// app.use(express.urlencoded({ extended: false }));

let PORT = process.env.DEV_PORT
let KEY = process.env.KEY

app.post('/search-book-title', async (req, res, next) => {
    try {
        const url = `https://www.googleapis.com/books/v1/volumes?q=${req.body.title}&maxResults=40&printType=books&key=${KEY}`
        const response = await axios.get(url);
        res.setHeader('Content-Type', 'application/json');
        res.send(JSON.stringify(response.data));

    } catch (error) {
        console.log(error);
    }
});

app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
});

