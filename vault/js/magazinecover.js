import { SCORE_MAP } from "../../config/config.js";

const MAGAZINE_HEADLINES = [
  "City Archives Confirm New Collector Class",
  "Underground Markets Track Rare Mutation Surge",
  "DBC Analysts Stunned By Capture Record",
  "Neon District Hails Latest Specimen Hunter",
  "Vault Signals Spike After Midnight Verification"
];

async function drawMagazineCover(userData = {}, dbcAccess = {}) {
  const avatarImages = await loadAvatarImages(userData);
  renderMagazineCover(dbcAccess, avatarImages);
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

  if (completionPercentage >= 95) return { label: "LEVEL_10 [OVERSEER]", color: "#FF0055" };
  if (completionPercentage >= 80) return { label: "LEVEL_9 [MASTER_STRATEGIST]", color: "#FF5500" };
  if (completionPercentage >= 65) return { label: "LEVEL_8 [COMMANDER]", color: "#FFAA00" };
  if (completionPercentage >= 50) return { label: "LEVEL_7 [TACTICAL_LEAD]", color: "#7000FF" };
  if (completionPercentage >= 35) return { label: "LEVEL_6 [ELITE_OPERATIVE]", color: "#d3f06d" };
  if (completionPercentage >= 25) return { label: "LEVEL_5 [VETERAN_AGENT]", color: "#FF00FF" };
  if (completionPercentage >= 15) return { label: "LEVEL_4 [SENIOR_AGENT]", color: "#00AAFF" };
  if (completionPercentage >= 10) return { label: "LEVEL_3 [FIELD_AGENT]", color: "#00FF88" };
  if (completionPercentage >= 5) return { label: "LEVEL_2 [JUNIOR_AGENT]", color: "#00FFEE" };
  if (levelScore >= 1) return { label: "LEVEL_1 [TRAINEE]", color: "#00FFEE" };
  return { label: "LEVEL_0 [RECRUIT]", color: "#00FFEE" };
}

function renderMagazineCover(dbcAccess, avatarImages) {
  const canvas = document.getElementById("magazineCanvas");
  const finalImg = document.getElementById("finalMagazineCover");
  if (!canvas || !finalImg) return;

  const ctx = canvas.getContext("2d");
  const agentName = dbcAccess.agentName || localStorage.getItem("agentName") || "UNKNOWN";
  const cardCount = dbcAccess.count || 0;
  const levelScore = dbcAccess.levelScore || 0;
  const rank = getRank(levelScore);
  const headline = MAGAZINE_HEADLINES[Math.abs(hashString(agentName)) % MAGAZINE_HEADLINES.length];

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  const bg = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
  bg.addColorStop(0, "#08121c");
  bg.addColorStop(0.42, "#15172a");
  bg.addColorStop(1, "#09080e");
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.strokeStyle = "#55F7FF";
  ctx.lineWidth = 8;
  ctx.strokeRect(22, 22, canvas.width - 44, canvas.height - 44);
  ctx.strokeStyle = "#FF3BB8";
  ctx.lineWidth = 3;
  ctx.strokeRect(38, 38, canvas.width - 76, canvas.height - 76);

  ctx.fillStyle = "#55F7FF";
  ctx.font = "900 68px 'Courier New', monospace";
  ctx.textAlign = "center";
  ctx.fillText("MUTATION", canvas.width / 2, 104);
  ctx.fillStyle = "#FF3BB8";
  ctx.font = "900 56px 'Courier New', monospace";
  ctx.fillText("WEEKLY", canvas.width / 2, 162);

  ctx.fillStyle = "#FFD166";
  ctx.font = "900 30px 'Courier New', monospace";
  ctx.fillText("COLLECTOR OF THE MONTH", canvas.width / 2, 218);

  drawAvatarFrame(ctx, avatarImages, canvas.width / 2 - 120, 260, 240, 360);

  ctx.fillStyle = "#FFFFFF";
  ctx.font = "900 44px 'Courier New', monospace";
  ctx.fillText(`AGENT ${agentName.toUpperCase()}`, canvas.width / 2, 684);

  ctx.fillStyle = "#9CFF6A";
  ctx.font = "bold 24px 'Courier New', monospace";
  wrapText(ctx, headline.toUpperCase(), canvas.width / 2, 728, 600, 30, "center");

  drawMagazineBox(ctx, 74, 810, 238, 86, "ACHIEVEMENTS", `${cardCount} CARDS // ${levelScore} SCORE`);
  drawMagazineBox(ctx, 424, 810, 238, 86, "CLEARANCE", rank.label.replace("_", " "));

  ctx.fillStyle = "#FF3BB8";
  ctx.font = "900 28px 'Courier New', monospace";
  ctx.textAlign = "left";
  ctx.fillText("SPECIAL INTERVIEW", 74, 938);
  ctx.textAlign = "right";
  ctx.fillStyle = "#FFFFFF";
  ctx.fillText("ISSUE #046", canvas.width - 74, 938);

  finalImg.src = canvas.toDataURL("image/png");
}

function drawAvatarFrame(ctx, avatarImages, x, y, width, height) {
  ctx.fillStyle = "#05080d";
  ctx.fillRect(x - 18, y - 18, width + 36, height + 36);
  ctx.strokeStyle = "#55F7FF";
  ctx.lineWidth = 4;
  ctx.strokeRect(x - 18, y - 18, width + 36, height + 36);
  drawAvatar(ctx, avatarImages, x, y, width, height);
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

function drawMagazineBox(ctx, x, y, width, height, label, value) {
  ctx.fillStyle = "rgba(255, 255, 255, 0.08)";
  ctx.fillRect(x, y, width, height);
  ctx.strokeStyle = "#55F7FF";
  ctx.lineWidth = 2;
  ctx.strokeRect(x, y, width, height);
  ctx.fillStyle = "#55F7FF";
  ctx.font = "bold 15px 'Courier New', monospace";
  ctx.textAlign = "left";
  ctx.fillText(label, x + 14, y + 26);
  ctx.fillStyle = "#FFFFFF";
  ctx.font = "bold 18px 'Courier New', monospace";
  wrapText(ctx, value, x + 14, y + 54, width - 28, 20, "left");
}

function wrapText(ctx, text, x, y, maxWidth, lineHeight, align = "left") {
  const words = text.split(" ");
  let line = "";
  ctx.textAlign = align;

  words.forEach((word, index) => {
    const testLine = `${line}${word} `;
    if (ctx.measureText(testLine).width > maxWidth && index > 0) {
      ctx.fillText(line.trim(), x, y);
      line = `${word} `;
      y += lineHeight;
    } else {
      line = testLine;
    }
  });

  ctx.fillText(line.trim(), x, y);
}

function hashString(value) {
  return value.split("").reduce((hash, char) => ((hash << 5) - hash) + char.charCodeAt(0), 0);
}

window.drawMagazineCover = drawMagazineCover;
