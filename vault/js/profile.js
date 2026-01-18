/**
 * profile.js 
 * Optimized for asynchronous image loading and canvas rendering
 */

async function drawProfileCard(userData) {
    const canvas = document.getElementById("profileCanvas");
    if (!canvas) {
        console.error("Canvas element not found");
        return;
    }
    const ctx = canvas.getContext("2d");

    console.log("🎨 Initializing Agent Card render...", userData);

    try {
        // 1. Prepare Background and Layers
        const background = new Image();
        background.crossOrigin = "anonymous";
        background.src = "./card.png"; 

        const layers = userData.assets.filter(asset => asset.name !== "background");

        // 2. Load ALL images (Background + Assets) simultaneously
        const [bgImg, ...assetImages] = await Promise.all([
            // Load Background
            new Promise((resolve, reject) => {
                background.onload = () => resolve(background);
                background.onerror = () => reject(new Error("Failed to load background image"));
            }),
            // Load Avatar Layers
            ...layers.map(asset => {
                return new Promise((resolve) => {
                    const img = new Image();
                    img.crossOrigin = "anonymous";
                    img.src = asset.image;
                    img.onload = () => resolve(img);
                    img.onerror = () => {
                        console.warn(`Failed to load layer: ${asset.name}`);
                        resolve(null); // Resolve null so Promise.all doesn't fail
                    };
                });
            })
        ]);

        // 3. Clear Canvas before drawing
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // 4. Draw Background
        ctx.drawImage(bgImg, 0, 0, canvas.width, canvas.height);

        // 5. Draw Avatar Layers (filtered for any nulls)
        const avatarWidth = 190;
        const avatarHeight = 300;
        const x = canvas.width / 4 - avatarWidth / 2;
        const y = canvas.height / 2 - avatarHeight / 2;

        assetImages.forEach(img => {
            if (img) ctx.drawImage(img, x, y, avatarWidth, avatarHeight);
        });

        // 6. Draw Text Overlay
        ctx.fillStyle = "#00FFEE"; 
        ctx.font = "bold 30px Arial";
        ctx.textAlign = "center";
        ctx.fillText(`ID Card`, canvas.width / 2, canvas.height / 2 - avatarHeight / 2);

        ctx.textAlign = "left";
        ctx.font = "bold 25px Arial";
        const textX = canvas.width - avatarWidth - 200;
        const startY = canvas.height / 2 - avatarHeight / 4;

        ctx.fillText(`Name: Agent Ⅹ`, textX, startY);
        ctx.fillText(`ID: ${userData.id || "0000"}`, textX, startY + 30);
        ctx.fillText(`Status: Field Operative`, textX, startY + 60);

        // Calculate Rank from localStorage
        const dbcAccess = JSON.parse(localStorage.getItem("dbc_access"));
        let rank = "Recruit";
        if (dbcAccess) {
            const count = dbcAccess.count;
            if (count >= 5) rank = "Elite Operative";
            else if (count >= 2) rank = "Field Agent";
            else if (count >= 1) rank = "Junior Agent";
        }
        ctx.fillText(`Rank: ${rank}`, textX, startY + 90);

        const expiryDate = userData.expiry || "12/31/2046";
        ctx.fillText(`Expiry: ${expiryDate}`, textX, startY + 120);

        ctx.font = "italic 20px Arial";
        ctx.fillStyle = "#FF00FF";
        ctx.fillText("Department of Biohazard Control", canvas.width / 3, canvas.height - 70);

        console.log("✅ Card rendered successfully.");

    } catch (error) {
        console.error("❌ Rendering error:", error);
    }
}

// Global scope export
window.drawProfileCard = drawProfileCard;

// Handle Download Button
window.addEventListener("DOMContentLoaded", () => {
    const downloadBtn = document.getElementById("downloadProfileBtn");
    if (downloadBtn) {
        downloadBtn.onclick = () => {
            const canvas = document.getElementById("profileCanvas");
            const link = document.createElement("a");
            link.download = "agent_card.png";
            link.href = canvas.toDataURL("image/png");
            link.click();
        };
    }
});