import mongoose, { Schema, Model } from 'mongoose';


interface BookReadDuringDayModel extends Model<BookReadDuringDayDocument> {
    createBookReadDuringDay(data: BookReadDuringDayData): Promise<BookReadDuringDayDocument>;
}


interface BookReadDuringDayData {
    date: Date;
    userId: string;
    bookId: string;
    timeSpendReading: number;
}

interface BookReadDuringDayDocument extends mongoose.Document {
    date: Date;
    userId: string;
    bookId: string;
    timeSpendReading: number;
}

const bookReadDuringDaySchema = new Schema({
    date: {
        type: Date,
        required: true,
    },
    userId: {
        type: String,
        required: true,
    },
    bookId: {
        type: String,
        required: true,
    },
    timeSpendReading: {
        type: Number,
        required: true,
    },
});

bookReadDuringDaySchema.statics.createBook = async function (data) {

    const { date, userId, bookId, timeSpendReading } = data;
    try {

        const existingBook = await this.findOne({ _id: bookId, owner: userId })

        if (!existingBook) {
            throw new Error('Book does not exists in your shelf');
        } else {
            const book = await this.create({ date, userId, bookId, timeSpendReading })
            return book;
        }

    } catch (error: any) {
        console.error('Error creating book:', error);
        throw error;
    }

};


const BookReadDuringDay = mongoose.model<BookReadDuringDayDocument, BookReadDuringDayModel>('BookReadDuringDay', bookReadDuringDaySchema);
export default BookReadDuringDay;