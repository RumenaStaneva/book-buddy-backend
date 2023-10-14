import { Request, Response } from 'express';
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

// const getReadingTime = async (req: IGetUserAuthInfoRequest, res: Response) => {
//     const userId = req.user?._id;
//     const existingUser = await User.findOne({ _id: userId });
//     if (!existingUser) {
//         return res.status(400).json({ error: 'User does not exist' });
//     }

//     try {
//         const today = new Date();
//         const startOfWeekDay = startOfWeek(today, { weekStartsOn: 2 });
//         const lastWeekEnd = endOfWeek(today, { weekStartsOn: 2 });
//         const readingTimePerDay = await readingTimePerDayModel.find({
//             userId: userId,
//             date: { $gte: startOfWeekDay, $lte: lastWeekEnd }
//         }).sort({ date: 1 });

//         return res.status(200).json({ readingTimePerDay });
//     } catch (error) {
//         return res.status(400).json({ error });
//     }
// };


const saveTime = async (req: IGetUserAuthInfoRequest, res: Response) => {
    const userId = req.user?._id;
    const existingUser = await User.findOne({ _id: userId });
    if (!existingUser) {
        return res.status(400).json({ error: 'User does not exist' });
    }
    try {
        const screenTimeData = req.body;
        const lastWeekStartDate = screenTimeData[0].date;
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

        const savedScreenTimeData = await saveScreenTimeData(userId, screenTimeData, lastWeekStartDate);
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
        const { startDate, endDate } = req.query;
        console.log(startDate);
        console.log(endDate);

        const readingTime = await readingTimePerDayModel.find({
            userId: userId,
            date: { $gte: startDate, $lte: endDate }
        }).sort({ date: 1 });
        console.log(readingTime);

        return res.status(200).json({ readingTime });

    } catch (error) {
        return res.status(400).json({ error });
    }
}


export {
    saveTime,
    getReadingTime,
    getCurrentWeekDates,
    getUserScreenTimeData,
}