import { ALCHEMY_API, CONTRACT_ADDRESS } from "../../config/config.js";

const DESIRED_FILTER = "by i&t";
const SCORE_MAP = {
  "bull": 3,
  "schlaflos": 1,
  "crocodyne": 2,
  "katz!": 1,
  "choris": 3,
  "#001": 5,
  "snuggin": 1,
  "#002": 2,
  "l46": 1,
  "k46": 1,
  "venom": 1,
  "#003": 1,
  "valentine": 1,
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
  "goldstruck": 2,
  "naga": 2,
  "listen": 1,
};

const walletForm = document.getElementById("walletForm");
const walletAddressInput = document.getElementById("walletAddressInput");
const connectBtn = document.getElementById("connectBtn");
const statusDiv = document.getElementById("status");
const contentDiv = document.getElementById("exclusive-content");

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

async function fetchNFTs(address) {
  let allNfts = [];
  let pageKey = null;
  let keepFetching = true;

  try {
    while (keepFetching) {
      let url = `${ALCHEMY_API}/getNFTs/?owner=${address}&contractAddresses[]=${CONTRACT_ADDRESS}`;
      if (pageKey) {
        url += `&pageKey=${encodeURIComponent(pageKey)}`;
      }

      const res = await fetch(url);
      if (!res.ok) throw new Error(`Alchemy API error: ${res.status} ${res.statusText}`);

      const data = await res.json();

      if (data.ownedNfts && data.ownedNfts.length > 0) {
        allNfts = allNfts.concat(data.ownedNfts);
      }

      if (data.pageKey) {
        pageKey = data.pageKey;
      } else {
        keepFetching = false;
      }
    }

    return allNfts;
  } catch (error) {
    console.error("Error fetching from Alchemy:", error);
    return allNfts.length > 0 ? allNfts : [];
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
    const nftTitle = nft.title || (nft.metadata && nft.metadata.name) || "";
    const lowerNftTitle = nftTitle.toLowerCase();

    if (lowerNftTitle.includes(DESIRED_FILTER.toLowerCase())) {
      let matchFound = false;

      for (const key of Object.keys(SCORE_MAP)) {
        if (lowerNftTitle.includes(key.toLowerCase())) {
          levelScore += SCORE_MAP[key];
          matchedCards.push(nftTitle);
          matchFound = true;
          break;
        }
      }

      if (!matchFound) {
        levelScore += 1;
        matchedCards.push(nftTitle);
      }
    }
  }

  connectBtn.disabled = false;

/*   if (matchedCards.length === 0) {
    statusDiv.innerText = "Access denied. This wallet does not hold any verified NFT with \"by i&t\" in the name.";
    contentDiv.style.display = "none";
    walletForm.style.display = "grid";
    return;
  } */

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
