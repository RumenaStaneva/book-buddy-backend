import mongoose, { Schema, Document, Model } from 'mongoose';

interface ScreenTimePerDay {
    userId: string;
    weekStartDate: Date;
    date: Date;
    timeInSeconds: number;
}

interface ScreenTimePerDayDocument extends Document, ScreenTimePerDay { }

interface ScreenTimePerDayModel extends Model<ScreenTimePerDayDocument> {
    addScreenTimePerDay(data: ScreenTimePerDay): Promise<ScreenTimePerDayDocument>;
}

const screenTimePerDaySchema = new Schema<ScreenTimePerDayDocument, ScreenTimePerDayModel>({
    userId: {
        type: String,
        required: true,
    },
    weekStartDate: {
        type: Date,
        required: true,
    },
    date: {
        type: Date,
        required: true,
    },
    timeInSeconds: {
        type: Number,
        required: true,
    },
});

screenTimePerDaySchema.statics.addScreenTimePerDay = async function (data: ScreenTimePerDay): Promise<ScreenTimePerDayDocument> {
    const { userId, weekStartDate, date, timeInSeconds } = data;
    try {
        const screenTimePerDay = await this.create({ userId, weekStartDate, date, timeInSeconds })
        return screenTimePerDay;
    } catch (error) {
        console.error('Error creating note:', error);
        throw error;
    }
};

export default mongoose.model<ScreenTimePerDayDocument, ScreenTimePerDayModel>('ScreenTimePerDay', screenTimePerDaySchema);