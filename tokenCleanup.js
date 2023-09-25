const cron = require('node-cron');
const User = require('./models/userModel');
const { cleanExpiredVerificationTokens, cleanExpiredResetTokens } = require('./utils/tokenUtils');

async function verificationTokensExist() {
    //check if there are users with a non-null verificationToken
    const usersWithVerificationTokens = await User.countDocuments({ verificationToken: { $ne: null } });

    return usersWithVerificationTokens > 0;
}

async function resetTokensExist() {
    // check if there are users with a non-null resetToken
    const usersWithResetTokens = await User.countDocuments({ resetToken: { $ne: null } });

    return usersWithResetTokens > 0; // Return true if there are tokens, otherwise false
}

const verificationTokenCleanupJob = new cron.schedule('0 * * * *', async () => {
    const verificationTokenExist = await verificationTokensExist();
    if (verificationTokenExist) {
        cleanExpiredVerificationTokens();
    }
});

const resetTokenCleanupJob = new cron.schedule('30 * * * *', async () => {
    const resetTokenExist = await resetTokensExist();
    if (resetTokenExist) {
        cleanExpiredResetTokens();
    }
});


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