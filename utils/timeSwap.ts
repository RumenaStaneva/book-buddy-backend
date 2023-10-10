import screenTimePerDayModel from '../models/screenTimePerDayModel';
import readingTimePerDayModel from '../models/readingTimePerDay';


async function saveScreenTimeData(userId: string, screenTimeData: any[], weekStartDate: Date) {
    return await Promise.all(screenTimeData.map(async (data: any) => {
        return await screenTimePerDayModel.addScreenTimePerDay({
            userId,
            weekStartDate,
            date: data.date,
            timeInSeconds: data.timeInSecond
        });
    }));
}


function calculateWeeklyGoalAverage(screenTimeData: any[]): number {
    const summaryWeeklyGoalAveragePerDay = screenTimeData.reduce((summary: number, data: any) => {
        return summary + Number(data.timeInSecond);
    }, 0);
    return Math.round(summaryWeeklyGoalAveragePerDay / 7);
}

function prepareReadingTimeData(screenTimeData: any[], nextWeekStartDate: Date, weeklyGoalAveragePerDay: number) {
    return screenTimeData.map((data: any) => {
        return {
            date: data.date,
            screenTimeInSeconds: data.timeInSecond,
            goalAchievedForTheDay: false,
            weeklyGoalAveragePerDay,
            timeInSecondsForTheDayReading: 0
        };
    });
}
async function saveReadingTimeData(userId: string, readingTimeData: any[], nextWeekStartDate: Date, weeklyGoalAveragePerDay: number) {
    return await Promise.all(readingTimeData.map(async (data: any) => {
        return await readingTimePerDayModel.addReadingTimePerDay({
            userId,
            weekStartDate: nextWeekStartDate,
            date: data.date,
            screenTimeInSeconds: data.screenTimeInSeconds,
            goalAchievedForTheDay: false,
            weeklyGoalAveragePerDay,
            timeInSecondsForTheDayReading: 0
        });
    }));
}

const getStartOfCurrentWeek = (date: Date): Date => {
    const currentDate = new Date(date);
    const dayOfWeek = currentDate.getUTCDay() || 7;
    currentDate.setUTCDate(currentDate.getUTCDate() + 1 - dayOfWeek);
    return currentDate;
};

const getStartOfPreviousWeek = (date: Date): Date => {
    const currentDate = getStartOfCurrentWeek(date);
    currentDate.setUTCDate(currentDate.getUTCDate() - 7);
    return currentDate;
};



export {
    saveScreenTimeData,
    calculateWeeklyGoalAverage,
    prepareReadingTimeData,
    saveReadingTimeData,
    getStartOfCurrentWeek,
    getStartOfPreviousWeek
}
