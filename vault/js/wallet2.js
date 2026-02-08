const CONTRACT_ADDRESS = "0x6d74e823E3cFB94A4a395b74B1E7B0F5Ca5596A3"; // Polygon NFT contract
const DESIRED_NFT_NAMES = ["Mutant #0"]; // Only this NFT collection can unlock
const SCORE_MAP = {
  "Mutant #001": 5,
  "Mutant #002": 2,
  "Mutant #003": 1
};

const connectBtn = document.getElementById("connectBtn");
const statusDiv = document.getElementById("status");
const contentDiv = document.getElementById("exclusive-content");
const exclusiveMessage = document.getElementById("exclusive-message");

async function initProfileCard() {
  const address = localStorage.getItem("walletAddress");
  if (!address) return; // no wallet connected yet

  try {
    // Fetch NFT info first (optional, you already do it in verifyAccess)
    const profileData = await fetch(`https://avatar-artists-guild.web.app/api/mashers/latest?wallet=${address}`)
      .then(r => r.json());

    // Draw the card
    drawProfileCard(profileData);
  } catch (err) {
    console.error("Failed to fetch avatar data:", err);
  }
}

async function loadCSVWallets(csvPath) {
  const res = await fetch(csvPath);
  if (!res.ok) return [];

  const text = await res.text();
  const lines = text.split("\n").map(l => l.trim()).filter(Boolean);

  // Remove header
  const header = lines.shift();
  const walletIndex = header.split(",").findIndex(h =>
    h.toLowerCase().includes("wallet")
  );

  if (walletIndex === -1) return [];

  return lines.map(line => line.split(",")[walletIndex].toLowerCase());
}


async function verifyAccess(address) {
  // Check if address is in csv files and calculate level score
  const normalizedAddress = address.toLowerCase();

  let is_allowed = false;
  let levelScore = 0;
  const matchedCards = [];

  // Map card → csv path
  const CSV_FILES = {
    "Mutant #001": "./assets/Mutant001.csv",
    "Mutant #002": "./assets/Mutant002.csv",
    "Mutant #003": "./assets/Mutant003.csv"
  };

  for (const [cardName, csvPath] of Object.entries(CSV_FILES)) {
    const wallets = await loadCSVWallets(csvPath);

    if (wallets.includes(normalizedAddress)) {
      is_allowed = true;
      levelScore += SCORE_MAP[cardName] || 0;
      matchedCards.push(cardName);
    }
  }

  if (!is_allowed) {
    statusDiv.innerText = "⛔ Sorry Recruit, you haven't captured any Mutant yet. Go out there, capture sum and unlock your vault access!";
    return;
  }


  // ✅ STORE ACCESS RESULT
  localStorage.setItem("dbc_access", JSON.stringify({
    address,
    levelScore,
    cards: matchedCards
  }));

  statusDiv.innerText = `✅ Access granted — Level Score: ${levelScore}`;
  contentDiv.style.display = "block";
  exclusiveMessage.style.display = "block";
  connectBtn.style.display = "none";
  initProfileCard();

}

connectBtn.onclick = async () => {

  try {
    const address = localStorage.getItem("walletAddress");

    await verifyAccess(address);

  } catch (err) {
    console.error(err);
    statusDiv.innerText = "⚠️ Something went wrong during wallet address verification.";
  }
};

