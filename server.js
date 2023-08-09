const express = require('express');
const app = express();
const dotenv = require('dotenv');
var cors = require('cors');
const bookRoutes = require('./routes/books');
const userRoutes = require('./routes/user');
const mongoose = require('mongoose');

const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./swagger.js');

dotenv.config();
app.use(express.json());
app.use(cors());
// app.use(express.urlencoded({ extended: false }));

let PORT = process.env.DEV_PORT;
let MONGO_URI = process.env.MONGO_URI;

app.use(
    "/book-buddy-docs",
    swaggerUi.serve,
    swaggerUi.setup(swaggerSpec, { explorer: true })
);

//middleware
app.use((req, res, next) => {
    next();
})

app.use('/users', userRoutes);
app.use('/book', bookRoutes);

mongoose.connect(MONGO_URI)
    .then(() => {
        app.listen(PORT, () => {
            console.log('Connected to db & listening on port:', PORT)
        })
    })
    .catch((error) => {
        console.log(error)
    })
