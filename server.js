const express = require('express');
const axios = require('axios');
const app = express();
const port = 3000;

// External URL for the video
const BASE_URL = "https://sandbox-43190000dd2042dc857ab709648d4448-ethereum-3000.prod-sandbox.chainide.com/watch";

// Proxy endpoint to fetch the video
app.get('/video/:id', async (req, res) => {
    const videoId = req.params.id;
    const videoUrl = `${BASE_URL}/${videoId}`;

    try {
        // Fetch the video stream from the external URL
        const response = await axios.get(videoUrl, { responseType: 'stream' });

        // Set the content type for video (adjust MIME type if needed)
        res.setHeader('Content-Type', 'video/mp4');  // Assuming video is MP4 format

        // Stream the video to the client
        response.data.pipe(res);  // Send the video stream to the browser
    } catch (error) {
        res.status(500).send('Error fetching video');
    }
});

// Serve static files (like HTML, CSS, JS)
app.use(express.static('public'));

// Start the server
app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});
