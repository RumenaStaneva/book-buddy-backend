import express, { Express, Application, Request, Response } from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import bookRoutes from './routes/books';
import userRoutes from './routes/user';
import apiRoutes from './routes/api';
import noteRoutes from './routes/notes';
import timeSwapRoutes from './routes/timeSwap';
import spotifyRoutes from './routes/spotify';
import tokenCleanup from './tokenCleanup';
import mongoose from 'mongoose';
import swaggerUi from 'swagger-ui-express';
import { loginWithGoogle } from './controllers/userController';
// import swaggerSpec from './swagger.js';
import path from "path";

const app: Application = express();


// const swaggerSpec = require('./swagger.js');

dotenv.config();
app.use(express.json());
app.use(cors());
// app.use(express.urlencoded({ extended: false }));

let PORT: string | number = process.env.PORT || 5000;
let MONGO_URI: string = process.env.MONGO_URI || '';
app.use(express.static(path.join(__dirname, "../client/build")))
// app.use(
//     "/book-buddy-docs",
//     swaggerUi.serve,
//     swaggerUi.setup(swaggerSpec, { explorer: true })
// );

//middleware
app.use((req: Request, res: Response, next) => {
    next();
});

app.use('/spotify', spotifyRoutes);
app.use('/users', userRoutes);
app.use('/api', apiRoutes);
app.use('/books', bookRoutes);
app.use('/notes', noteRoutes);
app.use('/time-swap', timeSwapRoutes);
app.get('/', (req, res) => {
    res.type('text/html');
    res.send('<h1>I am html</h1>');
})
const host = '0.0.0.0';
mongoose.connect(MONGO_URI)
    .then(() => {
        app.listen(Number(PORT), host, () => {
            console.log('Connected to db & listening on port:', PORT)
        })
    })
    .catch((error: Error) => {
        console.log(error)
    })
