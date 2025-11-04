const express = require('express');
const ytdl = require('ytdl-core');
const cors = require('cors');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.post('/download', async (req, res) => {
    const { url, quality } = req.body;

    if (!ytdl.validateURL(url)) {
        return res.status(400).json({ error: 'Invalid URL' });
    }

    try {
        const info = await ytdl.getInfo(url);
        const title = info.videoDetails.title;

        // Get available formats
        const formats = ytdl.filterFormats(info.formats, 'videoandaudio');

        // Select format based on quality
        let selectedFormat;
        switch (quality) {
            case 'High (1080p)':
                selectedFormat = formats.find(f => f.qualityLabel === '1080p');
                break;
            case 'Medium (720p)':
                selectedFormat = formats.find(f => f.qualityLabel === '720p');
                break;
            case 'Low (480p)':
                selectedFormat = formats.find(f => f.qualityLabel === '480p');
                break;
            default:
                selectedFormat = formats[0];
        }

        if (!selectedFormat) {
            return res.status(400).json({ error: 'Quality not available' });
        }

        res.header('Content-Disposition', `attachment; filename="${title}.mp4"`);
        ytdl(url, { format: selectedFormat }).pipe(res);

    } catch (error) {
        res.status(500).json({ error: 'Download failed' });
    }
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});