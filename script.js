const SUPABASE_URL = "https://ridweeccaeasoqjjjminy.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJpZHdlZWNhZWFzb3FqamptaW55Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDE4ODEyNjksImV4cCI6MjA1NzQ1NzI2OX0.78-DPPAEvlg4X_LQFs-AxqMRjycbhIISazwlT-QoABU";
const BUCKET_NAME = "my-files";

// Initialize Supabase client
const supabase = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

let currentAudio = null;
let songs = [];
let songURLs = [];
let recent = [];
let songPLay = 0;

// Function to fetch songs from Supabase Storage
async function getSongsIntoLibrary() {
    let { data, error } = await supabase.storage.from(BUCKET_NAME).list();
    if (error) {
        console.error("Error fetching songs:", error);
        return;
    }

    for (let file of data) {
        if (file.name.endsWith(".mp3")) {
            let songURL = `${SUPABASE_URL}/storage/v1/object/public/${BUCKET_NAME}/${file.name}`;
            let songName = file.name.replace(".mp3", "").replaceAll("%20", " ").replaceAll("%E2%80%99", "'");
            
            songs.push(songName);
            songURLs.push(songURL);
            createList(songName);
        }
    }

    attachEventListeners();
}

// Function to create song list UI
function createList(songName) {
    let library = document.getElementById("libContent");
    library.innerHTML += `
        <div class="list">
            <div class="listImg"><img src="https://imgs.search.brave.com/XrvFKD0jnlh0jz8IpF7JngRez93fNebVbu5IOmKTf4Y/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9jbXMt/ZnltLnMzLm5sLWFt/cy5zY3cuY2xvdWQv/YjdfVDFpOV9YYl9S/Y19DNXMwM2xfVnNf/UzlfM2FjNzI2OGEx/YS5wbmc" alt=""></div>
            <div class="listData">
                <div class="listName">${songName}</div>
            </div>
        </div>`;
}

// Function to attach click listeners to songs
function attachEventListeners() {
    let listItems = document.getElementsByClassName("list");
    for (let i = 0; i < listItems.length; i++) {
        listItems[i].addEventListener("click", function () {
            playSong(i);
        });
    }
}

// Play or pause a song
function playSong(index) {
    if (currentAudio) {
        currentAudio.pause();
        songPLay = 0;
        togglePlayPause(songPLay);
    }

    if (currentAudio && currentAudio.src === songURLs[index]) {
        currentAudio = null;
        songPLay = 0;
        togglePlayPause(songPLay);
    } else {
        currentAudio = new Audio(songURLs[index]);
        currentAudio.play();
        recent.push(index);
        songPLay = 1;
        togglePlayPause(songPLay);
        currentSongListColorChanger(index);
    }
}

// Update play/pause button UI
function togglePlayPause(num) {
    document.querySelector(".playButton").hidden = num === 0;
    document.querySelector(".pauseButton").hidden = num === 1;
}

// Highlight the currently playing song
function currentSongListColorChanger(index) {
    if (recent.length > 1) {
        document.getElementsByClassName("listName")[recent[recent.length - 2]].style.color = "white";
    }
    document.getElementsByClassName("listName")[index].style.color = "#1cbf56";
}

// Event listeners for Play, Next, and Previous buttons
document.querySelector(".play").addEventListener("click", function () {
    if (songPLay === 0 && currentAudio) {
        currentAudio.play();
        songPLay = 1;
        togglePlayPause(songPLay);
    } else if (songPLay === 0 && !currentAudio && songURLs.length > 0) {
        playSong(0);
    } else if (songPLay === 1) {
        currentAudio.pause();
        songPLay = 0;
        togglePlayPause(songPLay);
    }
});

document.querySelector(".next").addEventListener("click", function () {
    if (recent.length === 0 || recent[recent.length - 1] === songs.length - 1) {
        playSong(0);
    } else {
        playSong(recent[recent.length - 1] + 1);
    }
});

document.querySelector(".previous").addEventListener("click", function () {
    if (recent.length === 0 || recent[recent.length - 1] === 0) {
        playSong(songs.length - 1);
    } else {
        playSong(recent[recent.length - 1] - 1);
    }
});

// Initialize the song list
getSongsIntoLibrary();
