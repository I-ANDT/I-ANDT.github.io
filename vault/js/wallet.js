
const CONTRACT_ADDRESS = "0x6d74e823E3cFB94A4a395b74B1E7B0F5Ca5596A3"; // Polygon NFT contract
const DESIRED_NFT_NAMES = ["Mutant #0"]; // Only this NFT collection can unlock
const CONTRACT_ABI = [
  "function balanceOf(address owner) view returns (uint256)",
  "function name() view returns (string)"
];

const connectBtn = document.getElementById("connectBtn");
const statusDiv = document.getElementById("status");
const contentDiv = document.getElementById("exclusive-content");

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

async function fetchNFTs(address) {
  const url = `${ALCHEMY_API}/getNFTs/?owner=${address}&contractAddresses[]=${CONTRACT_ADDRESS}`;
  const res = await fetch(url);
  const data = await res.json();
  return data.ownedNfts || [];
}

window.addEventListener("load", async () => {
  if (!window.ethereum) return;

  const provider = new ethers.BrowserProvider(window.ethereum);

  // Check if user already authorized this site
  const accounts = await provider.send("eth_accounts", []);

  if (accounts.length === 0) return;

  const address = accounts[0];
  localStorage.setItem("walletAddress", address);

  await verifyAccess(provider, address);
});

async function verifyAccess(provider, address) {
  const network = await provider.getNetwork();
  if (network.chainId !== 137n) {
    statusDiv.innerText = "⚠️ Please switch to Polygon network";
    return;
  }

  statusDiv.innerText = "🔎 Checking access...";

  const contract = new ethers.Contract(
    CONTRACT_ADDRESS,
    CONTRACT_ABI,
    provider
  );

  const balance = await contract.balanceOf(address);

  if (balance === 0n) {
    statusDiv.innerText = "⛔ You do not own any Mutant cards";
    return;
  }

  // Fetch NFTs (Alchemy or your fetchNFTs)
  const nfts = await fetchNFTs(address);

  const matchedNFTs = [];

  for (const nft of nfts) {
    const name = nft.metadata?.name || nft.title || "";

    if (DESIRED_NFT_NAMES.some(desired => name.includes(desired))) {
      matchedNFTs.push({
        name,
        tokenId: nft.tokenId,
        image: nft.media?.[0]?.gateway || null,
        contract: nft.contract?.address
      });
    }
  }

  if (matchedNFTs.length > 0) {
    // ✅ STORE RESULT
    localStorage.setItem("dbc_access", JSON.stringify({
      address,
      count: matchedNFTs.length,
      names: matchedNFTs.map(n => n.name),
      nfts: matchedNFTs
    }));
    statusDiv.innerText = `✅ Access granted (${matchedNFTs.length} card${matchedNFTs.length > 1 ? "s" : ""})`;
    contentDiv.style.display = "block";
    connectBtn.style.display = "none";
    await initProfileCard();

  }
  else {
    statusDiv.innerText = "⛔ You do not own any Mutant cards";
  }
}

connectBtn.onclick = async () => {
  if (!window.ethereum) {
    statusDiv.innerText = "❌ Wallet not detected";
    return;
  }

  try {
    const provider = new ethers.BrowserProvider(window.ethereum);
    await provider.send("eth_requestAccounts", []);
    const signer = await provider.getSigner();
    const address = await signer.getAddress();

    localStorage.setItem("walletAddress", address);

    await verifyAccess(provider, address);

  } catch (err) {
    console.error(err);
    statusDiv.innerText = "⚠️ Wallet connection failed";
  }
};

