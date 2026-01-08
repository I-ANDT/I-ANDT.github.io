const canvas = document.getElementById("compositeCanvas");
const ctx = canvas.getContext("2d");

// Mobile-friendly canvas setup
function setupCanvas() {
    const scale = window.devicePixelRatio || 1;
    canvas.width = 800 * scale;
    canvas.height = 600 * scale;
    canvas.style.width = "800px";   // CSS size
    canvas.style.height = "600px";  // CSS size
    ctx.scale(scale, scale);
}

async function drawComposite(userData) {
    setupCanvas(); 
    
    const background = new Image();
    background.src = "assets/training_center.png"; // your custom bg

    // filter out the background asset
    const layers = userData.assets.filter(asset => asset.name !== "background");

    // load all images
    const images = await Promise.all(layers.map(asset => {
        return new Promise(res => {
            const img = new Image();
            img.crossOrigin = "anonymous"; // avoids CORS if needed
            img.src = asset.image;
            img.onload = () => res(img);
        });
    }));


    // draw background
    await new Promise(res => background.onload = res);
    const scale = window.devicePixelRatio || 1;
    const bg_width = canvas.width / scale;   // logical width
    const bg_height = canvas.height / scale; // logical height
    ctx.drawImage(background, 0, 0, bg_width, bg_height);

    // draw mutants
    const mutantPaths = ["assets/chablis.png"];
    const mutants = await Promise.all(mutantPaths.map(path => {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.src = path; // remove crossOrigin for local files
            img.onload = () => resolve(img);
            img.onerror = (e) => reject(e);
        });
    }));
    mutants.forEach(img => {
        let x;
        do {
            x = Math.random() * 600; // full canvas width
        } while (x >= 200 && x <= 400); // retry if inside forbidden range

        const y = 360;   // fixed y
        const width = 95;
        const height = 150;

        ctx.drawImage(img, x, y, width, height);
    });

    // draw each asset on top
    const avatarWidth = 190;
    const avatarHeight = 300;
    const x = canvas.width / 2 - avatarWidth / 2; // center
    const y = canvas.height - avatarHeight - 50;  // near bottom

    images.forEach(img => {
        ctx.drawImage(img, x, y, avatarWidth, avatarHeight);
    });

}

// Example usage:
async function fetchAndDraw(address) {
    const apiUrl = `https://avatar-artists-guild.web.app/api/mashers/latest?wallet=${address}`;
    const res = await fetch(apiUrl);
    const data = await res.json();
    drawComposite(data);
}

// Example: call after wallet connection
let address = localStorage.getItem("walletAddress");
fetchAndDraw(address);

document.getElementById("downloadBtn").onclick = () => {
    const link = document.createElement("a");
    link.download = "combined.png";
    link.href = canvas.toDataURL();
    link.click();
};
