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

/* ─── MODE TOGGLE ─── */
tabs.forEach(t => {
  t.onclick = () => {
    tabs.forEach(x => x.classList.remove('active'));
    t.classList.add('active');
    const mode = t.dataset.mode;
    if (mode === 'single') {
      singleMode.classList.remove('hidden');
      bulkMode.classList.add('hidden');
      singlePreview.classList.remove('hidden');
      bulkPreviewGrid.classList.add('hidden');
    } else {
      bulkMode.classList.remove('hidden');
      singleMode.classList.add('hidden');
    }
  };
});

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
