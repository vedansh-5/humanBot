import fs from 'fs';
import path from 'path';

export default function handler(req, res) {
    if(req.method !== 'POST' ) return res.status(405).end();
    const {page, video, ts } = req.body;
    const logLine = `${ts}\t${page}\t${video}\n`;
    const file = path.resolve('./logs.visits.log');
    fs.appendFileSync(file, logLine);
    res.status(200).json({ success: true });
}