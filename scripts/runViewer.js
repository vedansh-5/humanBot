const runViewer = require('./viewVideo');

// Get mode from command line argument
const mode = process.argv[2]?.toLowerCase() || 'watchtime';

// Validate mode
if (!['view', 'watchtime'].includes(mode)) {
    console.error('Invalid mode, Use node runViewer.js [view|watchtime]');
    process.exit(1);
}

runViewer(mode);
