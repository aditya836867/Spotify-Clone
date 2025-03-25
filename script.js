let listImgSrc = "https://imgs.search.brave.com/XrvFKD0jnlh0jz8IpF7JngRez93fNebVbu5IOmKTf4Y/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9jbXMt/ZnltLnMzLm5sLWFt/cy5zY3cuY2xvdWQv/YjdfVDFpOV9YYl9S/Y19DNXMwM2xfVnNf/UzlfM2FjNzI2OGEx/YS5wbmc"
let currentAudio = null;
let songs = [];
let newAnchor = [];
let recent = [];
let songPLay = 0;

// setting default progress of the seekbar to be zero
document.getElementById("seekBar").style.setProperty("--progress", `${0}%`);

function formatTime(currentTime) {
    let minutes = Math.floor(currentTime / 60);
    let seconds = Math.floor(currentTime % 60);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
}

function createList(listName, Author = "Untitled", image = listImgSrc) {
    let library = document.getElementById("libContent");
    library.innerHTML +=
    `
    <div class="list">
    <div class="listImg"><img src="${image}" alt=""></div>
    <div class="listData">
        <div class="listName">${listName}</div>
        <div class="author">
            <span>Artist • </span>
            <span class="author">${Author}</span>
        </div>
    </div>
    </div>
    `

}

function timeStampUpdater(audio){
    let duration = document.getElementById("endTime");
    let currentTime = document.getElementById("currentTime");
    audio.addEventListener("timeupdate", function(){
        duration.innerHTML = `${formatTime(audio.duration)}`;
    })
    audio.addEventListener("timeupdate", function(){
        currentTime.innerHTML = `${formatTime(audio.currentTime)}`;
    })
}

function createNameCard(songName,imgSrc = listImgSrc){
    let nameBox = document.getElementsByClassName("nameBox")[0];
    nameBox.innerHTML = songName;
    let frontImage = document.getElementsByClassName("frontImage")[0].children[0];
    frontImage.src = imgSrc;
}

function seekBarUpdate(audio) {
    const seekBar = document.getElementById("seekBar");

    // Update seek bar max value when metadata is loaded
    audio.addEventListener("loadedmetadata", () => {
        seekBar.max = audio.duration;
    });

    // Update seek bar value and CSS variable as the audio plays
    const timeUpdateListener = () => {
        seekBar.value = audio.currentTime;
        const progress = (audio.currentTime / audio.duration) * 100;
        seekBar.style.setProperty("--progress", `${progress}%`);
    };
    audio.addEventListener("timeupdate", timeUpdateListener);

    // Seek when user interacts with the seek bar
    const inputListener = () => {
        const seekTime = seekBar.value;
        audio.currentTime = seekTime;
    };
    seekBar.addEventListener("input", inputListener);

    // Cleanup listeners when audio is paused or replaced
    audio.addEventListener("pause", () => {
        audio.removeEventListener("timeupdate", timeUpdateListener);
        seekBar.removeEventListener("input", inputListener);
    });
}

function togglePlayPause(num){
    if(num === 0){
        document.querySelector(".playButton").setAttribute("hidden", "true");
        document.querySelector(".pauseButton").removeAttribute("hidden");
    }
    else if(num === 1){
        document.querySelector(".pauseButton").setAttribute("hidden", "true");
        document.querySelector(".playButton").removeAttribute("hidden");
    }
}

function currentSongListColorChanger(num){
    if(recent.length > 1){
        document.getElementsByClassName("libContent")[0].children[recent[recent.length - 2]].querySelector(".listName").style.color = "white";
    }
    document.getElementsByClassName("libContent")[0].children[num].querySelector(".listName").style.color = "#1cbf56";
}

togglePlayPause(songPLay); // To initialize the the play Pause Button Once

async function getSongsIntoLibrary(folder) {
    let a = await fetch(folder);
    let res = await a.text();
    let div = document.createElement('div');
    div.innerHTML = res;
    let anchors = div.getElementsByTagName("a");

    for (let i = 0; i < anchors.length; i++) {
        let a = anchors[i];
        if (a.href.endsWith(".mp3")) {
            let songName = a.href.split('/').pop().replace(".mp3", "").replaceAll("%20", " ").replaceAll("%E2%80%99", "'");
            songs.push(songName); // Push Song name to The songs
            newAnchor.push(a);  // Push Useful anchor to newAnchor
            createList(songName); // Create List in Library
        }
    }

    for(let i = 0; i < songs.length; i++) {
        let listItem = document.getElementById("libContent").children[i];
        listItem.addEventListener("click", function(){
            if (currentAudio){
                currentAudio.pause();
                songPLay = 0;
                togglePlayPause(songPLay);
                seekBarUpdate(currentAudio);
                timeStampUpdater(currentAudio);
            }
            if (currentAudio && currentAudio.src === newAnchor[i].href) {
                currentAudio = null;
                songPLay = 0;
                togglePlayPause(songPLay);
                seekBarUpdate(currentAudio);
                timeStampUpdater(currentAudio);
            }
            else{
                currentAudio = new Audio(newAnchor[i].href);
                currentAudio.play();
                recent.push(i);  // Push the index of the song to recent
                songPLay = 1;
                togglePlayPause(songPLay);
                currentSongListColorChanger(i);
                createNameCard(songs[i])
                seekBarUpdate(currentAudio);
                timeStampUpdater(currentAudio);
            }

        });
    }

}

let playBox = document.getElementsByClassName("play")[0];
playBox.addEventListener("click",function(){
    if((songPLay === 0) && currentAudio) {
        currentAudio.play();
        songPLay =1;
        togglePlayPause(songPLay);
        createNameCard(songs[0])
        seekBarUpdate(currentAudio);
        timeStampUpdater(currentAudio);
    }
    else if(songPLay === 0 && !currentAudio ){
        currentAudio = new Audio(newAnchor[0].href);
        currentAudio.play();
        songPLay = 1;
        togglePlayPause(songPLay);
        recent.push(0);
        currentSongListColorChanger(0);
        createNameCard(songs[0])
        seekBarUpdate(currentAudio);
        timeStampUpdater(currentAudio);
    }
    else if(songPLay ===1){
        currentAudio.pause();
        songPLay =0;
        togglePlayPause(songPLay);
        seekBarUpdate(currentAudio);
        timeStampUpdater(currentAudio);

    }
} )

let next = document.getElementsByClassName("next")[0];
next.addEventListener("click",function(){
    if(recent.length === 0 || recent[recent.length -1] === songs.length-1){
        if (currentAudio) {
            currentAudio.pause();
        }
        currentAudio = new Audio(newAnchor[0].href);
        currentAudio.play();
        recent.push(0);
        songPLay = 1;
        togglePlayPause(songPLay);
        currentSongListColorChanger(0);
        createNameCard(songs[0])
        seekBarUpdate(currentAudio);
        timeStampUpdater(currentAudio);
    }
    else{
        currentAudio.pause();
        let nextIndex = recent[recent.length - 1] + 1;
        currentAudio = new Audio(newAnchor[nextIndex].href);
        currentAudio.play();
        recent.push(nextIndex);
        songPLay = 1;
        togglePlayPause(songPLay);
        currentSongListColorChanger(nextIndex);
        createNameCard(songs[nextIndex])
        seekBarUpdate(currentAudio);
        timeStampUpdater(currentAudio);
    }
})

let previous = document.getElementsByClassName("previous")[0];
previous.addEventListener("click", function() {
    if (recent.length === 0 || recent[recent.length - 1] === 0) {
        if (currentAudio) {
            currentAudio.pause();
        }
        currentAudio = new Audio(newAnchor[songs.length - 1].href);
        currentAudio.play();
        recent.push(songs.length - 1);
        songPLay = 1;
        togglePlayPause(songPLay);
        currentSongListColorChanger(songs.length - 1);
        createNameCard(songs[songs.length - 1])
        seekBarUpdate(currentAudio);
        timeStampUpdater(currentAudio);
    } else {
        currentAudio.pause();
        let prevIndex = recent[recent.length - 1] - 1;
        currentAudio = new Audio(newAnchor[prevIndex].href);
        currentAudio.play();
        recent.push(prevIndex);
        songPLay = 1;
        togglePlayPause(songPLay);
        currentSongListColorChanger(prevIndex);
        createNameCard(songs[prevIndex])
        seekBarUpdate(currentAudio);
        timeStampUpdater(currentAudio);
    }})

//   Defining the event listener to the namecard
let nameCard = document.getElementsByClassName("nameCard")[0];
    nameCard.addEventListener("click",function() {
        if(currentAudio){
            if(songPLay === 0){
                currentAudio.play();
                songPLay =1;
                togglePlayPause(songPLay);
            }
            else if(songPLay ===1){
                currentAudio.play();
                songPLay =0;
                togglePlayPause(songPLay);
                seekBarUpdate(currentAudio);
                timeStampUpdater(currentAudio);
            }
        }
        else{
            currentAudio = new Audio(newAnchor[0].href);
            currentAudio.play();
            songPLay = 1;
            togglePlayPause(songPLay);
            createNameCard(songs[0])
            currentSongListColorChanger(0);
            seekBarUpdate(currentAudio);
            timeStampUpdater(currentAudio);
        }
    })
    
getSongsIntoLibrary("http://127.0.0.1:3000/spotify/songs/");
