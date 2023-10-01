import { Request, Response } from 'express';
import NoteModel from '../models/noteModel';
import BookModel from '../models/bookModel';
import dotenv from 'dotenv';
import { IGetUserAuthInfoRequest } from '../types/express';
dotenv.config();

const createNote = async (req: IGetUserAuthInfoRequest, res: Response) => {
    const userId = req.user?._id;
    const { bookId, noteText } = req.body;
    try {
        // console.log(userId, bookId, noteText);
        const note = await NoteModel.createNote({ bookId, userId, noteText });
        res.status(200).json({ note });
    } catch (error: any) {
        res.status(400).json({ error: error.message });
    }
}

const getNotes = async (req: IGetUserAuthInfoRequest, res: Response) => {
    const userId = req.user?._id;
    const bookId = req.query.bookId;
    const offset = parseInt(req.query.offset as string) || 0;
    const limit = 10;

    try {
        const book = await BookModel.findOne({ owner: userId, _id: bookId });
        if (!book) {
            return res.status(400).json({ error: 'Book does not exist' });
        }

        const notes = await NoteModel.find({ userId, bookId })
            .skip(offset)
            .limit(limit);

        res.status(200).json({ notes });
    } catch (error) {
        res.status(400).json({ error: 'Error while fetching book\'s notes' });
    }
};

const updateNote = async (req: Request, res: Response) => {
    const noteId = req.query.noteId;
    const { bookId, userId } = req.body.note;
    const { editedNoteText } = req.body;

    try {
        const book = await BookModel.findOne({ owner: userId, _id: bookId });
        if (!book) {
            return res.status(400).json({ error: 'Book does not exist' });
        }

        const editedNote = await NoteModel.findOneAndUpdate(
            { _id: noteId },
            { noteText: editedNoteText },
            { new: true }
        );
        if (editedNote) {
            res.status(200).json({ editedNote });
        }

    } catch (error) {
        res.status(400).json({ error: 'Error while editing note' });

    }
}

const deleteNote = async (req: Request, res: Response) => {
    const noteId = req.query.noteId;
    try {
        const deletedNote = await NoteModel.findByIdAndDelete(noteId);
        res.status(200).json({ message: 'Note deleted succesfuly', deletedNote });
    } catch (error) {
        res.status(400).json({ error: 'Error while deleting note' });
    }
}

export {
    createNote,
    getNotes,
    updateNote,
    deleteNote
}