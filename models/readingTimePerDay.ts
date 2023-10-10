import mongoose, { Schema, Document, Model } from 'mongoose';

interface ReadingTimePerDay {
    userId: string;
    weekStartDate: Date;
    date: Date;
    screenTimeInSeconds: number;
    goalAchievedForTheDay: boolean;
    weeklyGoalAveragePerDay: number;
    timeInSecondsForTheDayReading: number;
}

interface ReadingTimePerDayDocument extends Document, ReadingTimePerDay { }

interface ReadingTimePerDayModel extends Model<ReadingTimePerDayDocument> {
    addReadingTimePerDay(data: ReadingTimePerDay): Promise<ReadingTimePerDayDocument>;
}

const readingTimePerDaySchema = new Schema<ReadingTimePerDayDocument, ReadingTimePerDayModel>({
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
    screenTimeInSeconds: {
        type: Number,
        required: true,
    },
    goalAchievedForTheDay: {
        type: Boolean,
        required: true,
    },
    weeklyGoalAveragePerDay: {
        type: Number,
        required: true,
    },
    timeInSecondsForTheDayReading: {
        type: Number,
        required: true,
    },
});

readingTimePerDaySchema.statics.addReadingTimePerDay = async function (data: ReadingTimePerDay): Promise<ReadingTimePerDayDocument> {
    const { userId, weekStartDate, date, screenTimeInSeconds, goalAchievedForTheDay, weeklyGoalAveragePerDay, timeInSecondsForTheDayReading } = data;
    try {
        const readingTimePerDay = await this.create({
            userId,
            weekStartDate,
            date,
            screenTimeInSeconds,
            goalAchievedForTheDay,
            weeklyGoalAveragePerDay,
            timeInSecondsForTheDayReading,
        });
        return readingTimePerDay;
    } catch (error) {
        console.error('Error creating reading time entry:', error);
        throw error;
    }
};

export default mongoose.model<ReadingTimePerDayDocument, ReadingTimePerDayModel>('ReadingTimePerDay', readingTimePerDaySchema);