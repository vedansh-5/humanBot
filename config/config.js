require('dotenv').config();

module.exports = {
    proxy: process.env.PROXY || null, // e.g. http://username:password@host:port
    videoUrl: 'https://www.youtube.com/watch?v=fu3YbH6_4FI',
    minWatchTime: 20, //seconds
    maxWatchTime: 60,
    jitterInterval: 5000, //ms
}