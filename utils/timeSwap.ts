import readingTimePerDayModel from '../models/readingTimePerDay';
import BookReadDuringDay from '../models/bookReadDuringDayModel';
import { startOfWeek, addWeeks, endOfWeek, eachDayOfInterval, subWeeks, } from 'date-fns';

// async function saveScreenTimeData(userId: string, screenTimeData: any[]) {
//     return await Promise.all(screenTimeData.map(async (data: any) => {
//         const date = convertToMMDDFormat(data.date);
//         return await screenTimePerDayModel.addScreenTimePerDay({
//             userId,
//             date: date,
//             timeInSeconds: data.timeInSecond
//         });
//     }));
// }

function calculateWeeklyGoalAverage(screenTimeData: any[]): number {
    const summaryWeeklyGoalAveragePerDay = screenTimeData.reduce((summary: number, data: any) => {
        return summary + Number(data.screenTimeInSeconds);
    }, 0);
    return Math.round(summaryWeeklyGoalAveragePerDay / 7);
}

function prepareReadingTimeData(screenTimeDataForTheWeek: any[], weeklyGoalAveragePerDay: number) {
    const startOfNextWeek = startOfWeek(addWeeks(screenTimeDataForTheWeek[0].date, 1), { weekStartsOn: 2 });
    const endOfNextWeek = endOfWeek(startOfNextWeek, { weekStartsOn: 2 });
    const interval = { start: startOfNextWeek, end: endOfNextWeek };
    const nextWeekDays = eachDayOfInterval(interval);
    return screenTimeDataForTheWeek.map((data: any, index) => {

        return {
            date: nextWeekDays[index],
            screenTimeDate: screenTimeDataForTheWeek[index].date,
            screenTimeInSeconds: data.screenTimeInSeconds,
            weeklyGoalAveragePerDay
        };
    });
}

async function saveReadingTimeData(userId: string, readingTimeData: any[]) {
    return await Promise.all(readingTimeData.map(async (data: any) => {

        return await readingTimePerDayModel.addReadingTimePerDay({
            userId,
            screenTimeDate: data.screenTimeDate,
            date: data.date,
            screenTimeInSeconds: data.screenTimeInSeconds,
            goalAchievedForTheDay: false,
            weeklyGoalAveragePerDay: data.weeklyGoalAveragePerDay,
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


function convertToMMDDFormat(inputDate: string) {
    const [year, month, day] = inputDate.split('/').map(Number);
    return new Date(year, month - 1, day + 1);
}


async function updateReadingTime(userId: string, date: Date, timeInSecondsForTheDayReading: number, totalReadingGoalForTheDay: number, timeLeft: number, goalAchieved: boolean) {
    return await readingTimePerDayModel.findOneAndUpdate(
        { userId, date },
        { timeInSecondsForTheDayReading, totalReadingGoalForTheDay, timeInSecondsLeftForAchievingReadingGoal: timeLeft, goalAchievedForTheDay: goalAchieved },
        { new: true }
    );
}

async function calculateReadingTimeSpendOnBook(previousTimeInSecondsForTheDayReading: number, date: Date, userId: string, currentlyReadingBookId: string) {
    const previouslyReadingTimeForTheDay = await readingTimePerDayModel.findOne({ userId, date });
    const currentTime = previouslyReadingTimeForTheDay ? previouslyReadingTimeForTheDay.timeInSecondsForTheDayReading : 0;

    if (currentlyReadingBookId) {
        const existingBook = await BookReadDuringDay.findOne(
            { userId, date, bookId: currentlyReadingBookId });
        if (existingBook) {
            return currentTime - previousTimeInSecondsForTheDayReading + existingBook?.timeSpendReading || 0
        } else {
            if (currentTime > 0) {
                await BookReadDuringDay.create({
                    userId,
                    date,
                    bookId: currentlyReadingBookId,
                    timeSpendReading: currentTime
                });
                console.log("New book record created for the day.");
                return currentTime - previousTimeInSecondsForTheDayReading;
            }
        }
    }
    return currentTime - previousTimeInSecondsForTheDayReading;
}

async function updateBookReadDuringDay(userId: string, date: Date, currentlyReadingBookId: string, readingTimeSpendOnBook: number) {
    return await BookReadDuringDay.findOneAndUpdate(
        { userId, date, bookId: currentlyReadingBookId },
        { timeSpendReading: readingTimeSpendOnBook },
        { new: true }
    );
}

const validateScreenTimeData = (screenTimeData: any) => {
    if (!Array.isArray(screenTimeData) || screenTimeData.length !== 7) {
        throw new Error('Screen time data must be an array with 7 objects.');
    }

    for (const data of screenTimeData) {
        if (!data.date || !data.time) {
            throw new Error('Invalid screen time data format. Each entry must have a date and time.');
        }

        const dateRegex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z$/;
        const timeRegex = /^\d+$/;

        if (!dateRegex.test(data.date) || !timeRegex.test(data.time)) {
            throw new Error('Invalid date or time format. Date must be in ISO format and time must be in seconds.');
        }

        const timeInSeconds = parseInt(data.time, 10);
        if (timeInSeconds < 0 || timeInSeconds > 86400) {
            throw new Error('Invalid time duration. Time must be between 0 and 24 hours.');
        }
    }

    return true;
};



export {
    // saveScreenTimeData,
    calculateWeeklyGoalAverage,
    prepareReadingTimeData,
    saveReadingTimeData,
    getStartOfCurrentWeek,
    convertToMMDDFormat,

    updateReadingTime,
    calculateReadingTimeSpendOnBook,
    updateBookReadDuringDay,
    validateScreenTimeData
}
