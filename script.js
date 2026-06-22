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

/* ─── STATE: arrays of dataUrls ─── */
let beforeImages = [];  // up to 15
let afterImages  = [];  // up to 15
let logoDataUrl  = null;

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

/* ─── MULTI PHOTO UPLOAD ─── */
function setupMultiUpload(inputId, thumbGridId, countId, store) {
  const input     = document.getElementById(inputId);
  const thumbGrid = document.getElementById(thumbGridId);
  const countEl   = document.getElementById(countId);

  function updateCount() {
    countEl.textContent = store.length + ' / 15';
  }

  function addFiles(files) {
    const remaining = 15 - store.length;
    const toAdd = Array.from(files).slice(0, remaining);
    toAdd.forEach(file => {
      const reader = new FileReader();
      reader.onload = (ev) => {
        const url = ev.target.result;
        const idx = store.push(url) - 1;
        renderThumb(url, idx);
        updateCount();
        renderBaPreview();
        baPreview.classList.remove('hidden');
      };
      reader.readAsDataURL(file);
    });
  }

  function renderThumb(url, idx) {
    const wrap = document.createElement('div');
    wrap.className = 'photo-thumb';
    wrap.dataset.idx = idx;
    const img = document.createElement('img');
    img.src = url;
    const btn = document.createElement('button');
    btn.className = 'photo-thumb-remove';
    btn.innerHTML = '×';
    btn.onclick = (e) => {
      e.preventDefault();
      store.splice(idx, 1);
      // re-render all thumbs
      thumbGrid.innerHTML = '';
      store.forEach((u, i) => renderThumb(u, i));
      updateCount();
      renderBaPreview();
    };
    wrap.appendChild(img);
    wrap.appendChild(btn);
    thumbGrid.appendChild(wrap);
  }

  input.onchange = (e) => { addFiles(e.target.files); input.value = ''; };
  updateCount();
}

setupMultiUpload('beforeInput', 'beforeThumbs', 'beforeCount', beforeImages);
setupMultiUpload('afterInput',  'afterThumbs',  'afterCount',  afterImages);

/* ─── LOGO UPLOAD ─── */
document.getElementById('logoInput').onchange = (e) => {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = (ev) => {
    logoDataUrl = ev.target.result;
    const wrap = document.getElementById('logoPreviewWrap');
    wrap.innerHTML = `<img src="${logoDataUrl}" alt="DRC">`;
    document.getElementById('logoUploadLabel').classList.add('has-image');
    renderBaPreview();
  };
  reader.readAsDataURL(file);
};

/* Live update branding fields */
baCompanyName.oninput = renderBaPreview;
baTagline.oninput     = renderBaPreview;
baCaption.oninput     = renderBaPreview;

/* ─── LIVE PREVIEW (shows first before or after) ─── */
function buildBaCardHTML(imageUrl, label) {
  const isAfter = label === 'After';
  const badgeHtml = logoDataUrl
    ? `<div class="ba-badge-corner"><img src="${logoDataUrl}" alt="DRC"></div>`
    : `<div class="ba-badge-corner" style="background:#0D1B3E;display:flex;align-items:center;justify-content:center;font-size:13px;font-weight:900;color:#4CAF50;">DRC</div>`;

  const captionHtml = baCaption.value.trim()
    ? `<div class="ba-caption-bar"><div class="ba-caption-text">${baCaption.value}</div></div>` : '';

  const taglineHtml = baTagline.value.trim()
    ? `<div class="ba-tagline">${baTagline.value}</div>` : '';

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

function renderBaPreview() {
  const url   = beforeImages[0] || afterImages[0] || null;
  const label = beforeImages[0] ? 'Before' : 'After';
  if (url) {
    baCard.innerHTML = buildBaCardHTML(url, label);
    baPreview.classList.remove('hidden');
  }
}

/* ─── GIF EXPORT ─── */
baGifBtn.onclick = async () => {
  if (!beforeImages.length && !afterImages.length) {
    setBaStatus('Upload at least one Before or After photo.', 'error');
    return;
  }
  setBaStatus('', '');
  showOverlay('Building your GIF...');

  try {
    const SIZE = 600;
    const FADE_FRAMES = 20;
    const speedVal   = parseInt(gifSpeedSlider.value);
    const holdMs     = Math.round(4000 - (speedVal - 1) * 625);
    const holdFrames = Math.max(4, Math.round(holdMs / 80));
    const frameDelay = 8; // x10 = 80ms per frame in gif.js

    /* ── Render a single branded canvas ── */
    async function renderFrame(imageUrl, label) {
      const canvas = document.createElement('canvas');
      canvas.width = canvas.height = SIZE;
      const ctx = canvas.getContext('2d');

      // Photo — cover fit
      await new Promise((res, rej) => {
        const img = new Image();
        img.onload = () => {
          const scale = Math.max(SIZE / img.width, SIZE / img.height);
          const w = img.width * scale, h = img.height * scale;
          ctx.drawImage(img, (SIZE-w)/2, (SIZE-h)/2, w, h);
          res();
        };
        img.onerror = rej;
        img.src = imageUrl;
      });

      // Navy gradient overlay
      const grad = ctx.createLinearGradient(0, SIZE * 0.42, 0, SIZE);
      grad.addColorStop(0, 'rgba(10,18,40,0)');
      grad.addColorStop(0.6, 'rgba(10,18,40,0.78)');
      grad.addColorStop(1, 'rgba(10,18,40,0.96)');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, SIZE, SIZE);

      // Before/After pill
      const isAfter = label === 'After';
      const pillW = isAfter ? 84 : 96;
      ctx.fillStyle = isAfter ? '#2E7D32' : '#0D1B3E';
      ctx.beginPath();
      const pr = 17, px = 18, py = 18, ph = 34;
      ctx.moveTo(px+pr,py); ctx.lineTo(px+pillW-pr,py);
      ctx.quadraticCurveTo(px+pillW,py,px+pillW,py+pr);
      ctx.lineTo(px+pillW,py+ph-pr);
      ctx.quadraticCurveTo(px+pillW,py+ph,px+pillW-pr,py+ph);
      ctx.lineTo(px+pr,py+ph); ctx.quadraticCurveTo(px,py+ph,px,py+ph-pr);
      ctx.lineTo(px,py+pr); ctx.quadraticCurveTo(px,py,px+pr,py);
      ctx.closePath(); ctx.fill();
      ctx.strokeStyle = '#4CAF50'; ctx.lineWidth = 1.5; ctx.stroke();
      ctx.fillStyle = '#F5F0E8';
      ctx.font = 'bold 12px Inter,sans-serif';
      ctx.textBaseline = 'middle'; ctx.textAlign = 'center';
      ctx.fillText(label.toUpperCase(), px + pillW/2, py + ph/2);
      ctx.textAlign = 'left';

      // DRC badge — bottom right
      const bSize = 88, bx = SIZE - bSize - 16, by = SIZE - bSize - 16;
      if (logoDataUrl) {
        await new Promise((res, rej) => {
          const logo = new Image();
          logo.onload = () => {
            ctx.save();
            ctx.beginPath();
            ctx.arc(bx+bSize/2, by+bSize/2, bSize/2, 0, Math.PI*2);
            ctx.clip();
            ctx.drawImage(logo, bx, by, bSize, bSize);
            ctx.restore();
            ctx.strokeStyle = '#0D1B3E'; ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.arc(bx+bSize/2, by+bSize/2, bSize/2+1, 0, Math.PI*2);
            ctx.stroke();
            res();
          };
          logo.onerror = rej;
          logo.src = logoDataUrl;
        });
      }

      // Company name + tagline
      const tx = 20;
      ctx.fillStyle = '#F5F0E8';
      ctx.font = 'bold 15px Inter,sans-serif';
      ctx.textBaseline = 'alphabetic';
      ctx.fillText(baCompanyName.value || 'DRC Maintenance', tx, SIZE - 28);
      if (baTagline.value.trim()) {
        ctx.fillStyle = 'rgba(245,240,232,0.6)';
        ctx.font = '500 10px Inter,sans-serif';
        ctx.fillText(baTagline.value, tx, SIZE - 14);
      }
      if (baCaption.value.trim()) {
        ctx.fillStyle = 'rgba(245,240,232,0.9)';
        ctx.font = '600 13px Inter,sans-serif';
        ctx.textBaseline = 'middle';
        ctx.fillText(baCaption.value, tx, SIZE - 82);
      }
      return canvas;
    }

    /* ── Pre-render all frames ── */
    const totalFrames = beforeImages.length + afterImages.length;
    document.querySelector('.ai-overlay-text').textContent = `Rendering ${totalFrames} photos...`;

    const beforeCanvases = [];
    for (let i = 0; i < beforeImages.length; i++) {
      document.querySelector('.ai-overlay-text').textContent = `Rendering before ${i+1}/${beforeImages.length}...`;
      beforeCanvases.push(await renderFrame(beforeImages[i], 'Before'));
    }
    const afterCanvases = [];
    for (let i = 0; i < afterImages.length; i++) {
      document.querySelector('.ai-overlay-text').textContent = `Rendering after ${i+1}/${afterImages.length}...`;
      afterCanvases.push(await renderFrame(afterImages[i], 'After'));
    }

    document.querySelector('.ai-overlay-text').textContent = 'Encoding GIF...';

    /* ── GIF worker path fix for GitHub Pages ── */
    const workerScript = (function() {
      const scripts = document.querySelectorAll('script[src]');
      for (const s of scripts) {
        if (s.src.includes('gif.js')) {
          return s.src.replace('gif.js', 'gif.worker.js');
        }
      }
      return 'libs/gif.worker.js';
    })();

    const gif = new GIF({
      workers: 2,
      quality: 8,
      width: SIZE,
      height: SIZE,
      workerScript
    });

    const fadeCanvas = document.createElement('canvas');
    fadeCanvas.width = fadeCanvas.height = SIZE;
    const fctx = fadeCanvas.getContext('2d');

    /* Build sequence: all befores then all afters with fades between each */
    const allCanvases = [...beforeCanvases, ...afterCanvases];

    for (let i = 0; i < allCanvases.length; i++) {
      const curr = allCanvases[i];
      const next = allCanvases[(i + 1) % allCanvases.length];

      // Hold on current
      for (let h = 0; h < holdFrames; h++) {
        gif.addFrame(curr, { delay: frameDelay * 10, copy: true });
      }

      // Fade to next
      for (let f = 0; f <= FADE_FRAMES; f++) {
        const alpha = f / FADE_FRAMES;
        fctx.clearRect(0, 0, SIZE, SIZE);
        fctx.globalAlpha = 1;
        fctx.drawImage(curr, 0, 0);
        fctx.globalAlpha = alpha;
        fctx.drawImage(next, 0, 0);
        fctx.globalAlpha = 1;
        gif.addFrame(fctx, { delay: frameDelay * 10, copy: true });
      }
    }

    gif.on('progress', p => {
      document.querySelector('.ai-overlay-text').textContent =
        `Encoding GIF... ${Math.round(p * 100)}%`;
    });

    gif.on('finished', blob => {
      hideOverlay();
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.download = 'drc-before-after.gif';
      link.href = url;
      link.click();
      setBaStatus(`GIF exported — ${beforeImages.length} before + ${afterImages.length} after photos.`, 'success');
    });

    gif.render();

  } catch(err) {
    hideOverlay();
    setBaStatus('Export failed: ' + err.message, 'error');
    console.error(err);
  }
};

/* ─── CANVAS HELPERS ─── */
function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x+r,y); ctx.lineTo(x+w-r,y);
  ctx.quadraticCurveTo(x+w,y,x+w,y+r);
  ctx.lineTo(x+w,y+h-r);
  ctx.quadraticCurveTo(x+w,y+h,x+w-r,y+h);
  ctx.lineTo(x+r,y+h);
  ctx.quadraticCurveTo(x,y+h,x,y+h-r);
  ctx.lineTo(x,y+r);
  ctx.quadraticCurveTo(x,y,x+r,y);
  ctx.closePath();
  ctx.fill();
}

function setBaStatus(msg, type) {
  if (!msg) { baStatus.classList.add('hidden'); return; }
  baStatus.textContent = msg;
  baStatus.className = 'bulk-status ' + type;
  baStatus.classList.remove('hidden');
}

/* ═══════════════════════════════════════════
   CAROUSEL MODULE
═══════════════════════════════════════════ */

/* ─── STATE ─── */
const MAX_SLIDES = 10;
let carouselSlides = [];   // array of slide objects
let activeSlideIdx = 0;
let carouselSize   = 'square'; // 'square' | 'portrait'
let carouselShowBranding = true;

const carouselPreview    = document.getElementById('carouselPreview');
const carouselFrame      = document.getElementById('carouselFrame');
const carouselStrip      = document.getElementById('carouselStrip');
const carouselPrev       = document.getElementById('carouselPrev');
const carouselNext       = document.getElementById('carouselNext');

/* Slide object shape:
  { type: 'photo'|'text',
    imageUrl: null|string,
    baLabel: null|'Before'|'After',
    caption: '',
    text: '',
    bgColor: '#000000' }
*/

function makeSlide() {
  return { type: 'photo', imageUrl: null, baLabel: null, caption: '', text: '', bgColor: '#000000' };
}

/* ─── INJECT CAROUSEL SIDEBAR ─── */
let carouselSidebarInjected = false;
let carouselSidebarEl = null;

function injectCarouselSidebar() {
  if (carouselSidebarInjected) return;
  const tpl = document.getElementById('carouselSidebarTpl');
  const panel = document.querySelector('.panel');
  carouselSidebarEl = document.createElement('div');
  carouselSidebarEl.id = 'carouselMode';
  carouselSidebarEl.className = 'hidden';
  carouselSidebarEl.innerHTML = tpl.innerHTML;
  panel.appendChild(carouselSidebarEl);
  carouselSidebarInjected = true;

  // Wire up controls inside the injected sidebar
  carouselSidebarEl.querySelector('#addSlideBtn').onclick = addSlide;
  carouselSidebarEl.querySelector('#carouselExportBtn').onclick = exportCarousel;
  carouselSidebarEl.querySelector('#carouselBranding').onchange = (e) => {
    carouselShowBranding = e.target.checked;
    renderActiveSlide();
  };

  // Size toggle
  carouselSidebarEl.querySelectorAll('.toggle [data-size]').forEach(btn => {
    btn.onclick = () => {
      carouselSidebarEl.querySelectorAll('.toggle [data-size]').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      carouselSize = btn.dataset.size;
      carouselFrame.style.height = carouselSize === 'portrait' ? '650px' : '520px';
      renderActiveSlide();
      renderStrip();
    };
  });

  // Add first slide automatically
  addSlide();
}

/* ─── PATCH SWITCH MODE ─── */
const _origSwitchMode = switchMode;
window.switchMode = function(mode) {
  // hide carousel sidebar
  if (carouselSidebarEl) carouselSidebarEl.classList.add('hidden');
  carouselPreview.classList.add('hidden');

  _origSwitchMode(mode);

  if (mode === 'carousel') {
    injectCarouselSidebar();
    carouselSidebarEl.classList.remove('hidden');
    // hide other panels
    document.getElementById('singleMode').classList.add('hidden');
    document.getElementById('bulkMode').classList.add('hidden');
    document.getElementById('beforeAfterMode').classList.add('hidden');
    document.getElementById('singlePreview').classList.add('hidden');
    document.getElementById('bulkPreviewGrid').classList.add('hidden');
    const bap = document.getElementById('baPreview');
    if (bap) bap.classList.add('hidden');
    carouselPreview.classList.remove('hidden');
    renderActiveSlide();
    renderStrip();
  }
};

// Re-wire tabs to use patched switchMode
tabs.forEach(t => { t.onclick = () => window.switchMode(t.dataset.mode); });

/* ─── SLIDE LIST RENDER ─── */
function renderSlideList() {
  const list = carouselSidebarEl.querySelector('#slideList');
  const countEl = carouselSidebarEl.querySelector('#slideCount');
  list.innerHTML = '';
  countEl.textContent = carouselSlides.length + ' / ' + MAX_SLIDES;

  carouselSlides.forEach((slide, i) => {
    const item = document.createElement('div');
    item.className = 'slide-item' + (i === activeSlideIdx ? ' active' : '');
    item.innerHTML = `
      <div class="slide-item-header">
        <span class="slide-num">${String(i+1).padStart(2,'0')}</span>
        <div class="slide-type-toggle">
          <button class="slide-type-btn ${slide.type==='photo'?'active':''}" data-type="photo">Photo</button>
          <button class="slide-type-btn ${slide.type==='text'?'active':''}" data-type="text">Text</button>
        </div>
        <div class="slide-move-btns">
          <button class="slide-move-btn" data-dir="up" ${i===0?'disabled':''}>↑</button>
          <button class="slide-move-btn" data-dir="down" ${i===carouselSlides.length-1?'disabled':''}>↓</button>
        </div>
        <button class="slide-remove-btn">×</button>
      </div>
      ${slide.type === 'photo' ? renderPhotoControls(slide, i) : renderTextControls(slide, i)}`;

    // Type toggle
    item.querySelectorAll('.slide-type-btn').forEach(btn => {
      btn.onclick = () => {
        slide.type = btn.dataset.type;
        setActive(i);
      };
    });

    // Move
    item.querySelectorAll('.slide-move-btn').forEach(btn => {
      btn.onclick = () => {
        const dir = btn.dataset.dir;
        const newIdx = dir === 'up' ? i - 1 : i + 1;
        if (newIdx < 0 || newIdx >= carouselSlides.length) return;
        [carouselSlides[i], carouselSlides[newIdx]] = [carouselSlides[newIdx], carouselSlides[i]];
        setActive(newIdx);
      };
    });

    // Remove
    item.querySelector('.slide-remove-btn').onclick = () => {
      carouselSlides.splice(i, 1);
      setActive(Math.min(i, carouselSlides.length - 1));
    };

    // Click to activate
    item.onclick = (e) => {
      if (e.target.tagName === 'BUTTON' || e.target.tagName === 'TEXTAREA' || e.target.tagName === 'INPUT') return;
      setActive(i);
    };

    wireSlideControls(item, slide, i);
    list.appendChild(item);
  });

  // Add slide btn visibility
  const addBtn = carouselSidebarEl.querySelector('#addSlideBtn');
  addBtn.disabled = carouselSlides.length >= MAX_SLIDES;
}

function renderPhotoControls(slide, i) {
  const thumbHtml = slide.imageUrl
    ? `<img src="${slide.imageUrl}" alt="">`
    : `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg><span>Upload photo</span>`;
  return `
    <div class="slide-photo-wrap">
      <label class="slide-photo-upload ${slide.imageUrl?'has-image':''}" id="slidePhoto${i}Label">
        <input type="file" id="slidePhoto${i}" accept="image/*">
        <div class="slide-photo-inner">${thumbHtml}</div>
      </label>
      <div class="slide-ba-toggle">
        <button class="slide-ba-btn ${slide.baLabel===null?'active-before':''}" data-ba="none">No Label</button>
        <button class="slide-ba-btn ${slide.baLabel==='Before'?'active-before':''}" data-ba="Before">Before</button>
        <button class="slide-ba-btn ${slide.baLabel==='After'?'active-after':''}" data-ba="After">After</button>
      </div>
      <input class="slide-caption-input" placeholder="Caption (optional)" value="${slide.caption}">
    </div>`;
}

function renderTextControls(slide, i) {
  const swatches = ['#000000','#0D1B3E','#1D9BF0','#2E7D32','#1a1a2e','#ffffff'];
  const swatchHtml = swatches.map(c =>
    `<div class="slide-bg-swatch ${slide.bgColor===c?'active':''}" data-color="${c}" style="background:${c};${c==='#ffffff'?'border:1px solid #333;':''}"></div>`
  ).join('') + `<div class="slide-bg-custom"><input type="color" value="${slide.bgColor}"></div>`;
  return `
    <div class="slide-text-wrap">
      <textarea class="slide-caption-input" placeholder="Slide text...">${slide.text}</textarea>
      <div class="slide-bg-row">${swatchHtml}</div>
    </div>`;
}

function wireSlideControls(item, slide, i) {
  if (slide.type === 'photo') {
    // Photo upload
    const photoInput = item.querySelector(`#slidePhoto${i}`);
    if (photoInput) {
      photoInput.onchange = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (ev) => {
          slide.imageUrl = ev.target.result;
          setActive(i);
        };
        reader.readAsDataURL(file);
      };
    }
    // BA label
    item.querySelectorAll('.slide-ba-btn').forEach(btn => {
      btn.onclick = (e) => {
        e.stopPropagation();
        slide.baLabel = btn.dataset.ba === 'none' ? null : btn.dataset.ba;
        setActive(i);
      };
    });
    // Caption
    const cap = item.querySelector('.slide-caption-input');
    if (cap) cap.oninput = () => { slide.caption = cap.value; renderActiveSlide(); };

  } else {
    // Text
    const ta = item.querySelector('textarea');
    if (ta) ta.oninput = () => { slide.text = ta.value; renderActiveSlide(); };
    // BG swatches
    item.querySelectorAll('.slide-bg-swatch').forEach(sw => {
      sw.onclick = (e) => {
        e.stopPropagation();
        slide.bgColor = sw.dataset.color;
        setActive(i);
      };
    });
    const customPicker = item.querySelector('.slide-bg-custom input');
    if (customPicker) customPicker.oninput = () => { slide.bgColor = customPicker.value; renderActiveSlide(); };
  }
}

function setActive(idx) {
  activeSlideIdx = Math.max(0, Math.min(idx, carouselSlides.length - 1));
  renderSlideList();
  renderActiveSlide();
  renderStrip();
  updateNavBtns();
}

function addSlide() {
  if (carouselSlides.length >= MAX_SLIDES) return;
  carouselSlides.push(makeSlide());
  setActive(carouselSlides.length - 1);
}

function updateNavBtns() {
  carouselPrev.disabled = activeSlideIdx === 0;
  carouselNext.disabled = activeSlideIdx >= carouselSlides.length - 1;
}

carouselPrev.onclick = () => setActive(activeSlideIdx - 1);
carouselNext.onclick = () => setActive(activeSlideIdx + 1);

/* ─── RENDER SLIDE TO CANVAS ─── */
async function renderSlideToCanvas(slide, W, H) {
  const canvas = document.createElement('canvas');
  canvas.width = W; canvas.height = H;
  const ctx = canvas.getContext('2d');

  if (slide.type === 'photo' && slide.imageUrl) {
    await new Promise((res, rej) => {
      const img = new Image();
      img.onload = () => {
        const scale = Math.max(W / img.width, H / img.height);
        const w = img.width * scale, h = img.height * scale;
        ctx.drawImage(img, (W-w)/2, (H-h)/2, w, h);
        res();
      };
      img.onerror = rej;
      img.src = slide.imageUrl;
    });

    // Gradient for text legibility
    if (slide.caption || slide.baLabel || carouselShowBranding) {
      const grad = ctx.createLinearGradient(0, H * 0.45, 0, H);
      grad.addColorStop(0, 'rgba(10,18,40,0)');
      grad.addColorStop(1, 'rgba(10,18,40,0.92)');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, W, H);
    }

    // BA label pill
    if (slide.baLabel) {
      const isAfter = slide.baLabel === 'After';
      const pillW = isAfter ? Math.round(W*0.14) : Math.round(W*0.16);
      const pillH = Math.round(H*0.055);
      const px = Math.round(W*0.03), py = Math.round(H*0.03), pr = pillH/2;
      ctx.fillStyle = isAfter ? '#2E7D32' : '#0D1B3E';
      ctx.beginPath();
      ctx.moveTo(px+pr,py); ctx.lineTo(px+pillW-pr,py);
      ctx.quadraticCurveTo(px+pillW,py,px+pillW,py+pr);
      ctx.lineTo(px+pillW,py+pillH-pr);
      ctx.quadraticCurveTo(px+pillW,py+pillH,px+pillW-pr,py+pillH);
      ctx.lineTo(px+pr,py+pillH); ctx.quadraticCurveTo(px,py+pillH,px,py+pillH-pr);
      ctx.lineTo(px,py+pr); ctx.quadraticCurveTo(px,py,px+pr,py);
      ctx.closePath(); ctx.fill();
      ctx.strokeStyle='#4CAF50'; ctx.lineWidth=1.5; ctx.stroke();
      ctx.fillStyle='#F5F0E8';
      ctx.font=`bold ${Math.round(H*0.02)}px Inter,sans-serif`;
      ctx.textBaseline='middle'; ctx.textAlign='center';
      ctx.fillText(slide.baLabel.toUpperCase(), px+pillW/2, py+pillH/2);
      ctx.textAlign='left';
    }

    // Caption
    if (slide.caption) {
      ctx.fillStyle='rgba(245,240,232,0.9)';
      ctx.font=`600 ${Math.round(H*0.022)}px Inter,sans-serif`;
      ctx.textBaseline='middle';
      ctx.fillText(slide.caption, Math.round(W*0.04), H - Math.round(H*0.14));
    }

  } else if (slide.type === 'text') {
    // Text slide background
    ctx.fillStyle = slide.bgColor || '#000';
    ctx.fillRect(0, 0, W, H);

    // Subtle vignette
    const vig = ctx.createRadialGradient(W/2,H/2,H*0.2,W/2,H/2,H*0.8);
    vig.addColorStop(0,'rgba(0,0,0,0)');
    vig.addColorStop(1,'rgba(0,0,0,0.35)');
    ctx.fillStyle = vig;
    ctx.fillRect(0,0,W,H);

    // Text — wrap it
    const textColor = slide.bgColor === '#ffffff' ? '#0f0f0f' : '#F5F0E8';
    ctx.fillStyle = textColor;
    const fontSize = Math.round(H * 0.052);
    ctx.font = `bold ${fontSize}px Inter,sans-serif`;
    ctx.textBaseline = 'top';
    const maxWidth = W * 0.84;
    const lineHeight = fontSize * 1.45;
    const lines = wrapText(ctx, slide.text || '', maxWidth);
    const totalH = lines.length * lineHeight;
    let ty = (H - totalH) / 2;
    lines.forEach(line => {
      ctx.fillText(line, W * 0.08, ty);
      ty += lineHeight;
    });
  } else {
    // Empty placeholder
    ctx.fillStyle = '#0D0D15';
    ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = 'rgba(255,255,255,0.15)';
    ctx.font = `500 ${Math.round(H*0.025)}px Inter,sans-serif`;
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText('Upload a photo or add text', W/2, H/2);
    ctx.textAlign = 'left';
  }

  // DRC badge — bottom right (all slides)
  if (carouselShowBranding && logoDataUrl) {
    const bSize = Math.round(W * 0.13);
    const bx = W - bSize - Math.round(W*0.025);
    const by = H - bSize - Math.round(H*0.025);
    await new Promise((res, rej) => {
      const logo = new Image();
      logo.onload = () => {
        ctx.save();
        ctx.beginPath();
        ctx.arc(bx+bSize/2, by+bSize/2, bSize/2, 0, Math.PI*2);
        ctx.clip();
        ctx.drawImage(logo, bx, by, bSize, bSize);
        ctx.restore();
        ctx.strokeStyle='#0D1B3E'; ctx.lineWidth=3;
        ctx.beginPath();
        ctx.arc(bx+bSize/2, by+bSize/2, bSize/2+1, 0, Math.PI*2);
        ctx.stroke();
        res();
      };
      logo.onerror = rej;
      logo.src = logoDataUrl;
    });
  }

  // Slide number indicator — bottom left (small)
  const slideNum = carouselSlides.indexOf(slide) + 1;
  if (slideNum > 0) {
    ctx.fillStyle = 'rgba(245,240,232,0.45)';
    ctx.font = `500 ${Math.round(H*0.018)}px Inter,sans-serif`;
    ctx.textBaseline = 'alphabetic';
    ctx.fillText(`${slideNum} / ${carouselSlides.length}`, Math.round(W*0.04), H - Math.round(H*0.03));
  }

  return canvas;
}

/* ─── TEXT WRAP HELPER ─── */
function wrapText(ctx, text, maxWidth) {
  const paragraphs = text.split('\n');
  const lines = [];
  paragraphs.forEach(para => {
    if (!para.trim()) { lines.push(''); return; }
    const words = para.split(' ');
    let current = '';
    words.forEach(word => {
      const test = current ? current + ' ' + word : word;
      if (ctx.measureText(test).width > maxWidth && current) {
        lines.push(current);
        current = word;
      } else { current = test; }
    });
    if (current) lines.push(current);
  });
  return lines;
}

/* ─── RENDER ACTIVE SLIDE TO PREVIEW ─── */
async function renderActiveSlide() {
  if (!carouselSlides.length) return;
  const slide = carouselSlides[activeSlideIdx];
  const W = 520, H = carouselSize === 'portrait' ? 650 : 520;
  const canvas = await renderSlideToCanvas(slide, W, H);
  carouselFrame.innerHTML = '';
  canvas.className = 'carousel-slide-canvas';
  carouselFrame.appendChild(canvas);
  updateNavBtns();
}

/* ─── RENDER STRIP THUMBNAILS ─── */
async function renderStrip() {
  carouselStrip.innerHTML = '';
  for (let i = 0; i < carouselSlides.length; i++) {
    const slide = carouselSlides[i];
    const canvas = await renderSlideToCanvas(slide, 112, 112);
    const wrap = document.createElement('div');
    wrap.className = 'strip-thumb' + (i === activeSlideIdx ? ' active' : '');
    const img = document.createElement('img');
    img.src = canvas.toDataURL();
    const num = document.createElement('div');
    num.className = 'strip-thumb-num';
    num.textContent = i + 1;
    wrap.appendChild(img);
    wrap.appendChild(num);
    wrap.onclick = () => setActive(i);
    carouselStrip.appendChild(wrap);
  }
}

/* ─── EXPORT ALL SLIDES ─── */
async function exportCarousel() {
  if (!carouselSlides.length) return;
  const statusEl = carouselSidebarEl.querySelector('#carouselStatus');
  statusEl.textContent = 'Exporting...';
  statusEl.className = 'bulk-status';
  statusEl.classList.remove('hidden');
  showOverlay('Exporting slides...');

  const W = 1080, H = carouselSize === 'portrait' ? 1350 : 1080;

  for (let i = 0; i < carouselSlides.length; i++) {
    document.querySelector('.ai-overlay-text').textContent =
      `Exporting slide ${i+1} of ${carouselSlides.length}...`;
    const canvas = await renderSlideToCanvas(carouselSlides[i], W, H);
    const link = document.createElement('a');
    link.download = `slide-${String(i+1).padStart(2,'0')}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
    await new Promise(r => setTimeout(r, 300));
  }

  hideOverlay();
  statusEl.textContent = `${carouselSlides.length} slides exported.`;
  statusEl.className = 'bulk-status success';
}
