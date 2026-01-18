const canvas = document.getElementById("profileCanvas");
const ctx = canvas.getContext("2d");


async function drawComposite(userData) {

    const background = new Image();
    background.src = "./card.png"; // your custom bg

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

    // draw each asset on top
    const avatarWidth = 190;
    const avatarHeight = 300;
    const x = canvas.width / 4 - avatarWidth / 2; // near left
    const y = canvas.height / 2 - avatarHeight / 2;  // center

    images.forEach(img => {
        ctx.drawImage(img, x, y, avatarWidth, avatarHeight);
    });
    // Add card name
    ctx.fillStyle = "#00FFEE"; // cyberpunk cyan color
    ctx.font = "bold 30px Arial";
    ctx.textAlign = "center";
    ctx.fillText(`ID Card`, canvas.width / 2, canvas.height / 2 - avatarHeight / 2);

    // --- ADD AGENT ID TEXT ---
    ctx.fillStyle = "#00FFEE"; // cyberpunk cyan color
    ctx.font = "bold 25px Arial";
    ctx.textAlign = "left";

    // Agent name
    ctx.fillText(`Name: Agent Ⅹ`, canvas.width - avatarWidth - 200, canvas.height / 2 - avatarHeight / 4);

    // ID
    const badgeNumber = userData.id || "0000";
    ctx.fillText(`ID: ${badgeNumber}`, canvas.width - avatarWidth - 200, canvas.height / 2 - avatarHeight / 4 + 30);

    // Status
    ctx.fillText(`Status: Field Operative`, canvas.width - avatarWidth - 200, canvas.height / 2 - avatarHeight / 4 + 60);

    // Rank
    // 1️⃣ Get the stored info
    const dbcAccess = JSON.parse(localStorage.getItem("dbc_access"));

    // 2️⃣ Determine rank based on NFT count
    let rank = "Recruit"; // default rank
    if (dbcAccess) {
        const count = dbcAccess.count;

        if (count >= 5) rank = "Elite Operative";
        else if (count >= 2) rank = "Field Agent";
        else if (count >= 1) rank = "Junior Agent";
        else rank = "Recruit";
    }
    ctx.fillText(`Rank: ${rank}`, canvas.width - avatarWidth - 200, canvas.height / 2 - avatarHeight / 4 + 90);

    // Expiry
    const expiryDate = userData.expiry || "12/31/2046";
    ctx.fillText(`Expiry: ${expiryDate}`, canvas.width - avatarWidth - 200, canvas.height / 2 - avatarHeight / 4 + 120);

    // Optional: add some stylized footer
    ctx.font = "italic 20px Arial";
    ctx.fillStyle = "#FF00FF";
    ctx.fillText("Department of Biohazard Control", canvas.width / 3, canvas.height - 70);
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

document.getElementById("downloadProfileBtn").onclick = () => {
    const link = document.createElement("a");
    link.download = "profile_card.png";
    link.href = canvas.toDataURL("image/png"); // uses full canvas size
    link.click();
};

