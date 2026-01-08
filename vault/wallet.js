const CONTRACT_ADDRESS = "0x6d74e823E3cFB94A4a395b74B1E7B0F5Ca5596A3"; // Polygon NFT contract
const DESIRED_NFT_NAMES = ["Mutant", "i&t"]; // Only this NFT collection can unlock
const CONTRACT_ABI = [
  "function balanceOf(address owner) view returns (uint256)",
  "function name() view returns (string)"
];

const connectBtn = document.getElementById("connectBtn");
const statusDiv = document.getElementById("status");
const contentDiv = document.getElementById("exclusive-content");

connectBtn.onclick = async () => {
  if (!window.ethereum) {
    statusDiv.innerText = "❌ Wallet not detected";
    return;
  }

  try {
    // 1️⃣ Connect wallet (SAFE)
    const provider = new ethers.BrowserProvider(window.ethereum);
    await provider.send("eth_requestAccounts", []);
    const signer = await provider.getSigner();
    const address = await signer.getAddress();

    const network = await provider.getNetwork();
    if (network.chainId !== 137n) {
      statusDiv.innerText = "⚠️ Please switch to Polygon network";
      return;
    }

    statusDiv.innerText = "🔎 Checking access...";

    // 2️⃣ Read NFT balance (READ-ONLY)
    const contract = new ethers.Contract(
      CONTRACT_ADDRESS,
      CONTRACT_ABI,
      provider
    );

    const balance = await contract.balanceOf(address);

    // 3️⃣ Gate logic
    if (balance > 0n) {
      statusDiv.innerText = "✅ Access granted";
      contentDiv.style.display = "block";
      connectBtn.style.display = "none";
    } else {
      statusDiv.innerText = "⛔ You do not own any Mutant cards";
    }

  } catch (err) {
    console.error(err);
    statusDiv.innerText = "⚠️ Wallet connection failed";
  }
};
