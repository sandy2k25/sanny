const express = require('express');
const axios = require('axios');
const app = express();
const port = 3000;

// The provided URL (server URL)
const SERVER_URL = "https://sandbox-43190000dd2042dc857ab709648d4448-ethereum-3000.prod-sandbox.chainide.com/";

app.get('/video/:id', async (req, res) => {
    const videoId = req.params.id;
    const videoUrl = `${SERVER_URL}movie/${videoId}`; // Dynamic video URL with the video ID

    try {
        // Fetch the video from the external URL
        const response = await axios.get(videoUrl, { responseType: 'arraybuffer' });

        // Set the appropriate content type (e.g., video/mp4)
        res.set('Content-Type', 'video/mp4');
        res.send(response.data); // Send the video data to the client
    } catch (error) {
        res.status(500).send('Error fetching video');
    }
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
