import cron, { ScheduleOptions } from 'node-cron';
import User from './models/userModel';
import { cleanExpiredVerificationTokens, cleanExpiredResetTokens } from './utils/tokenUtils';

async function verificationTokensExist() {
    //check if there are users with a non-null verificationToken
    const usersWithVerificationTokens = await User.countDocuments({ verificationToken: { $ne: null } });
    return usersWithVerificationTokens > 0;
}
const scheduleOptions: ScheduleOptions = {
    scheduled: false, // Set this to false to prevent immediate execution
};
async function resetTokensExist() {
    // check if there are users with a non-null resetToken
    const usersWithResetTokens = await User.countDocuments({ resetToken: { $ne: null } });
    return usersWithResetTokens > 0; // Return true if there are tokens, otherwise false
}

const verificationTokenCleanupJob = new (cron.schedule as any)('0 0 * * *', async () => {
    const verificationTokenExist = await verificationTokensExist();
    if (verificationTokenExist) {
        cleanExpiredVerificationTokens();
    }
}, scheduleOptions);

const resetTokenCleanupJob = new (cron.schedule as any)('0 0 * * *', async () => {
    const resetTokenExist = await resetTokensExist();
    if (resetTokenExist) {
        cleanExpiredResetTokens();
    }
}, scheduleOptions);


// start the cleanup jobs only if there are tokens to remove
(async () => {
    const verificationTokenExist = await verificationTokensExist();
    const resetTokenExist = await resetTokensExist();

    if (verificationTokenExist) {
        verificationTokenCleanupJob.start();
    }

    if (resetTokenExist) {
        resetTokenCleanupJob.start();
    }
})();

export default { verificationTokenCleanupJob, resetTokenCleanupJob };