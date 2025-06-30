require('dotenv').config();
const path = require('path');

module.exports = {
    // videoUrl: 'https://www.youtube.com/watch?v=fu3YbH6_4FI',
    // videoUrl: 'https://www.youtube.com/watch?v=yU1rRzNqmRI',
    videoUrl: 'https://www.youtube.com/shorts/JNiX4aHqdSo',
    // videoUrl: 'https://www.youtube.com/watch?v=ffRenNbmyZQ',
    minWatchTime: 20, //seconds
    maxWatchTime: 60,
    jitterInterval: 5000, //ms
    userReferrer: true,
    referrerListPath: path.resolve(__dirname, '../page_gen/generated_pages/referrer_urls.json'),
    useProxy: true,
    proxyListPath: path.resolve(__dirname, 'proxies.txt')
};