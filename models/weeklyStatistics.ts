//feature
import mongoose, { Schema, Document, Model } from 'mongoose';

interface WeeklyStatistics {
    userId: string;
    weekStartDate: Date;
    weekEndDate: Date;
    screenTimeTotalSeconds: number;
    readingTimeTotalSeconds: number;
    weeklyGoalAverage: number;
    goalAchieved: boolean;
}

interface WeeklyStatisticsDocument extends Document, WeeklyStatistics { }

interface WeeklyStatisticsModel extends Model<WeeklyStatisticsDocument> {
    generateWeeklyStatistics(userId: string): Promise<WeeklyStatisticsDocument>;
}

const weeklyStatisticsSchema = new Schema<WeeklyStatisticsDocument, WeeklyStatisticsModel>({
    userId: {
        type: String,
        required: true,
    },
    weekStartDate: {
        type: Date,
        required: true,
    },
    weekEndDate: {
        type: Date,
        required: true,
    },
    screenTimeTotalSeconds: {
        type: Number,
        required: true,
    },
    readingTimeTotalSeconds: {
        type: Number,
        required: true,
    },
    weeklyGoalAverage: {
        type: Number,
        required: true,
    },
    goalAchieved: {
        type: Boolean,
        required: true,
    },
});

weeklyStatisticsSchema.statics.generateWeeklyStatistics = async function (userId: string, startDate: Date, endDate: Date, totalScreenTimeSeconds: number, totalReadingTimeSeconds: number, weeklyGoalAverage: number): Promise<WeeklyStatisticsDocument> {
    // Logic to calculate weekly statistics goes here
    // You can query ScreenTimePerDay and ReadingTimePerDay models to calculate the totals
    // Set goalAchieved based on your criteria (readingTimeTotalSeconds >= screenTimeTotalSeconds)
    // Create and save the WeeklyStatistics document
    // Example:
    const weeklyStatistics = await this.create({
        userId,
        weekStartDate: startDate,
        weekEndDate: endDate,
        screenTimeTotalSeconds: totalScreenTimeSeconds,
        readingTimeTotalSeconds: totalReadingTimeSeconds,
        weeklyGoalAverage,
        goalAchieved: totalReadingTimeSeconds >= totalScreenTimeSeconds,
    });
    return weeklyStatistics;
};

export default mongoose.model<WeeklyStatisticsDocument, WeeklyStatisticsModel>('WeeklyStatistics', weeklyStatisticsSchema);
