const fs = require('fs');
const LOG_FILE = './bot.log';


function log(message) {
    console.log(`[${new Date().toISOString()}] ${message}`);
}

function botLog(...args) {
    const line = `[${new Date().toISOString()}] ${args.join(' ')}\n`;
    fs.appendFile(LOG_FILE, line, (err) => {
        if (err) console.error('Error writing log:', err);
    });
    console.log(...args);
}

module.exports = { log, botLog };