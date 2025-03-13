function createList(listName, Author = "Untitled", image = "https://imgs.search.brave.com/XrvFKD0jnlh0jz8IpF7JngRez93fNebVbu5IOmKTf4Y/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9jbXMt/ZnltLnMzLm5sLWFt/cy5zY3cuY2xvdWQv/YjdfVDFpOV9YYl9S/Y19DNXMwM2xfVnNf/UzlfM2FjNzI2OGEx/YS5wbmc") {
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

let currentAudio = null;
let songs = [];
let newAnchor = [];
let recent = [];
let songPLay = 0;

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
            }
            if (currentAudio && currentAudio.src === newAnchor[i].href) {
                currentAudio = null;
                songPLay = 0;
                togglePlayPause(songPLay);
            }
            else{
                currentAudio = new Audio(newAnchor[i].href);
                currentAudio.play();
                recent.push(i);  // Push the index of the song to recent
                songPLay = 1;
                togglePlayPause(songPLay);
                currentSongListColorChanger(i);
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
    }
    else if(songPLay === 0 && !currentAudio ){
        currentAudio = new Audio(newAnchor[0].href);
        currentAudio.play();
        songPLay = 1;
        togglePlayPause(songPLay);
        recent.push(0);
        currentSongListColorChanger(0);
    }
    else if(songPLay ===1){
        currentAudio.pause();
        songPLay =0;
        togglePlayPause(songPLay);

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
    }
})

let prevTimerCounter = 0;
let prevTimer;

function refreshCounter() {
    clearTimeout(prevTimer);
    prevTimer = setTimeout(() => {
        prevTimerCounter = 0;
    }, 5000);
}

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
    } else {
        currentAudio.pause();
        let prevIndex = recent[recent.length - 1] - 1;
        currentAudio = new Audio(newAnchor[prevIndex].href);
        currentAudio.play();
        recent.push(prevIndex);
        songPLay = 1;
        togglePlayPause(songPLay);
        currentSongListColorChanger(prevIndex);
    }})

getSongsIntoLibrary("http://127.0.0.1:3000/spotify/songs/")
