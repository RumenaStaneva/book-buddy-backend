import mongoose, { Schema, Document, Model } from 'mongoose';
import BookModel from './bookModel';

interface Note {
    userId: string;
    bookId: string;
    noteText: string;
}

interface NoteDocument extends Document, Note { }

interface NoteModel extends Model<NoteDocument> {
    createNote(data: Note): Promise<NoteDocument>;
}

const noteSchema = new Schema<NoteDocument, NoteModel>({
    userId: {
        type: String,
        required: true,
    },
    bookId: {
        type: String,
        required: true,
    },
    noteText: {
        type: String,
        required: true,
    },
});

noteSchema.statics.createNote = async function (data: Note): Promise<NoteDocument> {
    const { userId, bookId, noteText } = data;
    try {
        const existingBook = await BookModel.findOne({ _id: bookId, owner: userId });
        if (existingBook) {
            const note = await this.create({ bookId, userId, noteText })
            return note;
        } else {
            throw new Error('Book does not exists');
        }
    } catch (error) {
        console.error('Error creating note:', error);
        throw error;
    }
};

export default mongoose.model<NoteDocument, NoteModel>('Note', noteSchema);