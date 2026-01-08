const ALLOWED_CONTRACTS = [
  "0xABC123...DEF", // CHABLIS
].map(addr => addr.toLowerCase());
const ERC721_ABI = [
  "function balanceOf(address owner) view returns (uint256)"
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
    provider = new ethers.providers.Web3Provider(window.ethereum);
    await provider.send("eth_requestAccounts", []);
    signer = provider.getSigner();

    const userAddress = await signer.getAddress();
    statusDiv.innerText = "🔍 Scanning wallet…";

    const hasAccess = await checkNFTAccess(userAddress);

    if (hasAccess) {
      statusDiv.innerText = "✅ Access Granted";
      contentDiv.style.display = "block";
      connectBtn.style.display = "none";
    } else {
      statusDiv.innerText = "❌ Access Denied: No mutant cards found";
    }

  } catch (err) {
    console.error(err);
    statusDiv.innerText = "⚠️ Wallet connection failed";
  }
};

async function checkNFTAccess(userAddress) {
  for (const contractAddress of ALLOWED_CONTRACTS) {
    try {
      const contract = new ethers.Contract(
        contractAddress,
        ERC721_ABI,
        provider
      );

      const balance = await contract.balanceOf(userAddress);

      if (balance.gt(0)) {
        return true; // owns at least 1 NFT
      }
    } catch (e) {
      console.warn("Contract check failed:", contractAddress);
    }
  }
  return false;
}
