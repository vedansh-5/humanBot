module.exports.getRandomInt = (min, max) => {
    return Math.floor(Math.random() * (max - min + 1)) + min;
};

module.exports.getRandomTime = (minSec, maxSec) => {
    return (Math.random() * (maxSec - minSec) + minSec) * 1000;
};