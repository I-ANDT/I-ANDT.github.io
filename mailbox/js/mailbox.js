const emailListDiv = document.getElementById("email-list");
const emailContentDiv = document.getElementById("email-content");

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

async function loadEmails() {
  const manifestResponse = await fetch("mails/manifest.json");

  if (!manifestResponse.ok) {
    throw new Error("Mailbox manifest could not be loaded.");
  }

  const manifest = await manifestResponse.json();
  const files = Array.isArray(manifest.files) ? manifest.files : [];

  const emails = await Promise.all(files.map(async file => {
    const response = await fetch(`mails/${file}`);

    if (!response.ok) {
      throw new Error(`Transmission file missing: ${file}`);
    }

    return response.json();
  }));

  return emails.sort((a, b) => new Date(b.date) - new Date(a.date));
}

function renderEmailList(emails) {
  emailListDiv.innerHTML = "";

  emails.forEach((email, index) => {
    const item = document.createElement("button");
    item.className = "email-item";
    item.type = "button";
    item.onclick = () => openEmail(email, item);

    item.innerHTML = `
      <span class="email-meta">${escapeHtml(email.date)}</span>
      <strong>${escapeHtml(email.subject)}</strong>
      <small>${escapeHtml(email.preview)}</small>
    `;

    emailListDiv.appendChild(item);

    if (index === 0) {
      openEmail(email, item);
    }
  });
}

function openEmail(email, activeItem) {
  document.querySelectorAll(".email-item").forEach(item => item.classList.remove("is-active"));
  activeItem.classList.add("is-active");

  emailContentDiv.innerHTML = `
    <p class="eyebrow">Transmission ${String(email.id).padStart(3, "0")}</p>
    <h2>${escapeHtml(email.subject)}</h2>
    <div class="message-meta">
      <span><strong>From:</strong> ${escapeHtml(email.sender)}</span>
      <span><strong>Date:</strong> ${escapeHtml(email.date)}</span>
    </div>
    <div class="email-body">${email.bodyHtml || ""}</div>
  `;

  if (email.drop) {
    emailContentDiv.innerHTML += `<p class="drop-window"><strong>Operational Deployment:</strong> ${escapeHtml(email.drop)}</p>`;
  }

  if (email.images && email.images.length > 0) {
    const imagesDiv = document.createElement("div");
    imagesDiv.className = "email-images";

    email.images.forEach((image, i) => {
      const imageData = typeof image === "string" ? { src: image } : image;
      const figure = document.createElement("figure");
      const img = document.createElement("img");

      img.src = imageData.src;
      img.alt = imageData.alt || `${email.subject} evidence ${i + 1}`;
      figure.appendChild(img);

      if (imageData.captionHtml) {
        const caption = document.createElement("figcaption");
        caption.innerHTML = imageData.captionHtml;
        figure.appendChild(caption);
      }

      imagesDiv.appendChild(figure);
    });

    emailContentDiv.appendChild(imagesDiv);
  }
}

loadEmails()
  .then(renderEmailList)
  .catch(error => {
    console.error(error);
    emailListDiv.innerHTML = "";
    emailContentDiv.innerHTML = `
      <p class="eyebrow">Relay error</p>
      <h2>Mailbox unavailable</h2>
      <p>Transmission files could not be loaded. Check <code>mailbox/mails/manifest.json</code>.</p>
    `;
  });
