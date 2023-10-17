import { Request, Response } from 'express';
import User from '../models/userModel';
import { IGetUserAuthInfoRequest } from '../types/express';
import readingTimePerDayModel from '../models/readingTimePerDay';
import { startOfWeek, endOfWeek, eachDayOfInterval, format, subWeeks, parse, addWeeks, addHours, startOfDay, parseISO } from 'date-fns';
import { format as formatDate, utcToZonedTime, zonedTimeToUtc } from 'date-fns-tz';
import {
    saveScreenTimeData,
    calculateWeeklyGoalAverage,
    prepareReadingTimeData,
    saveReadingTimeData,
    getStartOfCurrentWeek,
    getStartOfPreviousWeek,
    convertToMMDDFormat
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
    const userId = req.user?._id;
    const existingUser = await User.findOne({ _id: userId });
    if (!existingUser) {
        return res.status(400).json({ error: 'User does not exist' });
    }

    try {
        const { date, timeInSecondsLeftForAchievingReadingGoal, timeInSecondsForTheDayReading } = req.body;
        const updatedReadingTimeRecord = await readingTimePerDayModel.findOneAndUpdate(
            {
                userId, date
            },
            { timeInSecondsForTheDayReading, timeInSecondsLeftForAchievingReadingGoal },
            { new: true }
        );
        // console.log('readingTimeRecord', updatedReadingTimeRecord);

        return res.json({
            updatedReadingTimeRecord
        });
    } catch (error) {
        return res.status(400).json({ error });
    }
}


export {
    saveTime,
    getReadingTime,
    getCurrentWeekDates,
    getUserScreenTimeData,
    hasReadingTimeAnytime,
    updateReadingTimeForToday
}