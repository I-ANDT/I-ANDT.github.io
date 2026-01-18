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

        // 6. Draw Text Overlay (Cyberpunk Styled)
        const textX = canvas.width - avatarWidth - 220;
        const startY = canvas.height / 2 - avatarHeight / 4;
        const lineHeight = 35;

        // Helper function for "Label: Value" style
        const drawDataLine = (label, value, x, y, color = "#00FFEE") => {
            ctx.font = "bold 18px 'Courier New', monospace";
            ctx.fillStyle = "rgba(0, 255, 238, 0.5)"; // Dimmer label
            ctx.fillText(label, x, y);

            ctx.font = "bold 22px 'Courier New', monospace";
            ctx.fillStyle = color; // Bright value
            ctx.fillText(value, x, y + 20);
        };

        // --- DRAWING THE DATA ---

        // Main Title
        ctx.textAlign = "center";
        // Use a larger size (e.g., 42px) and "black" or "900" weight if the font supports it
        ctx.font = "900 35px 'Courier New', monospace";

        // Create a slight "glow" effect for the title
        ctx.shadowColor = "rgba(0, 255, 238, 0.5)";
        ctx.shadowBlur = 10;
        ctx.fillStyle = "#00FFEE";
        ctx.fillText(">> D.B.C. CLEARANCE CARD <<", canvas.width / 2, canvas.height / 2 - avatarHeight / 2);
        // Reset shadow so it doesn't affect the rest of the text
        ctx.shadowBlur = 0;
        ctx.textAlign = "left";

        // 1. Subject Name
        drawDataLine("OPERATIVE IDENTIFIER", `AGENT_Ⅹ [${userData.id || "0000"}]`, textX, startY);

        // 2. Status (Dynamic coloring)
        drawDataLine("STATUS", "ACTIVE", textX, startY + (lineHeight * 2));

        // 3. Clearance / Rank Logic
        const dbcAccess = JSON.parse(localStorage.getItem("dbc_access"));
        let rank = "LEVEL_0 [RECRUIT]";
        let rankColor = "#00FFEE";

        if (dbcAccess) {
            const count = dbcAccess.count;
            if (count >= 10) {
                rank = "LEVEL_5 [ELITE_OPERATIVE]";
                rankColor = "#FFAA00"; // Goldish for elite
            } else if (count >= 6) {
                rank = "LEVEL_4 [SENIOR_AGENT]";
                rankColor = "#FF00FF"; // Neon Pink for high rank
            } else if (count >= 4) {
                rank = "LEVEL_3 [FIELD_AGENT]";
                rankColor = "#00AAFF"; // Bright Blue for mid-high
            } else if (count >= 2) {
                rank = "LEVEL_2 [JUNIOR_AGENT]";
                rankColor = "#00FF88"; // Bright Green for mid-level
            } else if (count >= 1) {
                rank = "LEVEL_1 [TRAINEE]";
            }
        }
        drawDataLine("CLEARANCE LEVEL", rank, textX, startY + (lineHeight * 4), rankColor);

        // 4. Decommission Date
        drawDataLine("DECOMMISSION DATE", userData.expiry || "12.31.2046", textX, startY + (lineHeight * 6));

        // Footer - Department Branding
        ctx.font = "16px 'Courier New', monospace";
        ctx.fillStyle = "#FF00FF";
        ctx.textAlign = "center";
        ctx.fillText("PROTOCOL: NEURAL-LINK ENFORCED // SECURED ACCESS ONLY", canvas.width / 2, canvas.height - 70);

        console.log("✅ Card rendered successfully.");

    } catch (error) {
        console.error("❌ Rendering error:", error);
    }
}

// Global scope export
window.drawProfileCard = drawProfileCard;

// Handle Download Button for PC and Mobile
window.addEventListener("DOMContentLoaded", () => {
    const downloadBtn = document.getElementById("downloadProfileBtn");

    if (downloadBtn) {
        downloadBtn.onclick = () => {
            const canvas = document.getElementById("profileCanvas");

            // 1. Convert canvas to a Blob (Better for mobile support)
            canvas.toBlob((blob) => {
                if (!blob) {
                    console.error("Failed to create image blob");
                    return;
                }

                // 2. Create a temporary URL for the file
                const url = URL.createObjectURL(blob);
                const link = document.createElement("a");

                link.download = "agent_card.png";
                link.href = url;

                // 3. Append to body (Required for some mobile browsers)
                document.body.appendChild(link);
                link.click();

                // 4. Cleanup
                setTimeout(() => {
                    document.body.removeChild(link);
                    URL.revokeObjectURL(url);
                }, 100);
            }, "image/png");
        };
    }
});