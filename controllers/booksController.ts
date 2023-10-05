import { Request, Response, Router } from 'express';
import axios from 'axios';
import dotenv from 'dotenv';
import Book from '../models/bookModel';
import User from '../models/userModel';
import { IGetUserAuthInfoRequest } from '../types/express';
dotenv.config();

let KEY = process.env.KEY;

const searchBooks = async (req: Request, res: Response) => {
    try {
        const { title, startIndex, maxResults } = req.body;
        const url = `https://www.googleapis.com/books/v1/volumes?q=${title}&startIndex=${startIndex}&maxResults=${maxResults}&printType=books&key=${KEY}`;
        const response = await axios.get(url);
        if (response.status !== 200) {
            throw new Error(`Error fetching books: ${response.statusText}`);
        }
        const responseData = await response.data;
        res.json(responseData);
    } catch (error: any) {
        console.error('Error fetching books:', error.message);
        res.status(500).json({ error: 'Error fetching books from the Google Books API' });
    }
}

const getUserLibrary = async (req: IGetUserAuthInfoRequest, res: Response) => {
    const userId = req.user?._id;
    const user = await User.findOne({ _id: userId });
    if (user) {
        try {
            const wantToReadBooks = await Book.find({ owner: userId, shelf: 0 })
                .sort({ _id: -1 })
                .limit(5);
            const currentlyReadingBooks = await Book.find({ owner: userId, shelf: 1 })
                .sort({ _id: -1 })
                .limit(5);
            const readBooks = await Book.find({ owner: userId, shelf: 2 })
                .sort({ _id: -1 })
                .limit(5);
            res.status(200).json({ wantToReadBooks, currentlyReadingBooks, readBooks });
        } catch (error: any) {
            res.status(400).json({ error: error.message });
        }
    } else {
        res.status(400).json({ error: 'User does not exist' });
    }
}

const addToShelf = async (req: Request, res: Response) => {

    const thumbnail = req.body.thumbnail;
    const {
        bookApiId,
        userEmail,
        title,
        authors,
        description,
        publisher,
        category,
        pageCount,
        notes,
        progress,
        shelf
    } = req.body;

    const user = await User.findOne({ email: userEmail });
    let owner;
    if (!user) {
        console.log('No such user in DB');
        return res.status(401).json({ error: 'No such user in DB' });
    } else {
        owner = user._id.toString();
    }

    try {
        const book = await Book.createBook({ bookApiId, owner, title, authors, description, publisher, thumbnail, category, pageCount, notes, progress, shelf });
        res.status(200).json({ book });
    } catch (error: any) {
        const lastIndex = error.message.lastIndexOf(":") + 1;
        const desiredMessage = error.message.substring(lastIndex).trim();
        res.status(400).json({ error: desiredMessage });
    }
}

const updateBook = async (req: IGetUserAuthInfoRequest, res: Response) => {
    const userId = req.user?._id;
    const {
        _id,
        title,
        authors,
        description,
        thumbnail,
        category,
        progress,
        shelf,
        pageCount
    } = req.body.book;

    try {
        const book = await Book.findOne({ owner: userId, _id: _id });
        if (!book) {
            return res.status(400).json({ message: 'Book does not exist' });
        }

        if (progress < 0) {
            return res.status(400).json({ message: 'Progress must be a positive number' });
        }

        const updatedProgress = progress;
        if (updatedProgress >= book.pageCount) {
            book.shelf = 2;
            book.progress = book.pageCount;
        } else {
            book.shelf = shelf;
            book.progress = updatedProgress;
        }

        book.title = title;
        book.authors = authors;
        book.description = description;
        book.category = category;
        book.pageCount = pageCount;
        book.thumbnail = thumbnail;
        await book.save();
        res.status(200).json({ book });

    } catch (error: any) {
        res.status(400).json({ error: error.message });
    }

}

const getAllBooksOnShelf = async (req: IGetUserAuthInfoRequest, res: Response) => {
    const userId = req.user?._id;
    const shelf = req.query.shelf;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 5;
    const skip = (page - 1) * limit;
    const filterCategory = req.query.category;
    const searchQuery = req.query.search;

    try {
        let query: any = { owner: userId, shelf: shelf };
        if (filterCategory) {
            query.category = filterCategory;
        }

        if (searchQuery) {
            query.title = { $regex: searchQuery, $options: 'i' };
        }

        const books = await Book.find(query)
            .skip(skip)
            .limit(limit)
            .exec();

        const totalBooks = await Book.countDocuments(query);
        const totalPages = Math.ceil(totalBooks / limit);

        res.status(200).json({ books, totalPages });
    } catch (error) {
        res.status(400).json({ error: 'Error while fetching all books on shelf' });
    }
}

const getBookDetails = async (req: IGetUserAuthInfoRequest, res: Response) => {
    const userId = req.user?._id;
    const bookId = req.query.bookId;

    try {
        const book = await Book.findOne({ owner: userId, _id: bookId });
        if (!book) {
            return res.status(400).json({ error: 'Book does not exist' });
        }
        res.status(200).json({ book });

    } catch (error: any) {
        res.status(400).json({ error: error.message });
    }
}

const deleteBook = async (req: Request, res: Response) => {
    const bookId = req.query.bookId;
    try {
        const deletedBook = await Book.findByIdAndDelete(bookId);
        res.status(200).json({ message: 'Book deleted succesfuly', deletedBook });
    } catch (error) {
        res.status(400).json({ error: 'Error while deleting book' });
    }
}

export {
    searchBooks,
    getUserLibrary,
    addToShelf,
    getAllBooksOnShelf,
    updateBook,
    getBookDetails,
    deleteBook,
}