import { ALCHEMY_API, CONTRACT_ADDRESS, SCORE_MAP } from "../../config/config.js";

const DESIRED_FILTER = "by i&t";

const vaultIntro = document.getElementById("vaultIntro");
const walletForm = document.getElementById("walletForm");
const agentNameInput = document.getElementById("agentNameInput");
const walletAddressInput = document.getElementById("walletAddressInput");
const connectBtn = document.getElementById("connectBtn");
const statusDiv = document.getElementById("status");
const contentDiv = document.getElementById("exclusive-content");
const magazineContentDiv = document.getElementById("magazine-content");

function isWalletAddress(value) {
  return /^0x[a-fA-F0-9]{40}$/.test(value.trim());
}

function sanitizeAgentName(value) {
  return value.trim().replace(/[^a-zA-Z0-9 _.-]/g, "").slice(0, 18);
}

async function renderVaultArtifacts() {
  const address = localStorage.getItem("walletAddress");
  if (!address) return;

  try {
    const profileData = await fetch(`https://avatar-artists-guild.web.app/api/mashers/latest?wallet=${address}`)
      .then(response => response.json());
    const dbcAccess = JSON.parse(localStorage.getItem("dbc_access") || "{}");

    window.drawProfileCard?.(profileData, dbcAccess);
    window.drawMagazineCover?.(profileData, dbcAccess);
  } catch (err) {
    console.error("Failed to fetch avatar data:", err);
    const dbcAccess = JSON.parse(localStorage.getItem("dbc_access") || "{}");
    window.drawProfileCard?.({}, dbcAccess);
    window.drawMagazineCover?.({}, dbcAccess);
  }
}

async function fetchNFTs(address) {
  let allNfts = [];
  let pageKey = null;

  do {
    let url = `${ALCHEMY_API}/getNFTs/?owner=${address}&contractAddresses[]=${CONTRACT_ADDRESS}`;
    if (pageKey) {
      url += `&pageKey=${encodeURIComponent(pageKey)}`;
    }

    const res = await fetch(url);
    if (!res.ok) throw new Error(`Alchemy API error: ${res.status} ${res.statusText}`);

    const data = await res.json();
    allNfts = allNfts.concat(data.ownedNfts || []);
    pageKey = data.pageKey || null;
  } while (pageKey);

  return allNfts;
}

async function verifyAccess(address) {
  const normalizedAddress = address.trim().toLowerCase();
  const agentName = sanitizeAgentName(agentNameInput.value);
  let levelScore = 0;
  const matchedCards = [];

  statusDiv.innerText = "Verifying NFT ownership live via Alchemy...";
  connectBtn.disabled = true;

  const nfts = await fetchNFTs(normalizedAddress);

  for (const nft of nfts) {
    const nftTitle = nft.title || nft.metadata?.name || "";
    const lowerNftTitle = nftTitle.toLowerCase();

    if (!lowerNftTitle.includes(DESIRED_FILTER)) continue;

    let score = 1;
    for (const key of Object.keys(SCORE_MAP)) {
      if (lowerNftTitle.includes(key.toLowerCase())) {
        score = SCORE_MAP[key];
        break;
      }
    }

    levelScore += score;
    matchedCards.push(nftTitle);
  }

  connectBtn.disabled = false;

  if (matchedCards.length === 0) {
    statusDiv.innerText = "Access denied. This wallet does not hold any verified NFT with \"by i&t\" in the name.";
    contentDiv.style.display = "none";
    if (magazineContentDiv) magazineContentDiv.style.display = "none";
    return;
  }

  localStorage.setItem("walletAddress", normalizedAddress);
  localStorage.setItem("agentName", agentName);
  localStorage.setItem("dbc_access", JSON.stringify({
    address: normalizedAddress,
    agentName,
    count: matchedCards.length,
    cards: matchedCards,
    levelScore
  }));

  statusDiv.innerText = "";
  if (vaultIntro) vaultIntro.style.display = "none";
  contentDiv.style.display = "block";
  if (magazineContentDiv) magazineContentDiv.style.display = "block";
  walletForm.style.display = "none";
  renderVaultArtifacts();
}

walletForm.addEventListener("submit", event => {
  event.preventDefault();

  const agentName = sanitizeAgentName(agentNameInput.value);
  const address = walletAddressInput.value;

  if (!agentName) {
    statusDiv.innerText = "Choose an agent name for your clearance card.";
    return;
  }

  if (!isWalletAddress(address)) {
    statusDiv.innerText = "Please enter a valid wallet address beginning with 0x.";
    return;
  }

  verifyAccess(address).catch(error => {
    console.error(error);
    connectBtn.disabled = false;
    statusDiv.innerText = "Verification failed. Please try again.";
  });
});

window.addEventListener("load", () => {
  const savedAddress = localStorage.getItem("walletAddress");
  const savedAgentName = localStorage.getItem("agentName");

  if (savedAddress) {
    walletAddressInput.value = savedAddress;
  }

  if (savedAgentName) {
    agentNameInput.value = savedAgentName;
  }
});
