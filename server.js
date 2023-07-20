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

app.get('/', (req, res) => {
    res.send('Welcome to the Book Search API');
});

app.post('/search-book-title', async (req, res, next) => {
    try {
        const { title, startIndex, maxResults } = req.body;
        const url = `https://www.googleapis.com/books/v1/volumes?q=${title}&startIndex=${startIndex}&maxResults=${maxResults}&printType=books&key=${KEY}`;
        const response = await axios.get(url);
        res.json(response.data);

    } catch (error) {
        console.error('Error fetching books:', error.message);
        res.status(500).json({ error: 'Error fetching books from the Google Books API' });
    }
});

app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
});

