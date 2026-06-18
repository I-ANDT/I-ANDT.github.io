import { SCORE_MAP } from "../../config/config.js";

async function drawProfileCard(userData = {}, dbcAccess = {}) {
  const avatarImages = await loadAvatarImages(userData);
  drawClearanceCard(userData, dbcAccess, avatarImages);
}

async function loadAvatarImages(userData) {
  const layers = Array.isArray(userData?.assets)
    ? userData.assets.filter(asset => asset.name !== "background")
    : [];

  return Promise.all(layers.map(asset => new Promise(resolve => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = asset.image;
    img.onload = () => resolve(img);
    img.onerror = () => {
      console.warn(`Failed to load layer: ${asset.name}`);
      resolve(null);
    };
  }))).then(images => images.filter(Boolean));
}

function getRank(levelScore = 0) {
  const maxPossibleScore = Object.values(SCORE_MAP).reduce((sum, val) => sum + val, 0) + 20;
  const completionPercentage = (levelScore / maxPossibleScore) * 100;

  if (completionPercentage >= 95) return { label: "LEVEL_10 [OVERSEER]", color: "#FF0055", level: 10, highRank: true };
  if (completionPercentage >= 80) return { label: "LEVEL_9 [MASTER_STRATEGIST]", color: "#FF5500", level: 9, highRank: true };
  if (completionPercentage >= 65) return { label: "LEVEL_8 [COMMANDER]", color: "#FFAA00", level: 8, highRank: true };
  if (completionPercentage >= 50) return { label: "LEVEL_7 [TACTICAL_LEAD]", color: "#7000FF", level: 7, highRank: false };
  if (completionPercentage >= 35) return { label: "LEVEL_6 [ELITE_OPERATIVE]", color: "#d3f06d", level: 6, highRank: false };
  if (completionPercentage >= 25) return { label: "LEVEL_5 [VETERAN_AGENT]", color: "#FF00FF", level: 5, highRank: false };
  if (completionPercentage >= 15) return { label: "LEVEL_4 [SENIOR_AGENT]", color: "#00AAFF", level: 4, highRank: false };
  if (completionPercentage >= 10) return { label: "LEVEL_3 [FIELD_AGENT]", color: "#00FF88", level: 3, highRank: false };
  if (completionPercentage >= 5) return { label: "LEVEL_2 [JUNIOR_AGENT]", color: "#00FFEE", level: 2, highRank: false };
  if (levelScore >= 1) return { label: "LEVEL_1 [TRAINEE]", color: "#00FFEE", level: 1, highRank: false };
  return { label: "LEVEL_0 [RECRUIT]", color: "#00FFEE", level: 0, highRank: false };
}

function drawClearanceCard(userData, dbcAccess, avatarImages) {
  const canvas = document.getElementById("profileCanvas");
  const finalImg = document.getElementById("finalAgentCard");
  if (!canvas || !finalImg) return;

  const ctx = canvas.getContext("2d");
  const rank = getRank(dbcAccess.levelScore || 0);
  const agentName = dbcAccess.agentName || localStorage.getItem("agentName") || "UNKNOWN";

  const background = new Image();
  background.crossOrigin = "anonymous";
  background.onload = () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(background, 0, 0, canvas.width, canvas.height);

    drawAvatar(ctx, avatarImages, 88, 126, 190, 300);

    const textX = canvas.width - 410;
    const startY = 214;
    const lineHeight = 70;

    ctx.textAlign = "center";
    ctx.font = "900 35px 'Courier New', monospace";
    ctx.shadowColor = "rgba(0, 255, 238, 0.5)";
    ctx.shadowBlur = 10;
    ctx.fillStyle = "#00FFEE";
    ctx.fillText(">> D.B.C. CLEARANCE CARD <<", canvas.width / 2, 126);
    ctx.shadowBlur = 0;
    ctx.textAlign = "left";

    drawDataLine(ctx, "OPERATIVE IDENTIFIER", `AGENT ${agentName.toUpperCase()}`, textX, startY);
    drawDataLine(ctx, "STATUS", "ACTIVE", textX, startY + lineHeight);
    drawDataLine(ctx, "CLEARANCE LEVEL", rank.label, textX, startY + (lineHeight * 2), rank.color);
    drawDataLine(ctx, "DECOMMISSION DATE", userData?.expiry || "12.31.2046", textX, startY + (lineHeight * 3));

    ctx.font = "16px 'Courier New', monospace";
    ctx.fillStyle = "#FF00FF";
    ctx.textAlign = "center";
    ctx.fillText("PROTOCOL: NEURAL-LINK ENFORCED // SECURED ACCESS ONLY", canvas.width / 2, canvas.height - 70);

    if (rank.highRank) {
      drawPremiumStamp(ctx, canvas, rank);
    }

    finalImg.src = canvas.toDataURL("image/png");
  };
  background.onerror = () => {
    drawFallbackClearanceCard(ctx, canvas, finalImg, dbcAccess, avatarImages);
  };
  background.src = "./card.png";
}

function drawFallbackClearanceCard(ctx, canvas, finalImg, dbcAccess, avatarImages) {
  const rank = getRank(dbcAccess.levelScore || 0);
  const agentName = dbcAccess.agentName || "UNKNOWN";

  ctx.fillStyle = "#071019";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.strokeStyle = "#00FFEE";
  ctx.lineWidth = 6;
  ctx.strokeRect(14, 14, canvas.width - 28, canvas.height - 28);
  drawAvatar(ctx, avatarImages, 88, 126, 190, 300);
  drawDataLine(ctx, "OPERATIVE IDENTIFIER", `AGENT ${agentName.toUpperCase()}`, 330, 210);
  drawDataLine(ctx, "CLEARANCE LEVEL", rank.label, 330, 350, rank.color);
  finalImg.src = canvas.toDataURL("image/png");
}

function drawAvatar(ctx, avatarImages, x, y, width, height) {
  if (avatarImages.length === 0) {
    ctx.fillStyle = "rgba(85, 247, 255, 0.14)";
    ctx.fillRect(x, y, width, height);
    ctx.strokeStyle = "#55F7FF";
    ctx.strokeRect(x, y, width, height);
    ctx.fillStyle = "#55F7FF";
    ctx.font = "bold 22px 'Courier New', monospace";
    ctx.textAlign = "center";
    ctx.fillText("NO AVATAR", x + width / 2, y + height / 2);
    return;
  }

  avatarImages.forEach(img => ctx.drawImage(img, x, y, width, height));
}

function drawDataLine(ctx, label, value, x, y, color = "#00FFEE") {
  ctx.font = "bold 18px 'Courier New', monospace";
  ctx.fillStyle = "rgba(0, 255, 238, 0.5)";
  ctx.fillText(label, x, y);
  ctx.font = "bold 22px 'Courier New', monospace";
  ctx.fillStyle = color;
  ctx.fillText(value, x, y + 20);
}

function drawPremiumStamp(ctx, canvas, rank) {
  ctx.lineWidth = 8;
  ctx.strokeStyle = rank.color;
  ctx.shadowColor = rank.color;
  ctx.shadowBlur = 25;
  ctx.strokeRect(4, 4, canvas.width - 8, canvas.height - 8);
  ctx.shadowBlur = 0;

  ctx.save();
  ctx.translate(canvas.width - 130, 95);
  ctx.rotate((15 * Math.PI) / 180);
  ctx.lineWidth = 3;
  ctx.strokeStyle = rank.color;
  ctx.fillStyle = "rgba(0, 0, 0, 0.6)";
  ctx.fillRect(-85, -20, 170, 40);
  ctx.strokeRect(-85, -20, 170, 40);
  ctx.font = "900 14px 'Courier New', monospace";
  ctx.fillStyle = rank.color;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(rank.level === 10 ? "* OVERSEER *" : "* VIP *", 0, 2);
  ctx.restore();
}

window.drawProfileCard = drawProfileCard;
