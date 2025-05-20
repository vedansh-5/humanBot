const runViewer = require('./viewVideo');

(async () => {
    try {
        console.log('Starting viewer bot...');
        await runViewer();
        console.log('Viewer bot finished.');
    } catch (err) {
        console.error('Viewer bot crashed:', err);
    }
})();
