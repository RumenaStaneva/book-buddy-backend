import express, { Express, Application, Request, Response } from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import bookRoutes from './routes/books';
import userRoutes from './routes/user';
import apiRoutes from './routes/api';
import noteRoutes from './routes/notes';
import tokenCleanup from './tokenCleanup';
import mongoose from 'mongoose';
import swaggerUi from 'swagger-ui-express';
// import swaggerSpec from './swagger.js';


// const express = require('express');
// import { Express, Request, Response, Application } from 'express';
const app: Application = express();


// const swaggerSpec = require('./swagger.js');

dotenv.config();
app.use(express.json());
app.use(cors());
// app.use(express.urlencoded({ extended: false }));

let PORT: string | number = process.env.DEV_PORT || 5000;
let MONGO_URI: string = process.env.MONGO_URI || '';

// app.use(
//     "/book-buddy-docs",
//     swaggerUi.serve,
//     swaggerUi.setup(swaggerSpec, { explorer: true })
// );

//middleware
app.use((req: Request, res: Response, next) => {
    next();
});

app.use('/users', userRoutes);
app.use('/api', apiRoutes);
app.use('/books', bookRoutes);
app.use('/notes', noteRoutes);

mongoose.connect(MONGO_URI)
    .then(() => {
        app.listen(PORT, () => {
            console.log('Connected to db & listening on port:', PORT)
        })
    })
    .catch((error: Error) => {
        console.log(error)
    })
