const cards = document.querySelectorAll('.glow-card');
const form = document.getElementById('post-form');
const draftButton = document.getElementById('open-draft');
const statusEl = document.getElementById('publish-status');

function setYear() {
  const target = document.getElementById('year');
  if (target) target.textContent = new Date().getFullYear();
}

function updateCardPointer(card, clientX, clientY) {
  const rect = card.getBoundingClientRect();
  const x = ((clientX - rect.left) / rect.width) * 100;
  const y = ((clientY - rect.top) / rect.height) * 100;
  const clampedX = Math.max(0, Math.min(100, x));
  const clampedY = Math.max(0, Math.min(100, y));

  card.style.setProperty('--pointer-x', clampedX + '%');
  card.style.setProperty('--pointer-y', clampedY + '%');
}

function enablePointerGlow() {
  const canHover = window.matchMedia('(hover: hover)').matches;

  if (!canHover) {
    cards.forEach((card) => {
      card.style.setProperty('--pointer-x', '50%');
      card.style.setProperty('--pointer-y', '50%');
    });
    return;
  }

  cards.forEach((card) => {
    card.addEventListener('pointermove', (event) => {
      updateCardPointer(card, event.clientX, event.clientY);
    });

    card.addEventListener('pointerleave', () => {
      card.style.setProperty('--pointer-x', '50%');
      card.style.setProperty('--pointer-y', '50%');
    });
  });
}

function revealCards() {
  cards.forEach((card, index) => {
    card.style.opacity = '0';
    card.style.transform = 'translateY(18px)';

    setTimeout(() => {
      card.style.transition = 'opacity 360ms ease, transform 360ms ease, box-shadow 280ms ease';
      card.style.opacity = '1';
      card.style.transform = 'translateY(0)';
    }, index * 90);
  });
}

function splitLines(value) {
  return value
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);
}

function buildIssueBody(data) {
  const sections = [];
  sections.push(data.content || '');

  if (data.coverUrl) {
    sections.push('## 封面图\n\n![](' + data.coverUrl + ')');
  }

  if (data.galleryUrls.length) {
    const gallery = data.galleryUrls.map((url) => '![](' + url + ')').join('\n\n');
    sections.push('## 图片集\n\n' + gallery);
  }

  if (data.videoUrl) {
    sections.push('## 视频\n\n<video controls src="' + data.videoUrl + '" style="width:100%;max-width:760px;border-radius:10px;"></video>');
  }

  if (data.audioUrl) {
    sections.push('## 音频\n\n<audio controls src="' + data.audioUrl + '" style="width:100%;max-width:760px;"></audio>');
  }

  return sections.join('\n\n---\n\n');
}

function getFormData() {
  const raw = new FormData(form);
  return {
    repoOwner: String(raw.get('repoOwner') || '').trim(),
    repoName: String(raw.get('repoName') || '').trim(),
    token: String(raw.get('token') || '').trim(),
    title: String(raw.get('title') || '').trim(),
    labels: String(raw.get('labels') || ''),
    coverUrl: String(raw.get('coverUrl') || '').trim(),
    galleryUrls: splitLines(String(raw.get('galleryUrls') || '')),
    videoUrl: String(raw.get('videoUrl') || '').trim(),
    audioUrl: String(raw.get('audioUrl') || '').trim(),
    content: String(raw.get('content') || '').trim(),
  };
}

function setStatus(text, isError) {
  statusEl.textContent = text;
  statusEl.style.color = isError ? '#9f1b1b' : '#2c4666';
}

function buildDraftUrl(data) {
  const issueBody = buildIssueBody(data);
  const params = new URLSearchParams();
  params.set('title', data.title);
  params.set('body', issueBody);
  if (data.labels.trim()) {
    params.set('labels', data.labels);
  }
  return (
    'https://github.com/' +
    data.repoOwner +
    '/' +
    data.repoName +
    '/issues/new?' +
    params.toString()
  );
}

async function publishIssue(event) {
  event.preventDefault();
  const data = getFormData();

  if (!data.repoOwner || !data.repoName || !data.title || !data.content) {
    setStatus('请先填写仓库、标题和正文。', true);
    return;
  }

  if (!data.token) {
    setStatus('未填写 Token，已为你准备草稿页。', false);
    window.open(buildDraftUrl(data), '_blank', 'noopener,noreferrer');
    return;
  }

  const issueBody = buildIssueBody(data);
  const payload = {
    title: data.title,
    body: issueBody,
    labels: data.labels
      .split(',')
      .map((label) => label.trim())
      .filter(Boolean),
  };

  setStatus('正在发布到 GitHub Issue...', false);

  try {
    const response = await fetch(
      'https://api.github.com/repos/' + data.repoOwner + '/' + data.repoName + '/issues',
      {
        method: 'POST',
        headers: {
          Accept: 'application/vnd.github+json',
          Authorization: 'Bearer ' + data.token,
          'X-GitHub-Api-Version': '2022-11-28',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      }
    );

    const result = await response.json();
    if (!response.ok) {
      const detail = result && result.message ? result.message : '未知错误';
      throw new Error(detail);
    }

    setStatus('发布成功：' + result.html_url, false);
    form.reset();
    document.getElementById('repo-owner').value = data.repoOwner;
    document.getElementById('repo-name').value = data.repoName;
  } catch (error) {
    setStatus('发布失败：' + error.message + '。你可以改用“打开 GitHub 草稿页”。', true);
  }
}

function openDraftPage() {
  const data = getFormData();
  if (!data.repoOwner || !data.repoName || !data.title) {
    setStatus('请先填写仓库和标题，再打开草稿页。', true);
    return;
  }

  const url = buildDraftUrl(data);
  window.open(url, '_blank', 'noopener,noreferrer');
  setStatus('已打开 GitHub 草稿页。', false);
}

setYear();
enablePointerGlow();
revealCards();

if (form) {
  form.addEventListener('submit', publishIssue);
}

if (draftButton) {
  draftButton.addEventListener('click', openDraftPage);
}
