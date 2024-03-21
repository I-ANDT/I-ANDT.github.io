if (document.getElementById('my-work-link')) {
    document.getElementById('my-work-link').addEventListener('click', () => {
        document.getElementById('my-work-section').scrollIntoView({behavior: "smooth"})
    })
}


document.getElementById('playButton').addEventListener('click', function () {
    var audio = document.getElementById('audioPlayer');
    if (audio.paused) {
        audio.play();
        document.getElementById('playButton').innerText = 'Pause Audio';
    } else {
        audio.pause();
        audio.currentTime = 0; // Reset audio to beginning
        document.getElementById('playButton').innerText = 'Play Audio';
    }
});

