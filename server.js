const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = 3000;

// Enable CORS
app.use(cors());

// Serve static files from the 'public' folder
app.use(express.static("public"));

// Serve songs from the 'songs' directory
app.use("/songs", express.static(path.join(__dirname, "songs")));

// API to get all song files from 'songs' directory
app.get("/api/songs", (req, res) => {
    const songsDir = path.join(__dirname, "songs");
    fs.readdir(songsDir, (err, files) => {
        if (err) {
            return res.status(500).json({ error: "Failed to list songs" });
        }
        const songFiles = files.filter(file => file.endsWith(".mp3"));
        res.json(songFiles.map(file => `/songs/${file}`));
    });
});

// Start the server
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server is running at http://localhost:${PORT}`);
});
