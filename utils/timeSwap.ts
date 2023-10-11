import screenTimePerDayModel from '../models/screenTimePerDayModel';
import readingTimePerDayModel from '../models/readingTimePerDay';
import { startOfWeek, addWeeks, endOfWeek, eachDayOfInterval, subWeeks, } from 'date-fns';


async function saveScreenTimeData(userId: string, screenTimeData: any[], weekStartDate: Date) {
    return await Promise.all(screenTimeData.map(async (data: any) => {
        const date = convertToMMDDFormat(data.date);
        return await screenTimePerDayModel.addScreenTimePerDay({
            userId,
            weekStartDate,
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
    console.log('startOfNextWeek', startOfNextWeek);
    console.log('endOfNextWeek', endOfNextWeek);
    const interval = { start: startOfNextWeek, end: endOfNextWeek };
    const nextWeekDays = eachDayOfInterval(interval);
    console.log('nextWeekDays', nextWeekDays);

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
            timeInSecondsForTheDayReading: 0
        });
    }));
}

const getStartOfCurrentWeek = (): Date => {
    const currentDate = new Date();
    const firstDayOfWeek = startOfWeek(currentDate, { weekStartsOn: 2 }); // i made it to start on 2 cuz the 1 was giving sunday
    console.log('firstDayOfWeek', firstDayOfWeek);

    return firstDayOfWeek;
};

const getStartOfPreviousWeek = (date: Date): Date => {
    const lastWeekStart = startOfWeek(subWeeks(date, 1), { weekStartsOn: 1 })
    return lastWeekStart;
};

function convertToMMDDFormat(inputDate: string) {
    const [year, month, day] = inputDate.split('/').map(Number);
    console.log('day', day);
    console.log('month', month);


    // Create a new Date object with the specified year, month (0-based index), and day
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
