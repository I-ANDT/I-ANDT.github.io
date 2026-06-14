// Import configuration from config/config.js
const CONTRACT_ADDRESS = "0x6d74e823E3cFB94A4a395b74B1E7B0F5Ca5596A3"; // Polygon NFT contract
const ALCHEMY_API = "https://polygon-mainnet.g.alchemy.com/v2/-Qpug5c39c7LOIsdRWZPH";

const DESIRED_FILTER = "by i&t";
const SCORE_MAP = {
  "bull": 3,
  "schlaflos": 1,
  "Crocodyne": 2,
  "KATZ!": 1,
  "Choris": 3,
  "#001": 5,
  "snuggin": 1,
  "#002": 2,
  "L46": 1,
  "K46": 1,
  "Venom": 1,
  "#003": 1,
  "Valentine": 1,
  "ape": 1,
  "tuesday": 1,
  "sealpollo": 1,
  "hellfire": 1,
  "angel": 1,
  "momoka": 1,
  "downvote": 1,
  "wen": 1,
  "kaito": 1,
  "cruise": 1,
  "Goldstruck": 2,
  "Naga": 2,
  "Listen": 1,
};

const walletForm = document.getElementById("walletForm");
const walletAddressInput = document.getElementById("walletAddressInput");
const connectBtn = document.getElementById("connectBtn");
const statusDiv = document.getElementById("status");
const contentDiv = document.getElementById("exclusive-content");
const exclusiveMessage = document.getElementById("exclusive-message");

function isWalletAddress(value) {
  return /^0x[a-fA-F0-9]{40}$/.test(value.trim());
}

async function initProfileCard() {
  const address = localStorage.getItem("walletAddress");
  if (!address || typeof drawProfileCard !== "function") return;

  try {
    const profileData = await fetch(`https://avatar-artists-guild.web.app/api/mashers/latest?wallet=${address}`)
      .then(response => response.json());

    drawProfileCard(profileData);
  } catch (err) {
    console.error("Failed to fetch avatar data:", err);
  }
}

// Fetches owned NFTs filtered by the contract address from Alchemy
async function fetchNFTs(address) {
  const url = `${ALCHEMY_API}/getNFTs/?owner=${address}&contractAddresses[]=${CONTRACT_ADDRESS}`;
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Alchemy API error: ${res.statusText}`);
    const data = await res.json();
    console.log("Raw Alchemy data:", data); // Debugging
    return data.ownedNfts || [];
  } catch (error) {
    console.error("Error fetching from Alchemy:", error);
    return [];
  }
}

async function verifyAccess(address) {
  const normalizedAddress = address.trim().toLowerCase();
  let levelScore = 0;
  const matchedCards = [];

  statusDiv.innerText = "Verifying NFT ownership live via Alchemy...";
  connectBtn.disabled = true;

  const nfts = await fetchNFTs(normalizedAddress);

  for (const nft of nfts) {
    // 1. Get the raw title from the Alchemy payload
    const nftTitle = nft.title || (nft.metadata && nft.metadata.name) || "";
    const lowerNftTitle = nftTitle.toLowerCase();

    // 2. First, make sure it belongs to the "by i&t" collection
    if (lowerNftTitle.includes(DESIRED_FILTER.toLowerCase())) {

      let matchFound = false;

      // 3. Loop through your SCORE_MAP keys to find a partial, case-insensitive match
      for (const key of Object.keys(SCORE_MAP)) {
        if (lowerNftTitle.includes(key.toLowerCase())) {
          levelScore += SCORE_MAP[key];
          matchedCards.push(key); // Stores the clean map key (e.g., "schlaflos")
          matchFound = true;
          break; // Stop checking other keys once we find a match for this NFT
        }
      }

      // 4. Fallback if it has "by i&t" but none of your specific keywords match
      if (!matchFound) {
        levelScore += 1; // Default score fallback
        matchedCards.push(nftTitle);
      }
    }
  }

  connectBtn.disabled = false;

  if (matchedCards.length === 0) {
    statusDiv.innerText = "Access denied. You do not hold any verified Mutation cards in this wallet.";
    contentDiv.style.display = "none";
    return;
  }

  // Preserve your local storage updates exactly as they were
  localStorage.setItem("walletAddress", normalizedAddress);
  localStorage.setItem("dbc_access", JSON.stringify({
    address: normalizedAddress,
    count: matchedCards.length,
    cards: matchedCards,
    levelScore
  }));

  statusDiv.innerText = `Access granted. ${matchedCards.length} card${matchedCards.length > 1 ? "s" : ""} verified. Level Score: ${levelScore}`;
  contentDiv.style.display = "block";
  walletForm.style.display = "none";
  initProfileCard();
}

walletForm.addEventListener("submit", event => {
  event.preventDefault();
  const address = walletAddressInput.value;

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
  if (savedAddress) {
    walletAddressInput.value = savedAddress;
  }
});