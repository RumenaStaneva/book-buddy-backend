const ncp = require('ncp');
const path = require('path');

const sourcePath = path.join(__dirname, 'emailTemplates');
const destinationPath = path.join(__dirname, 'dist', 'emailTemplates');

ncp(sourcePath, destinationPath, function (err) {
    if (err) {
        return console.error(err);
    }
    console.log('Email templates copied successfully!');
});
