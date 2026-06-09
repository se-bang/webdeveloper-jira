import { renderComments, renderPage } from './render.js';

let issueData = null;
let draftBeforeFocus = '';

let commentInput;
let commentActions;
let saveButton;
let cancelButton;

init();

async function init() {
  try {
    const [issueRes, commentsRes] = await Promise.all([
      fetch('data/issue.json'),
      fetch('data/comments.json'),
    ]);

    if (!issueRes.ok) throw new Error('issue load failed');
    if (!commentsRes.ok) throw new Error('comments load failed');

    issueData = await issueRes.json();
    const commentsData = await commentsRes.json();

    renderPage(issueData);
    bindAttachmentLightbox();
    bindCommentUi();
    renderComments(commentsData.comments || []);
  } catch (err) {
    document.getElementById('issue-main').innerHTML =
      '<p class="activity-empty">이슈 데이터를 불러오지 못했습니다.</p>';
    console.error(err);
  }
}

function bindAttachmentLightbox() {
  const lightbox = document.getElementById('attachment-lightbox');
  const img = document.getElementById('attachment-lightbox-img');
  const caption = document.getElementById('attachment-lightbox-caption');

  document.querySelectorAll('[data-attachment-src]').forEach((card) => {
    card.addEventListener('click', () => {
      openAttachmentLightbox(card.dataset.attachmentSrc, card.dataset.attachmentName);
    });
  });

  lightbox.querySelector('.attachment-lightbox-backdrop').addEventListener('click', closeAttachmentLightbox);
  lightbox.querySelector('.attachment-lightbox-close').addEventListener('click', closeAttachmentLightbox);

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && !lightbox.hidden) {
      closeAttachmentLightbox();
    }
  });

  function openAttachmentLightbox(src, name) {
    img.src = src;
    img.alt = name;
    caption.textContent = name;
    lightbox.hidden = false;
    document.body.classList.add('lightbox-open');
    lightbox.querySelector('.attachment-lightbox-close').focus();
  }

  function closeAttachmentLightbox() {
    lightbox.hidden = true;
    document.body.classList.remove('lightbox-open');
    img.removeAttribute('src');
    caption.textContent = '';
  }
}

function bindCommentUi() {
  const composeAvatar = document.getElementById('compose-avatar');
  commentInput = document.getElementById('comment-input');
  commentActions = document.getElementById('comment-actions');
  const commentsPanel = document.getElementById('comments-panel');
  const activityPlaceholder = document.getElementById('activity-placeholder');
  saveButton = document.getElementById('comment-save');
  cancelButton = document.getElementById('comment-cancel');

  const profileInitials = issueData.nav?.profileInitials || 'CD';
  composeAvatar.textContent = profileInitials;

  saveButton.addEventListener('click', submitComment);
  cancelButton.addEventListener('click', cancelCompose);

  commentInput.addEventListener('focus', () => {
    draftBeforeFocus = commentInput.value;
    commentActions.hidden = false;
  });

  commentInput.addEventListener('keydown', (event) => {
    const isMetaEnter = (event.metaKey || event.ctrlKey) && event.key === 'Enter';
    const isAltM = event.altKey && (event.key === 'm' || event.key === 'M');

    if (isMetaEnter || isAltM) {
      event.preventDefault();
      submitComment();
    }
  });

  const quickReplyMap = Object.fromEntries(
    issueData.activity.quickReplies.map((reply) => [reply.key, reply.text]),
  );

  document.querySelectorAll('[data-quick-reply]').forEach((button) => {
    button.addEventListener('click', () => {
      commentInput.value = quickReplyMap[button.dataset.quickReply] || '';
      commentInput.focus();
      commentActions.hidden = false;
    });
  });

  document.querySelectorAll('.activity-tab').forEach((tab) => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.activity-tab').forEach((item) => {
        item.classList.remove('is-active');
        item.setAttribute('aria-selected', 'false');
      });
      tab.classList.add('is-active');
      tab.setAttribute('aria-selected', 'true');
      showActivityTab(tab.dataset.tab, commentsPanel, activityPlaceholder);
    });
  });
}

function showActivityTab(tab, commentsPanel, activityPlaceholder) {
  const isComments = tab === 'comments';
  commentsPanel.hidden = !isComments;
  activityPlaceholder.hidden = isComments;
}

function submitComment() {
  const text = commentInput.value.trim();
  if (!text) return;

  showToast('아직 기능이 추가되지 않았습니다.');
}

function cancelCompose() {
  commentInput.value = draftBeforeFocus;
  commentActions.hidden = true;
  commentInput.blur();
}

function showToast(message) {
  const toast = document.getElementById('toast');
  toast.textContent = message;
  toast.hidden = false;
  clearTimeout(showToast._timer);
  showToast._timer = setTimeout(() => {
    toast.hidden = true;
  }, 1500);
}
