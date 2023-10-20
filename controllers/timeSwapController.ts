import { Response } from 'express';
import User from '../models/userModel';
import { IGetUserAuthInfoRequest } from '../types/express';
import readingTimePerDayModel from '../models/readingTimePerDay';
import { startOfWeek, endOfWeek, eachDayOfInterval, format, subWeeks, parse, addWeeks } from 'date-fns';
import {
    saveScreenTimeData,
    calculateWeeklyGoalAverage,
    prepareReadingTimeData,
    saveReadingTimeData,
    getStartOfCurrentWeek,

    updateReadingTime,
    calculateReadingTimeSpendOnBook,
    updateBookReadDuringDay
} from '../utils/timeSwap'
import screenTimePerDayModel from '../models/screenTimePerDayModel';

const getCurrentWeekDates = async (req: IGetUserAuthInfoRequest, res: Response) => {
    try {
        const userId = req.user?._id;

        const currentDate = new Date();
        const lastWeekStart = startOfWeek(subWeeks(currentDate, 1), { weekStartsOn: 1 });
        const lastWeekEnd = endOfWeek(subWeeks(currentDate, 1), { weekStartsOn: 1 });
        const datesFromLastWeek = eachDayOfInterval({ start: lastWeekStart, end: lastWeekEnd });

        const hasAnyWeekData = await screenTimePerDayModel.exists({
            userId
        })
        const currentWeekStart = getStartOfCurrentWeek();
        const currentWeekEnd = endOfWeek(currentWeekStart, { weekStartsOn: 2 });
        const hasCurrentWeekData = await readingTimePerDayModel.exists({
            userId: userId,
            date: { $gte: currentWeekStart, $lte: currentWeekEnd }
        });

        const formattedDates = datesFromLastWeek.map(date => format(date, 'MMMM dd, yyyy'));
        res.status(200).json({ hasAnyWeekData, hasCurrentWeekData, weekDates: formattedDates });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
}

const getUserScreenTimeData = async (req: IGetUserAuthInfoRequest, res: Response) => {
    const userId = req.user?._id;
    try {
        const hasScreenTimeData = await readingTimePerDayModel.exists({ userId: userId });
        res.status(200).json({ hasScreenTimeData });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
};


const saveTime = async (req: IGetUserAuthInfoRequest, res: Response) => {
    const userId = req.user?._id;
    const existingUser = await User.findOne({ _id: userId });
    if (!existingUser) {
        return res.status(400).json({ error: 'User does not exist' });
    }
    try {
        const screenTimeData = req.body;
        const startDate = parse(screenTimeData[0].date, 'yyyy/MM/dd', new Date());
        const startOfWeekDay = startOfWeek(addWeeks(startDate, 1), { weekStartsOn: 2 });
        const lastWeekEnd = endOfWeek(addWeeks(startDate, 1), { weekStartsOn: 2 });

        const existingScreenTimeData = await readingTimePerDayModel.find({
            userId: userId,
            screenTimeDate: { $gte: startOfWeekDay, $lte: lastWeekEnd }
        });

        if (existingScreenTimeData.length > 0) {
            return res.status(400).json({ error: 'Screen time data already submitted for this week' });
        }

        const savedScreenTimeData = await saveScreenTimeData(userId, screenTimeData);
        const weeklyGoalAveragePerDay = calculateWeeklyGoalAverage(screenTimeData);
        const readingTimeData = prepareReadingTimeData(savedScreenTimeData, weeklyGoalAveragePerDay);
        const savedReadingTimeData = await saveReadingTimeData(userId, readingTimeData, weeklyGoalAveragePerDay);
        return res.status(200).json({
            savedScreenTimeData,
            savedReadingTimeData
        })
    } catch (error: any) {
        res.status(400).json({ error: error.message });
    }
}

const getReadingTime = async (req: IGetUserAuthInfoRequest, res: Response) => {
    const userId = req.user?._id;
    const existingUser = await User.findOne({ _id: userId });
    if (!existingUser) {
        return res.status(400).json({ error: 'User does not exist' });
    }

    try {
        const startDate = String(req.query.startDate);
        const endDate = String(req.query.endDate);

        // console.log(startDate);
        // console.log(endDate);
        if (!startDate || !endDate) {
            return res.status(400).json({ error: 'startDate and endDate are required parameters.' });
        }
        const parsedStartDate = new Date(startDate);
        const parsedEndDate = new Date(endDate);

        //converting the dates to UTC
        const utcStartDate = new Date(parsedStartDate.getTime() - parsedStartDate.getTimezoneOffset() * 60000);
        const utcEndDate = new Date(parsedEndDate.getTime() - parsedEndDate.getTimezoneOffset() * 60000);

        // console.log('utcStartDate', utcStartDate);
        // console.log('utcEndDate', utcEndDate);

        const readingTime = await readingTimePerDayModel.find({
            userId: userId,
            date: { $gte: utcStartDate, $lte: utcEndDate }
        }).sort({ date: 1 });

        // console.log(readingTime);


        return res.status(200).json({ readingTime });

    } catch (error) {
        return res.status(400).json({ error });
    }
}

const hasReadingTimeAnytime = async (req: IGetUserAuthInfoRequest, res: Response) => {
    const userId = req.user?._id;
    const existingUser = await User.findOne({ _id: userId });
    if (!existingUser) {
        return res.status(400).json({ error: 'User does not exist' });
    }

    try {
        const readingTime = await readingTimePerDayModel.find({
            userId: userId,
        }).sort({ date: 1 });
        if (!readingTime) {
            return res.status(200).json({ hasReadingTime: false });
        }

        return res.status(200).json({ hasReadingTime: true });

    } catch (error) {
        return res.status(400).json({ error });
    }
}

const updateReadingTimeForToday = async (req: IGetUserAuthInfoRequest, res: Response) => {
    try {
        const userId = req.user?._id;
        const existingUser = await User.findOne({ _id: userId });
        if (!existingUser) {
            return res.status(400).json({ error: 'User does not exist' });
        }

        const { date, totalReadingGoalForTheDay, timeInSecondsForTheDayReading, currentlyReadingBookId } = req.body;
        console.log(date, totalReadingGoalForTheDay, timeInSecondsForTheDayReading, currentlyReadingBookId);

        const previouslyReadingTimeForTheDay = await readingTimePerDayModel.findOne({ userId, date });
        const previousReadingTime = previouslyReadingTimeForTheDay ? previouslyReadingTimeForTheDay.timeInSecondsForTheDayReading : 0;

        const goalAchieved = previousReadingTime + timeInSecondsForTheDayReading >= totalReadingGoalForTheDay;
        // const readingTime = goalAchieved ? previousReadingTime + timeInSecondsForTheDayReading : timeInSecondsForTheDayReading;
        let readingTime = timeInSecondsForTheDayReading;

        console.log('previousReadingTime', previousReadingTime);
        console.log('timeInSecondsForTheDayReading', timeInSecondsForTheDayReading);
        console.log('readingTime', readingTime);


        const timeLeft = goalAchieved ? 0 : totalReadingGoalForTheDay - timeInSecondsForTheDayReading;

        const updatedReadingTimeRecord = await updateReadingTime(userId, date, readingTime, totalReadingGoalForTheDay, timeLeft, goalAchieved);
        let bookReadDuringPeriod = null;

        if (currentlyReadingBookId) {
            const readingTimeSpendOnBook = await calculateReadingTimeSpendOnBook(previousReadingTime, date, userId, currentlyReadingBookId);

            if (readingTimeSpendOnBook > 0) {
                bookReadDuringPeriod = await updateBookReadDuringDay(userId, date, currentlyReadingBookId, readingTimeSpendOnBook);
            }
        }
        console.log(updatedReadingTimeRecord);

        return res.json({
            updatedReadingTimeRecord,
            bookReadDuringPeriod: bookReadDuringPeriod ? bookReadDuringPeriod : null
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
};


export {
    saveTime,
    getReadingTime,
    getCurrentWeekDates,
    getUserScreenTimeData,
    hasReadingTimeAnytime,
    updateReadingTimeForToday
}