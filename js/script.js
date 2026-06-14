const loreTexts = [
  '"If left uncontained, they will cause irreversible environmental collapse." - Department of Biohazard Control',
  "2046: wildlife is no longer background noise. It is the threat signal.",
  "Capture reports indicate mutation behavior is spreading through abandoned transit, forests, and coastal zones.",
  "Agents with verified cards may request Vault clearance and rank assessment."
];

let loreIndex = 0;
const loreElement = document.getElementById("lore-text");

function showLore() {
  if (!loreElement) return;

  loreElement.textContent = loreTexts[loreIndex];
  loreIndex = (loreIndex + 1) % loreTexts.length;
}

showLore();
window.setInterval(showLore, 4200);
