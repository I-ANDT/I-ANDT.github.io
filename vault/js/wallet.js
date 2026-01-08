
const CONTRACT_ADDRESS = "0x6d74e823E3cFB94A4a395b74B1E7B0F5Ca5596A3"; // Polygon NFT contract
const DESIRED_NFT_NAMES = ["Mutant", "i&t"]; // Only this NFT collection can unlock
const CONTRACT_ABI = [
  "function balanceOf(address owner) view returns (uint256)",
  "function name() view returns (string)"
];

const connectBtn = document.getElementById("connectBtn");
const statusDiv = document.getElementById("status");
const contentDiv = document.getElementById("exclusive-content");

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

  if (balance > 0n) {
    statusDiv.innerText = "✅ Access granted";
    contentDiv.style.display = "block";
    connectBtn.style.display = "none";
  } else {
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

