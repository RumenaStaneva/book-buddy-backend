import mongoose, { Schema, Document, Model } from 'mongoose';

interface ReadingTimePerDay {
    userId: string;
    screenTimeDate: Date;
    date: Date;
    screenTimeInSeconds: number;
    goalAchievedForTheDay: boolean;
    weeklyGoalAveragePerDay: number;
    timeInSecondsLeftForAchievingReadingGoal: number;
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
    screenTimeDate: {
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
    timeInSecondsLeftForAchievingReadingGoal: {
        type: Number,
        required: true,
    },
    timeInSecondsForTheDayReading: {
        type: Number,
        required: true,
    },
});

readingTimePerDaySchema.statics.addReadingTimePerDay = async function (data: ReadingTimePerDay): Promise<ReadingTimePerDayDocument> {
    const { userId, screenTimeDate, date, screenTimeInSeconds, goalAchievedForTheDay, weeklyGoalAveragePerDay, timeInSecondsLeftForAchievingReadingGoal, timeInSecondsForTheDayReading } = data;
    try {
        const readingTimePerDay = await this.create({
            userId,
            screenTimeDate,
            date,
            screenTimeInSeconds,
            goalAchievedForTheDay,
            weeklyGoalAveragePerDay,
            timeInSecondsLeftForAchievingReadingGoal,
            timeInSecondsForTheDayReading,
        });
        return readingTimePerDay;
    } catch (error) {
        console.error('Error creating reading time entry:', error);
        throw error;
    }
};

export default mongoose.model<ReadingTimePerDayDocument, ReadingTimePerDayModel>('ReadingTimePerDay', readingTimePerDaySchema);