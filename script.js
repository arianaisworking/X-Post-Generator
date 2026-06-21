/* ─── ELEMENTS ─── */
const nameInput       = document.getElementById('nameInput');
const usernameInput   = document.getElementById('usernameInput');
const postInput       = document.getElementById('postInput');
const avatarInput     = document.getElementById('avatarInput');
const topicInput      = document.getElementById('topicInput');
const generateBtn     = document.getElementById('generateBtn');
const downloadBtn     = document.getElementById('downloadBtn');
const showStats       = document.getElementById('showStats');
const statFields      = document.getElementById('statFields');
const statLikes       = document.getElementById('statLikes');
const statReposts     = document.getElementById('statReposts');
const statViews       = document.getElementById('statViews');
const fontSizeSlider  = document.getElementById('fontSizeSlider');
const fontSizeDisplay = document.getElementById('fontSizeDisplay');
const customColor     = document.getElementById('customColor');
const aiOverlay       = document.getElementById('aiOverlay');

// Card elements
const nameCard      = document.getElementById('nameCard');
const usernameCard  = document.getElementById('usernameCard');
const postCard      = document.getElementById('postCard');
const avatarCard    = document.getElementById('avatarCard');
const avatarThumb   = document.getElementById('avatarPreviewThumb');
const statsCard     = document.getElementById('statsCard');
const likesDisplay  = document.getElementById('likesDisplay');
const repostsDisplay= document.getElementById('repostsDisplay');
const viewsDisplay  = document.getElementById('viewsDisplay');
const card          = document.getElementById('card');

// Bulk
const bulkTopicInput   = document.getElementById('bulkTopicInput');
const bulkAiBtn        = document.getElementById('bulkAiBtn');
const bulkInput        = document.getElementById('bulkInput');
const bulkPreviewBtn   = document.getElementById('bulkPreviewBtn');
const bulkDownloadBtn  = document.getElementById('bulkDownloadBtn');
const bulkStatus       = document.getElementById('bulkStatus');
const bulkPreviewGrid  = document.getElementById('bulkPreviewGrid');

// Mode
const tabs         = document.querySelectorAll('.tab');
const singleMode   = document.getElementById('singleMode');
const bulkMode     = document.getElementById('bulkMode');
const singlePreview= document.getElementById('singlePreview');

/* ─── STATE ─── */
let currentStyle  = 'dark';
let currentAvatar = 'assets/default-avatar.png';
let currentFontSize = 26;

/* ─── LIVE UPDATE ─── */
function update() {
  nameCard.textContent     = nameInput.value;
  usernameCard.textContent = usernameInput.value;
  postCard.textContent     = postInput.value;
}
nameInput.oninput = update;
usernameInput.oninput = update;
postInput.oninput = update;
update();

/* ─── AVATAR ─── */
avatarInput.onchange = (e) => {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = (ev) => {
    currentAvatar = ev.target.result;
    avatarCard.src = currentAvatar;
    avatarThumb.src = currentAvatar;
  };
  reader.readAsDataURL(file);
};

/* ─── FONT SIZE ─── */
fontSizeSlider.oninput = () => {
  currentFontSize = parseInt(fontSizeSlider.value);
  fontSizeDisplay.textContent = currentFontSize + 'px';
  postCard.style.fontSize = currentFontSize + 'px';
};

/* ─── STATS TOGGLE ─── */
showStats.onchange = () => {
  if (showStats.checked) {
    statFields.classList.remove('hidden');
    statsCard.classList.remove('hidden');
  } else {
    statFields.classList.add('hidden');
    statsCard.classList.add('hidden');
  }
  updateStats();
};

function formatNum(n) {
  const num = parseInt(n) || 0;
  if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
  if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
  return num.toLocaleString();
}

function updateStats() {
  likesDisplay.textContent   = formatNum(statLikes.value);
  repostsDisplay.textContent = formatNum(statReposts.value);
  viewsDisplay.textContent   = formatNum(statViews.value) + ' views';
}
statLikes.oninput   = updateStats;
statReposts.oninput = updateStats;
statViews.oninput   = updateStats;
updateStats();

/* ─── STYLE SWATCHES ─── */
document.querySelectorAll('.swatch[data-style]').forEach(btn => {
  btn.onclick = () => {
    document.querySelectorAll('.swatch').forEach(s => s.classList.remove('active'));
    btn.classList.add('active');
    currentStyle = btn.dataset.style;
    applyStyle(currentStyle);
  };
});

customColor.oninput = () => {
  document.querySelectorAll('.swatch').forEach(s => s.classList.remove('active'));
  document.querySelector('.swatch-custom').classList.add('active');
  card.className = 'style-custom';
  card.style.background = customColor.value;
  // auto pick text color based on luminance
  const hex = customColor.value.replace('#','');
  const r = parseInt(hex.substr(0,2),16);
  const g = parseInt(hex.substr(2,2),16);
  const b = parseInt(hex.substr(4,2),16);
  const lum = (0.299*r + 0.587*g + 0.114*b) / 255;
  card.style.color = lum > 0.5 ? '#0f0f0f' : '#ffffff';
};

function applyStyle(style) {
  card.className = 'style-' + style;
  card.style.background = '';
  card.style.color = '';
}
applyStyle('dark');

/* ─── MODE TOGGLE (single, bulk, beforeafter) ─── */
function switchMode(mode) {
  tabs.forEach(x => x.classList.remove('active'));
  document.querySelector(`.tab[data-mode="${mode}"]`)?.classList.add('active');

  singleMode.classList.add('hidden');
  bulkMode.classList.add('hidden');
  singlePreview.classList.add('hidden');
  bulkPreviewGrid.classList.add('hidden');

  const baMode = document.getElementById('beforeAfterMode');
  const baPrev = document.getElementById('baPreview');
  if (baMode) baMode.classList.add('hidden');
  if (baPrev) baPrev.classList.add('hidden');

  if (mode === 'single') {
    singleMode.classList.remove('hidden');
    singlePreview.classList.remove('hidden');
  } else if (mode === 'bulk') {
    bulkMode.classList.remove('hidden');
  } else if (mode === 'beforeafter') {
    if (baMode) baMode.classList.remove('hidden');
    if (baPrev && (beforeDataUrl || afterDataUrl)) baPrev.classList.remove('hidden');
  }
}
tabs.forEach(t => { t.onclick = () => switchMode(t.dataset.mode); });

/* ─── AI GENERATION (Single) ─── */
generateBtn.onclick = async () => {
  const topic = topicInput.value.trim();
  if (!topic) { topicInput.focus(); return; }
  showOverlay('Generating your post...');
  generateBtn.disabled = true;
  try {
    const post = await generatePost(topic);
    postInput.value = post;
    postCard.textContent = post;
  } catch(err) {
    console.error(err);
    postInput.value = 'Generation failed. Check console.';
  } finally {
    hideOverlay();
    generateBtn.disabled = false;
  }
};

/* ─── AI GENERATION (Bulk) ─── */
bulkAiBtn.onclick = async () => {
  const raw = bulkTopicInput.value.trim();
  if (!raw) { bulkTopicInput.focus(); return; }
  const topics = raw.split(',').map(t => t.trim()).filter(Boolean);
  if (!topics.length) return;
  showOverlay(`Generating ${topics.length} posts...`);
  bulkAiBtn.disabled = true;
  setBulkStatus('', '');
  try {
    const posts = [];
    for (const topic of topics) {
      const post = await generatePost(topic);
      posts.push(post);
    }
    bulkInput.value = posts.join('\n---\n');
    setBulkStatus(`Generated ${posts.length} posts. Preview or download below.`, 'success');
  } catch(err) {
    setBulkStatus('Generation failed. Check console.', 'error');
    console.error(err);
  } finally {
    hideOverlay();
    bulkAiBtn.disabled = false;
  }
};

async function generatePost(topic) {
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'claude-sonnet-4-6',
      max_tokens: 1000,
      system: `You are a ghostwriter for Ariana Hernandez — President of Business Development & Operations, multi-industry operator, builder. She runs DRC Maintenance, The Lead Boss (marketing), Perfumearoo (fragrance brand), and a call center operation. Her voice on X is: direct, sharp, self-aware, data-backed when possible, conversational not corporate. She does NOT use em dashes, corporate jargon, or AI-sounding filler phrases. Her posts lead with a punchy hook, use short punchy paragraphs with line breaks, and close with an insight or tension. No hashtags. No emojis. Write like someone who has actually run businesses, not someone who has read about them. Return ONLY the post text — no quotes, no preamble, no explanation.`,
      messages: [{ role: 'user', content: `Write an X post on this topic: ${topic}` }]
    })
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error?.message || 'API error');
  return data.content[0].text.trim();
}

/* ─── OVERLAY ─── */
function showOverlay(msg) {
  document.querySelector('.ai-overlay-text').textContent = msg;
  aiOverlay.classList.remove('hidden');
}
function hideOverlay() {
  aiOverlay.classList.add('hidden');
}

/* ─── BULK STATUS ─── */
function setBulkStatus(msg, type) {
  if (!msg) { bulkStatus.classList.add('hidden'); return; }
  bulkStatus.textContent = msg;
  bulkStatus.className = 'bulk-status ' + type;
  bulkStatus.classList.remove('hidden');
}

/* ─── BULK PREVIEW ─── */
function parseBulkPosts() {
  return bulkInput.value.split('---').map(p => p.trim()).filter(Boolean);
}

bulkPreviewBtn.onclick = () => {
  const posts = parseBulkPosts();
  if (!posts.length) { setBulkStatus('No posts to preview. Add posts above.', 'error'); return; }
  renderBulkGrid(posts);
  singlePreview.classList.add('hidden');
  bulkPreviewGrid.classList.remove('hidden');
};

function renderBulkGrid(posts) {
  bulkPreviewGrid.innerHTML = '';
  posts.forEach((text, i) => {
    const wrap = document.createElement('div');
    wrap.className = 'bulk-card-wrap';
    wrap.innerHTML = `
      <div class="bulk-card-label">Post ${i + 1}</div>
      <div class="bulk-card style-${currentStyle}" id="bulkCard${i}">
        <div class="card-header">
          <img src="${currentAvatar}" style="width:40px;height:40px;border-radius:50%;object-fit:cover;">
          <div class="card-user">
            <div class="card-name-row">
              <span style="font-weight:800;font-size:14px;">${nameInput.value}</span>
              <svg class="verified-badge" viewBox="0 0 24 24" fill="#1D9BF0" style="width:15px;height:15px;"><path d="M22.25 12c0-1.43-.88-2.67-2.19-3.34.46-1.39.2-2.9-.81-3.91s-2.52-1.27-3.91-.81c-.66-1.31-1.9-2.19-3.34-2.19s-2.67.88-3.33 2.19c-1.4-.46-2.91-.2-3.92.81s-1.26 2.52-.8 3.91C1.88 9.33 1 10.57 1 12s.88 2.67 2.19 3.34c-.46 1.39-.2 2.9.81 3.91s2.52 1.26 3.91.8c.67 1.31 1.9 2.19 3.34 2.19s2.67-.88 3.33-2.19c1.4.46 2.91.2 3.92-.81s1.26-2.52.8-3.91C21.37 14.67 22.25 13.43 22.25 12zm-13.47 4.14l-3.47-3.47 1.41-1.41 2.06 2.06 5.28-5.28 1.41 1.41-6.69 6.69z"/></svg>
            </div>
            <div style="font-size:12px;opacity:0.55;">${usernameInput.value}</div>
          </div>
          <svg style="width:18px;height:18px;margin-left:auto;flex-shrink:0;" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.733-8.835L1.254 2.25H8.08l4.259 5.63 5.905-5.63zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
        </div>
        <div class="card-post" style="font-size:${Math.round(currentFontSize * 0.65)}px;">${text.replace(/\n/g, '<br>')}</div>
      </div>`;
    bulkPreviewGrid.appendChild(wrap);
  });
}

/* ─── BULK DOWNLOAD ─── */
bulkDownloadBtn.onclick = async () => {
  const posts = parseBulkPosts();
  if (!posts.length) { setBulkStatus('No posts to download. Add posts above.', 'error'); return; }

  // First render the grid so we can capture
  renderBulkGrid(posts);
  singlePreview.classList.add('hidden');
  bulkPreviewGrid.classList.remove('hidden');

  showOverlay(`Exporting ${posts.length} cards...`);
  await new Promise(r => setTimeout(r, 300)); // let DOM paint

  for (let i = 0; i < posts.length; i++) {
    const el = document.getElementById(`bulkCard${i}`);
    if (!el) continue;
    document.querySelector('.ai-overlay-text').textContent = `Exporting card ${i + 1} of ${posts.length}...`;
    const canvas = await html2canvas(el, { scale: 3, backgroundColor: null, useCORS: true });
    const link = document.createElement('a');
    link.download = `post-${i + 1}.png`;
    link.href = canvas.toDataURL();
    link.click();
    await new Promise(r => setTimeout(r, 300));
  }
  hideOverlay();
  setBulkStatus(`Downloaded ${posts.length} PNGs.`, 'success');
};

/* ─── SINGLE DOWNLOAD ─── */
downloadBtn.onclick = async () => {
  showOverlay('Exporting card...');
  const canvas = await html2canvas(card, { scale: 3, backgroundColor: null, useCORS: true });
  const link = document.createElement('a');
  link.download = 'post.png';
  link.href = canvas.toDataURL();
  link.click();
  hideOverlay();
};

/* ═══════════════════════════════════════════
   BEFORE / AFTER MODULE
═══════════════════════════════════════════ */

const beforeAfterMode = document.getElementById('beforeAfterMode');
const baPreview       = document.getElementById('baPreview');
const baCard          = document.getElementById('baCard');
const baGifBtn        = document.getElementById('baGifBtn');
const baStatus        = document.getElementById('baStatus');
const baCompanyName   = document.getElementById('baCompanyName');
const baTagline       = document.getElementById('baTagline');
const baCaption       = document.getElementById('baCaption');
const gifSpeedSlider  = document.getElementById('gifSpeedSlider');

let beforeDataUrl = null;
let afterDataUrl  = null;
let logoDataUrl   = null;

/* Pre-load the default DRC logo */
(function() {
  const img = new Image();
  img.onload = () => {
    const canvas = document.createElement('canvas');
    canvas.width = img.width; canvas.height = img.height;
    canvas.getContext('2d').drawImage(img, 0, 0);
    logoDataUrl = canvas.toDataURL('image/png');
  };
  img.src = 'assets/drc-logo.png';
})();

/* ─── PHOTO UPLOAD HELPERS ─── */
function setupPhotoUpload(inputId, wrapId, boxId, callback) {
  const input = document.getElementById(inputId);
  const wrap  = document.getElementById(wrapId);
  const box   = document.getElementById(boxId);
  input.onchange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const dataUrl = ev.target.result;
      callback(dataUrl);
      // Show thumbnail in upload box
      wrap.innerHTML = `<img src="${dataUrl}" alt="preview">`;
      if (box) box.classList.add('has-image');
    };
    reader.readAsDataURL(file);
  };
}

setupPhotoUpload('beforeInput', 'beforePreviewWrap', 'beforeUploadLabel', (url) => {
  beforeDataUrl = url;
  renderBaPreview('before');
  baPreview.classList.remove('hidden');
});

setupPhotoUpload('afterInput', 'afterPreviewWrap', 'afterUploadLabel', (url) => {
  afterDataUrl = url;
  renderBaPreview('after');
  baPreview.classList.remove('hidden');
});

setupPhotoUpload('logoInput', 'logoPreviewWrap', 'logoUploadLabel', (url) => {
  logoDataUrl = url;
  renderBaPreview('before');
});

/* Live update branding */
baCompanyName.oninput = () => renderBaPreview('before');
baTagline.oninput     = () => renderBaPreview('before');
baCaption.oninput     = () => renderBaPreview('before');

/* ─── RENDER BA PREVIEW ─── */
function buildBaCardHTML(imageUrl, label) {
  const isAfter = label === 'After';
  const badgeHtml = logoDataUrl
    ? `<div class="ba-badge-corner"><img src="${logoDataUrl}" alt="DRC"></div>`
    : `<div class="ba-badge-corner" style="background:#0D1B3E;display:flex;align-items:center;justify-content:center;font-size:13px;font-weight:900;color:#4CAF50;">DRC</div>`;

  const captionHtml = baCaption.value.trim()
    ? `<div class="ba-caption-bar"><div class="ba-caption-text">${baCaption.value}</div></div>`
    : '';

  const taglineHtml = baTagline.value.trim()
    ? `<div class="ba-tagline">${baTagline.value}</div>`
    : '';

  const logoSmallHtml = logoDataUrl
    ? `<img class="ba-logo" src="${logoDataUrl}" alt="DRC">`
    : `<div class="ba-logo-placeholder">DRC</div>`;

  return `
    ${imageUrl ? `<img class="ba-image" src="${imageUrl}">` : ''}
    <div class="ba-label-pill ${isAfter ? 'after' : ''}">${label}</div>
    ${captionHtml}
    ${badgeHtml}
    <div class="ba-brand-corner">
      ${logoSmallHtml}
      <div class="ba-brand-text">
        <div class="ba-company">${baCompanyName.value || 'DRC Maintenance'}</div>
        ${taglineHtml}
      </div>
    </div>`;
}

function renderBaPreview(which) {
  const url = which === 'before' ? beforeDataUrl : afterDataUrl;
  const label = which === 'before' ? 'Before' : 'After';
  baCard.innerHTML = buildBaCardHTML(url, label);
}

/* ─── GIF EXPORT ─── */
baGifBtn.onclick = async () => {
  if (!beforeDataUrl || !afterDataUrl) {
    setBaStatus('Upload both a Before and After photo first.', 'error');
    return;
  }
  setBaStatus('', '');
  showOverlay('Building your GIF...');

  try {
    const SIZE = 600;
    const FADE_FRAMES = 30; // frames for crossfade
    const speedVal = parseInt(gifSpeedSlider.value); // 1-5
    // Hold duration: slower speed = longer hold. Speed 1=4s, 3=2.5s, 5=1.5s
    const holdMs = Math.round(4000 - (speedVal - 1) * 625);
    const holdFrames = Math.round(holdMs / 80);
    const frameDelay = 8; // centiseconds (gif.js unit) = 80ms per frame

    // Pre-render both frames as canvases with branding
    async function renderFrame(imageUrl, label) {
      const offscreen = document.createElement('canvas');
      offscreen.width  = SIZE;
      offscreen.height = SIZE;
      const ctx = offscreen.getContext('2d');

      // Draw photo
      await new Promise((res, rej) => {
        const img = new Image();
        img.onload = () => {
          // cover-fit into square
          const scale = Math.max(SIZE / img.width, SIZE / img.height);
          const w = img.width * scale;
          const h = img.height * scale;
          ctx.drawImage(img, (SIZE - w) / 2, (SIZE - h) / 2, w, h);
          res();
        };
        img.onerror = rej;
        img.src = imageUrl;
      });

      // Gradient overlay (bottom) — deep navy fade matching DRC palette
      const grad = ctx.createLinearGradient(0, SIZE * 0.42, 0, SIZE);
      grad.addColorStop(0, 'rgba(10,18,40,0)');
      grad.addColorStop(0.6, 'rgba(10,18,40,0.78)');
      grad.addColorStop(1, 'rgba(10,18,40,0.96)');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, SIZE, SIZE);

      // Before/After pill — navy bg for Before, DRC green for After
      const isAfter = label === 'After';
      const pillW = isAfter ? 84 : 96;
      ctx.fillStyle = isAfter ? '#2E7D32' : '#0D1B3E';
      // Pill with green border
      ctx.save();
      roundRect(ctx, 18, 18, pillW, 34, 17);
      ctx.restore();
      // Green border ring
      ctx.strokeStyle = '#4CAF50';
      ctx.lineWidth = 1.5;
      ctx.save();
      ctx.beginPath();
      ctx.moveTo(18 + 17, 18);
      ctx.lineTo(18 + pillW - 17, 18);
      ctx.quadraticCurveTo(18 + pillW, 18, 18 + pillW, 18 + 17);
      ctx.lineTo(18 + pillW, 18 + 34 - 17);
      ctx.quadraticCurveTo(18 + pillW, 18 + 34, 18 + pillW - 17, 18 + 34);
      ctx.lineTo(18 + 17, 18 + 34);
      ctx.quadraticCurveTo(18, 18 + 34, 18, 18 + 34 - 17);
      ctx.lineTo(18, 18 + 17);
      ctx.quadraticCurveTo(18, 18, 18 + 17, 18);
      ctx.closePath();
      ctx.stroke();
      ctx.restore();
      ctx.fillStyle = '#F5F0E8';
      ctx.font = 'bold 12px Inter, sans-serif';
      ctx.textBaseline = 'middle';
      ctx.textAlign = 'center';
      ctx.fillText(label.toUpperCase(), 18 + pillW / 2, 35);
      ctx.textAlign = 'left';

      // DRC Badge — bottom right corner, prominent
      const badgeSize = 88;
      const badgeX = SIZE - badgeSize - 16;
      const badgeY = SIZE - badgeSize - 16;

      if (logoDataUrl) {
        await new Promise((res, rej) => {
          const logo = new Image();
          logo.onload = () => {
            // Circular clip for the badge
            ctx.save();
            ctx.beginPath();
            ctx.arc(badgeX + badgeSize/2, badgeY + badgeSize/2, badgeSize/2, 0, Math.PI*2);
            ctx.clip();
            ctx.drawImage(logo, badgeX, badgeY, badgeSize, badgeSize);
            ctx.restore();
            // Thin navy ring around badge
            ctx.strokeStyle = '#0D1B3E';
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.arc(badgeX + badgeSize/2, badgeY + badgeSize/2, badgeSize/2 + 1, 0, Math.PI*2);
            ctx.stroke();
            res();
          };
          logo.onerror = rej;
          logo.src = logoDataUrl;
        });
      } else {
        // Fallback text badge
        ctx.fillStyle = '#0D1B3E';
        ctx.beginPath();
        ctx.arc(badgeX + badgeSize/2, badgeY + badgeSize/2, badgeSize/2, 0, Math.PI*2);
        ctx.fill();
        ctx.strokeStyle = '#4CAF50';
        ctx.lineWidth = 2;
        ctx.stroke();
        ctx.fillStyle = '#4CAF50';
        ctx.font = 'bold 22px Inter, sans-serif';
        ctx.textBaseline = 'middle';
        ctx.textAlign = 'center';
        ctx.fillText('DRC', badgeX + badgeSize/2, badgeY + badgeSize/2);
        ctx.textAlign = 'left';
      }

      // Company name + tagline bottom left
      const textX = 20;
      ctx.fillStyle = '#F5F0E8';
      ctx.font = 'bold 15px Inter, sans-serif';
      ctx.textBaseline = 'alphabetic';
      ctx.fillText(baCompanyName.value || 'DRC Maintenance', textX, SIZE - 28);

      if (baTagline.value.trim()) {
        ctx.fillStyle = 'rgba(245,240,232,0.6)';
        ctx.font = '500 10px Inter, sans-serif';
        ctx.fillText(baTagline.value, textX, SIZE - 14);
      }

      // Caption
      if (baCaption.value.trim()) {
        ctx.fillStyle = 'rgba(245,240,232,0.9)';
        ctx.font = '600 13px Inter, sans-serif';
        ctx.textBaseline = 'middle';
        ctx.fillText(baCaption.value, textX, SIZE - 82);
      }

      return offscreen;
    }

    const beforeCanvas = await renderFrame(beforeDataUrl, 'Before');
    const afterCanvas  = await renderFrame(afterDataUrl, 'After');

    document.querySelector('.ai-overlay-text').textContent = 'Encoding GIF frames...';

    // Build GIF using gif.js
    const gif = new GIF({
      workers: 2,
      quality: 6,
      width: SIZE,
      height: SIZE,
      workerScript: 'libs/gif.worker.js'
    });

    // Hold on BEFORE
    for (let i = 0; i < holdFrames; i++) {
      gif.addFrame(beforeCanvas, { delay: frameDelay * 10, copy: true });
    }

    // Fade from BEFORE → AFTER
    const fadeCanvas = document.createElement('canvas');
    fadeCanvas.width = fadeCanvas.height = SIZE;
    const fctx = fadeCanvas.getContext('2d');

    for (let f = 0; f <= FADE_FRAMES; f++) {
      const alpha = f / FADE_FRAMES;
      fctx.clearRect(0, 0, SIZE, SIZE);
      fctx.globalAlpha = 1;
      fctx.drawImage(beforeCanvas, 0, 0);
      fctx.globalAlpha = alpha;
      fctx.drawImage(afterCanvas, 0, 0);
      fctx.globalAlpha = 1;
      gif.addFrame(fctx, { delay: frameDelay * 10, copy: true });
    }

    // Hold on AFTER
    for (let i = 0; i < holdFrames; i++) {
      gif.addFrame(afterCanvas, { delay: frameDelay * 10, copy: true });
    }

    // Fade from AFTER → BEFORE
    for (let f = 0; f <= FADE_FRAMES; f++) {
      const alpha = f / FADE_FRAMES;
      fctx.clearRect(0, 0, SIZE, SIZE);
      fctx.globalAlpha = 1;
      fctx.drawImage(afterCanvas, 0, 0);
      fctx.globalAlpha = alpha;
      fctx.drawImage(beforeCanvas, 0, 0);
      fctx.globalAlpha = 1;
      gif.addFrame(fctx, { delay: frameDelay * 10, copy: true });
    }

    gif.on('finished', (blob) => {
      hideOverlay();
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.download = 'drc-before-after.gif';
      link.href = url;
      link.click();
      setBaStatus('GIF exported successfully.', 'success');
    });

    gif.on('progress', (p) => {
      document.querySelector('.ai-overlay-text').textContent =
        `Encoding GIF... ${Math.round(p * 100)}%`;
    });

    gif.render();

  } catch(err) {
    hideOverlay();
    setBaStatus('Export failed: ' + err.message, 'error');
    console.error(err);
  }
};

/* ─── CANVAS HELPERS ─── */
function roundRect(ctx, x, y, w, h, r, clip = false) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
  if (!clip) ctx.fill();
}

function setBaStatus(msg, type) {
  if (!msg) { baStatus.classList.add('hidden'); return; }
  baStatus.textContent = msg;
  baStatus.className = 'bulk-status ' + type;
  baStatus.classList.remove('hidden');
}
