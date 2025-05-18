const fs = require('fs');
const path = require('path');

const COUNTER_FILE = path.join(__dirname, '../data/viwecount.json');

function ensureCounterFile() {
    const dir = path.dirname(COUNTER_FILE);
    if(!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive:true });
    }
    if(!fs.existsSync(COUNTER_FILE)) {
        fs.writeFileSync(COUNTER_FILE, JSON.stringify({ count: 0}));
    }
}

function getViewCount() {
    ensureCounterFile();
    const data = JSON.parse(fs.readFileSync(COUNTER_FILE));
    return data.count;
}

function incrementViewCount() {
    ensureCounterFile();
    const data = JSON.parse(fs.readFileSync(COUNTER_FILE));
    data.count += 1;
    fs.writeFileSync(COUNTER_FILE, JSON.stringify(data));
    return data.count;
}

module.exports = {
    getViewCount,
    incrementViewCount
};