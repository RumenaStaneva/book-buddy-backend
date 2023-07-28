const express = require('express');
const app = express();
const dotenv = require('dotenv');
var cors = require('cors');
const bookRoutes = require('./routes/books');
const userRoutes = require('./routes/user');
const mongoose = require('mongoose');

dotenv.config();
app.use(express.json());
app.use(cors());
// app.use(express.urlencoded({ extended: false }));

let PORT = process.env.DEV_PORT;
let MONGO_URI = process.env.MONGO_URI;

//middleware
app.use((req, res, next) => {
    next();
})

app.use('/', userRoutes);
app.use('/', bookRoutes);

mongoose.connect(MONGO_URI)
    .then(() => {
        app.listen(PORT, () => {
            console.log('Connected to db & listening on port:', PORT)
        })
    })
    .catch((error) => {
        console.log(error)
    })
