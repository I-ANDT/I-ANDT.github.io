// Lore Text Rotation
const loreTexts = [
    '"If left uncontained, they will cause irreversible environmental collapse" - Department of Biohazard Control',
    "These mutants need to be captured...",
];

let loreIndex = 0;
const loreElement = document.getElementById('lore-text');

function showLore() {
    loreElement.textContent = loreTexts[loreIndex];
    loreIndex = (loreIndex + 1) % loreTexts.length;
}

showLore();
setInterval(showLore, 4000); // rotates every 4 seconds
