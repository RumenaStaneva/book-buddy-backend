import screenTimePerDayModel from '../models/screenTimePerDayModel';
import readingTimePerDayModel from '../models/readingTimePerDay';
import { startOfWeek, addWeeks, endOfWeek, eachDayOfInterval, subWeeks, } from 'date-fns';

async function saveScreenTimeData(userId: string, screenTimeData: any[]) {
    return await Promise.all(screenTimeData.map(async (data: any) => {
        const date = convertToMMDDFormat(data.date);
        return await screenTimePerDayModel.addScreenTimePerDay({
            userId,
            date: date,
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

function prepareReadingTimeData(savedScreenTimeData: any[], weeklyGoalAveragePerDay: number) {
    const startOfNextWeek = startOfWeek(addWeeks(savedScreenTimeData[0].date, 1), { weekStartsOn: 2 });
    const endOfNextWeek = endOfWeek(startOfNextWeek, { weekStartsOn: 2 });
    const interval = { start: startOfNextWeek, end: endOfNextWeek };
    const nextWeekDays = eachDayOfInterval(interval);
    return savedScreenTimeData.map((data: any, index) => {

        return {
            date: nextWeekDays[index],
            screenTimeDate: savedScreenTimeData[index].date,
            screenTimeInSeconds: data.timeInSeconds
        };
    });
}

async function saveReadingTimeData(userId: string, readingTimeData: any[], weeklyGoalAveragePerDay: number) {
    return await Promise.all(readingTimeData.map(async (data: any) => {

        return await readingTimePerDayModel.addReadingTimePerDay({
            userId,
            screenTimeDate: data.screenTimeDate,
            date: data.date,
            screenTimeInSeconds: data.screenTimeInSeconds,
            goalAchievedForTheDay: false,
            weeklyGoalAveragePerDay,
            totalReadingGoalForTheDay: data.screenTimeInSeconds,
            timeInSecondsLeftForAchievingReadingGoal: data.screenTimeInSeconds,
            timeInSecondsForTheDayReading: 0
        });
    }));
}

const getStartOfCurrentWeek = (): Date => {
    const currentDate = new Date();
    const firstDayOfWeek = startOfWeek(currentDate, { weekStartsOn: 2 }); // i made it to start on 2 cuz the 1 was giving sunday
    return firstDayOfWeek;
};

const getStartOfPreviousWeek = (date: Date): Date => {
    const lastWeekStart = startOfWeek(subWeeks(date, 1), { weekStartsOn: 1 })
    return lastWeekStart;
};

function convertToMMDDFormat(inputDate: string) {
    const [year, month, day] = inputDate.split('/').map(Number);
    return new Date(year, month - 1, day + 1);
}


export {
    saveScreenTimeData,
    calculateWeeklyGoalAverage,
    prepareReadingTimeData,
    saveReadingTimeData,
    getStartOfCurrentWeek,
    getStartOfPreviousWeek,
    convertToMMDDFormat
}
