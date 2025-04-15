const express = require('express');
const axios = require('axios');
const app = express();
const port = 3000;

// Your provided server URL for the video
const SERVER_URL = "https://sandbox-43190000dd2042dc857ab709648d4448-ethereum-3000.prod-sandbox.chainide.com/";

// Endpoint to fetch the video based on the ID
app.get('/video/:id', async (req, res) => {
    const videoId = req.params.id;
    const videoUrl = `${SERVER_URL}movie/${videoId}`; // Construct video URL using the provided base URL

    try {
        // Fetch the video from the provided URL
        const response = await axios.get(videoUrl, { responseType: 'arraybuffer' });

        // Set the appropriate content type for the video (adjust the MIME type if needed)
        res.set('Content-Type', 'video/mp4');  // You can change this based on the video type
        res.send(response.data);  // Send the video data to the client
    } catch (error) {
        res.status(500).send('Error fetching video');
    }
});

// Start the server
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
