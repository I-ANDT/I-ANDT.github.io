

// Calculate maximum total score dynamically based on active collection size

async function drawProfileCard(userData) {
  const SCORE_MAP = {
    "cyber bull": 3, "schlaflos": 1, "Crocodyne": 2, "KATZ!": 1, "Choris": 3,
    "#001": 5, "snuggin": 1, "#002": 2, "L46": 1, "K46": 1, "Venom": 1,
    "#003": 1, "Valentine": 1, "ape": 1, "tuesday": 1, "sealpollo": 1,
    "hellfire": 1, "angel": 1, "momoka": 1, "downvote": 1, "wen": 1,
    "kaito": 1, "cruise": 1, "goldstruck": 2, "Naga Moto": 2, "Listen": 1
  };
  // Calculate maximum total score dynamically based on active collection size
  const MAX_POSSIBLE_SCORE = Object.values(SCORE_MAP).reduce((sum, val) => sum + val, 0) + 30;

  const canvas = document.getElementById("profileCanvas");
  const finalImg = document.getElementById("finalAgentCard");

  if (!canvas || !finalImg) {
    console.error("Canvas element not found");
    return;
  }

  const ctx = canvas.getContext("2d");
  console.log("Initializing Agent Card render...", userData);

  try {
    const background = new Image();
    background.crossOrigin = "anonymous";
    background.src = "./card.png";

    const layers = Array.isArray(userData?.assets)
      ? userData.assets.filter(asset => asset.name !== "background")
      : [];

    const [bgImg, ...assetImages] = await Promise.all([
      new Promise((resolve, reject) => {
        background.onload = () => resolve(background);
        background.onerror = () => reject(new Error("Failed to load background image"));
      }),
      ...layers.map(asset => new Promise(resolve => {
        const img = new Image();
        img.crossOrigin = "anonymous";
        img.src = asset.image;
        img.onload = () => resolve(img);
        img.onerror = () => {
          console.warn(`Failed to load layer: ${asset.name}`);
          resolve(null);
        };
      }))
    ]);

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(bgImg, 0, 0, canvas.width, canvas.height);

    const avatarWidth = 190;
    const avatarHeight = 300;
    const x = canvas.width / 4 - avatarWidth / 2;
    const y = canvas.height / 2 - avatarHeight / 2;

    assetImages.forEach(img => {
      if (img) ctx.drawImage(img, x, y, avatarWidth, avatarHeight);
    });

    const textX = canvas.width - avatarWidth - 220;
    const startY = canvas.height / 2 - avatarHeight / 4;
    const lineHeight = 35;

    const drawDataLine = (label, value, lineX, lineY, color = "#00FFEE") => {
      ctx.font = "bold 18px 'Courier New', monospace";
      ctx.fillStyle = "rgba(0, 255, 238, 0.5)";
      ctx.fillText(label, lineX, lineY);

      ctx.font = "bold 22px 'Courier New', monospace";
      ctx.fillStyle = color;
      ctx.fillText(value, lineX, lineY + 20);
    };

    ctx.textAlign = "center";
    ctx.font = "900 35px 'Courier New', monospace";
    ctx.shadowColor = "rgba(0, 255, 238, 0.5)";
    ctx.shadowBlur = 10;
    ctx.fillStyle = "#00FFEE";
    ctx.fillText(">> D.B.C. CLEARANCE CARD <<", canvas.width / 2, canvas.height / 2 - avatarHeight / 2);
    ctx.shadowBlur = 0;
    ctx.textAlign = "left";

    drawDataLine("OPERATIVE IDENTIFIER", `AGENT_X [${userData?.id || "0000"}]`, textX, startY);
    drawDataLine("STATUS", "ACTIVE", textX, startY + (lineHeight * 2));

    // --- DYNAMIC RANK LOGIC ---
    const dbcAccess = JSON.parse(localStorage.getItem("dbc_access"));
    let rank = "LEVEL_0 [RECRUIT]";
    let rankColor = "#00FFEE";
    let isHighRank = false;
    let numericLevel = 0;

    if (dbcAccess) {
      const userScore = dbcAccess.levelScore || 0;
      // Calculate percentage dynamically based on the current size of SCORE_MAP
      const completionPercentage = (userScore / MAX_POSSIBLE_SCORE) * 100;

      if (completionPercentage >= 95) {
        rank = "LEVEL_10 [OVERSEER]";
        rankColor = "#FF0055";
        numericLevel = 10;
        isHighRank = true;
      } else if (completionPercentage >= 80) {
        rank = "LEVEL_9 [MASTER_STRATEGIST]";
        rankColor = "#FF5500";
        numericLevel = 9;
        isHighRank = true;
      } else if (completionPercentage >= 65) {
        rank = "LEVEL_8 [COMMANDER]";
        rankColor = "#FFAA00";
        numericLevel = 8;
        isHighRank = true;
      } else if (completionPercentage >= 50) {
        rank = "LEVEL_7 [TACTICAL_LEAD]";
        rankColor = "#7000FF";
        numericLevel = 7;
      } else if (completionPercentage >= 35) {
        rank = "LEVEL_6 [ELITE_OPERATIVE]";
        rankColor = "#C0C0C0";
        numericLevel = 6;
      } else if (completionPercentage >= 25) {
        rank = "LEVEL_5 [VETERAN_AGENT]";
        rankColor = "#FF00FF";
        numericLevel = 5;
      } else if (completionPercentage >= 15) {
        rank = "LEVEL_4 [SENIOR_AGENT]";
        rankColor = "#00AAFF";
        numericLevel = 4;
      } else if (completionPercentage >= 10) {
        rank = "LEVEL_3 [FIELD_AGENT]";
        rankColor = "#00FF88";
        numericLevel = 3;
      } else if (completionPercentage >= 5) {
        rank = "LEVEL_2 [JUNIOR_AGENT]";
        rankColor = "#00FFEE";
        numericLevel = 2;
      } else if (userScore >= 1) {
        rank = "LEVEL_1 [TRAINEE]";
        rankColor = "#00FFEE";
        numericLevel = 1;
      }
    }

    drawDataLine("CLEARANCE LEVEL", rank, textX, startY + (lineHeight * 4), rankColor);
    drawDataLine("DECOMMISSION DATE", userData?.expiry || "12.31.2046", textX, startY + (lineHeight * 6));

    ctx.font = "16px 'Courier New', monospace";
    ctx.fillStyle = "#FF00FF";
    ctx.textAlign = "center";
    ctx.fillText("PROTOCOL: NEURAL-LINK ENFORCED // SECURED ACCESS ONLY", canvas.width / 2, canvas.height - 70);

    // --- VISUAL PREMIUM EFFECT HANDLERS ---
    if (isHighRank) {
      // 1. Outer Holographic Glowing Frame Border
      ctx.lineWidth = 8;
      ctx.strokeStyle = rankColor;
      ctx.shadowColor = rankColor;
      ctx.shadowBlur = 25;
      ctx.strokeRect(4, 4, canvas.width - 8, canvas.height - 8);
      ctx.shadowBlur = 0; // Reset canvas glow

      // 2. Cyber Sparkles / Stars Matrix Overlay
      ctx.fillStyle = "#FFFFFF";
      const sparkleCoordinates = [
        { sx: 40, sy: 60 }, { sx: canvas.width - 50, sy: 80 },
        { sx: 70, sy: canvas.height - 120 }, { sx: canvas.width - 120, sy: canvas.height - 150 },
        { sx: canvas.width / 2 + 80, sy: 110 }
      ];

      sparkleCoordinates.forEach(pos => {
        ctx.shadowColor = "#FFFFFF";
        ctx.shadowBlur = 12;
        ctx.beginPath();
        // Draws clean 4-point crosshair stars on canvas
        ctx.moveTo(pos.sx, pos.sy - 8);
        ctx.lineTo(pos.sx, pos.sy + 8);
        ctx.moveTo(pos.sx - 8, pos.sy);
        ctx.lineTo(pos.sx + 8, pos.sy);
        ctx.lineWidth = 2;
        ctx.strokeStyle = "#FFFFFF";
        ctx.stroke();
      });
      ctx.shadowBlur = 0;

      // 3. Diagonal High-Rank Clearance Badge Stamp
      ctx.save();
      ctx.translate(canvas.width - 130, 95);
      ctx.rotate((15 * Math.PI) / 180); // Rotate 15 degrees

      // Stamp Frame Box
      ctx.lineWidth = 3;
      ctx.strokeStyle = rankColor;
      ctx.fillStyle = "rgba(0, 0, 0, 0.6)";
      ctx.fillRect(-85, -20, 170, 40);
      ctx.strokeRect(-85, -20, 170, 40);

      // Stamp Inner Text
      ctx.font = "black 14px 'Courier New', monospace";
      ctx.fillStyle = rankColor;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(numericLevel === 10 ? "★ OVERSEER ★" : "★ PREMIUM ★", 0, 2);
      ctx.restore();
    }

    finalImg.src = canvas.toDataURL("image/png");
    console.log("Card rendered successfully.");
  } catch (error) {
    console.error("Rendering error:", error);
  }
}

window.drawProfileCard = drawProfileCard;