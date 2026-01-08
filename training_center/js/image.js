const canvas = document.getElementById("compositeCanvas");
const ctx = canvas.getContext("2d");

async function drawComposite(userData) {
    
    const background = new Image();
    background.src = "./assets/training_center.png"; // your custom bg

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
    ctx.drawImage(background, 0, 0, canvas.width, canvas.height);

    // draw mutants
    const mutantPaths = ["../cards/chablis.png", "../cards/malbec.png"];
    const mutants = await Promise.all(mutantPaths.map(path => {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.src = path; // remove crossOrigin for local files
            img.onload = () => resolve(img);
            img.onerror = () => reject(new Error(`Failed to load image: ${path}`));
        });
    }));
    mutants.forEach(img => {
        const width = 45;
        const height  = 75;
        const x = Math.random() * (canvas.width - width - 50) + 50;
        const y = canvas.height - height - 45;
        ctx.drawImage(img, x, y, width, height);
    });

    // draw each asset on top
    const avatarWidth = 95;
    const avatarHeight = 150;
    const x = canvas.width / 10; // center
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
