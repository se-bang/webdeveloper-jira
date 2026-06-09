export function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function icon(name, size = 16, className = '') {
  const cls = ['icon', `icon-${size}`, className].filter(Boolean).join(' ');
  return `<span class="${cls}"><svg><use href="icons.svg#icon-${name}"/></svg></span>`;
}

function renderUserChip(user) {
  return `
    <span class="user-chip">
      <span class="avatar avatar-sm avatar-${escapeHtml(user.color)}">${escapeHtml(user.initials)}</span>
      <span class="user-chip-text">${escapeHtml(user.name)}</span>
    </span>
  `;
}

function renderDetailValue(field) {
  switch (field.type) {
    case 'user':
      return renderUserChip(field.user);
    case 'labels': {
      if (field.variant === 'outline') {
        return field.items
          .map((item) => `<span class="lozenge lozenge-outline">${escapeHtml(item)}</span>`)
          .join('');
      }
      return field.items
        .map((item) => `<span class="lozenge">${escapeHtml(item)}</span>`)
        .join('');
    }
    case 'priority':
      return `
        <span class="user-chip">
          ${icon(field.icon, 16, 'icon-blue')}
          ${escapeHtml(field.value)}
        </span>
      `;
    default:
      return escapeHtml(field.value ?? '');
  }
}

function renderDetailRow(field) {
  if (field.type === 'users') {
    return `
      <div class="detail-row">
        <span class="detail-label">${escapeHtml(field.label)}</span>
        <span class="detail-value detail-value-stack">
          ${field.users.map(renderUserChip).join('')}
        </span>
      </div>
    `;
  }

  return `
    <div class="detail-row">
      <span class="detail-label">${escapeHtml(field.label)}</span>
      <span class="detail-value">${renderDetailValue(field)}</span>
    </div>
  `;
}

function renderCollapsePanel(section) {
  const trailing = section.linkText
    ? `<span class="collapse-link">${escapeHtml(section.linkText)}</span>`
    : section.suffix
      ? `<span class="collapse-sub">${escapeHtml(section.suffix)}</span>`
      : '';
  const inlineIcon = section.inlineIcon
    ? icon(section.inlineIcon, 16, section.inlineIconClass || '')
    : '';

  return `
    <div class="context-panel">
      <button class="context-panel-toggle" type="button">
        ${icon('chevron-right', 16, 'panel-chevron')}
        <span class="context-panel-label">${escapeHtml(section.label)}</span>
        ${inlineIcon}
        ${trailing}
      </button>
    </div>
  `;
}

function renderAttachments(attachments) {
  return attachments
    .map(
      (file) => `
        <button
          type="button"
          class="attachment-card"
          data-attachment-src="${escapeHtml(file.src)}"
          data-attachment-name="${escapeHtml(file.name)}"
          aria-label="${escapeHtml(file.name)} 보기"
        >
          <div class="attachment-thumb-wrap">
            <img class="attachment-thumb" src="${escapeHtml(file.src)}" alt="" />
          </div>
          <div class="attachment-meta">
            <div class="attachment-name">${escapeHtml(file.name)}</div>
            <div class="attachment-sub">${escapeHtml(file.date)}</div>
          </div>
        </button>
      `,
    )
    .join('');
}

function renderActivityTabs(tabs) {
  return tabs
    .map((tab) => {
      const active = tab.active ? ' is-active' : '';
      const selected = tab.active ? ' aria-selected="true"' : ' aria-selected="false"';
      return `<button class="activity-tab${active}" type="button" role="tab" data-tab="${escapeHtml(tab.id)}"${selected}>${escapeHtml(tab.label)}</button>`;
    })
    .join('');
}

function renderQuickReplies(replies) {
  return replies
    .map(
      (reply) =>
        `<button class="quick-reply" type="button" data-quick-reply="${escapeHtml(reply.key)}">${escapeHtml(reply.label)}</button>`,
    )
    .join('');
}

function formatCommentDate(iso) {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '';

  return new Intl.DateTimeFormat('ko-KR', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  }).format(date);
}

export function renderComments(comments) {
  const list = document.getElementById('comment-list');
  if (!list) return;

  if (!comments.length) {
    list.innerHTML = '';
    return;
  }

  list.innerHTML = comments
    .map((comment) => {
      const date = formatCommentDate(comment.createdAt);
      return `
        <article class="comment-item">
          <div class="avatar avatar-sm avatar-${escapeHtml(comment.author.color)}">${escapeHtml(comment.author.initials)}</div>
          <div class="comment-body">
            <div class="comment-header">
              <span class="comment-author">${escapeHtml(comment.author.name)}</span>
              <span class="comment-date">${date}</span>
            </div>
            <div class="comment-text">${escapeHtml(comment.text)}</div>
          </div>
        </article>
      `;
    })
    .join('');
}

export function renderNav(issue) {
  const nav = issue.nav;
  document.getElementById('nav-search').placeholder = nav.searchPlaceholder;
  document.getElementById('nav-search').setAttribute('aria-label', nav.searchPlaceholder);
  document.getElementById('nav-create-label').textContent = nav.createLabel;
  document.getElementById('nav-rovo-label').textContent = nav.rovoLabel;

  const notificationBadge = document.getElementById('nav-notification-badge');
  if (nav.notificationCount) {
    notificationBadge.textContent = nav.notificationCount;
    notificationBadge.hidden = false;
  } else {
    notificationBadge.hidden = true;
  }

  const helpBadge = document.getElementById('nav-help-badge');
  if (nav.helpCount) {
    helpBadge.textContent = nav.helpCount;
    helpBadge.hidden = false;
  } else {
    helpBadge.hidden = true;
  }
}

export function renderIssueMain(issue) {
  const main = document.getElementById('issue-main');
  const bc = issue.breadcrumb;
  const sections = issue.sections;
  const activity = issue.activity;

  main.innerHTML = `
    <div class="breadcrumb-bar">
      <span class="breadcrumb-label">${escapeHtml(bc.spaceLabel)}</span>
      <span class="breadcrumb-sep">/</span>
      <a class="breadcrumb-project" href="#">
        ${icon('book', 16, 'icon-purple')}
        ${escapeHtml(bc.project.name)}
      </a>
      <span class="breadcrumb-sep">/</span>
      <button class="breadcrumb-link" type="button">${escapeHtml(bc.parentAction)}</button>
      <span class="breadcrumb-sep">/</span>
      <span class="breadcrumb-key-wrap">
        <span class="issue-type-icon">${icon('bug', 12, 'icon-inverse')}</span>
        <span class="breadcrumb-key">${escapeHtml(bc.issueKey)}</span>
      </span>
    </div>

    <h1 class="issue-title">${escapeHtml(issue.title)}</h1>

    <div class="issue-actions">
      <button class="icon-btn" type="button" aria-label="추가">
        ${icon('add', 16)}
      </button>
      <button class="icon-btn" type="button" aria-label="설정">
        ${icon('settings', 16)}
      </button>
    </div>

    <section class="section">
      <div class="section-header">
        ${icon('chevron-down', 16, 'section-chevron')}
        <h2 class="section-title">${escapeHtml(sections.details)}</h2>
      </div>
      <div class="section-body">
        <div class="field-row">
          <div class="field-label">${escapeHtml(sections.description)}</div>
          <div class="field-value description">${escapeHtml(issue.description)}</div>
        </div>
        <div class="field-row">
          <div class="field-label">${escapeHtml(sections.environment)}</div>
          <div class="field-value">${escapeHtml(issue.environment)}</div>
        </div>
      </div>
    </section>

    <section class="section">
      <div class="section-header">
        ${icon('chevron-down', 16, 'section-chevron')}
        <h2 class="section-title">${escapeHtml(sections.attachments)}</h2>
        <span class="section-count">${issue.attachments.length}</span>
        <div class="section-header-actions">
          <button class="icon-btn section-menu" type="button" aria-label="더 보기">
            ${icon('more', 16)}
          </button>
          <button class="icon-btn section-add" type="button" aria-label="첨부 파일 추가">
            ${icon('add', 16)}
          </button>
        </div>
      </div>
      <div class="section-body">
        ${renderAttachments(issue.attachments)}
      </div>
    </section>

    <section class="section section--linked">
      <div class="section-header section-header--plain">
        <h2 class="section-title">${escapeHtml(sections.linkedIssues)}</h2>
      </div>
      <div class="section-body">
        <button class="link-add" type="button">
          ${icon('add', 16)}
          ${escapeHtml(issue.linkedIssues.addLabel)}
        </button>
      </div>
    </section>

    <section class="section">
      <div class="section-header section-header--agent">
        ${icon('chevron-down', 16, 'section-chevron')}
        <h2 class="section-title">${escapeHtml(sections.agent)}</h2>
        <span class="agent-header-hint">
          ${icon('question', 16, 'icon-subtle')}
          ${escapeHtml(issue.agent.text)}
        </span>
      </div>
      <div class="section-body">
        <div class="agent-box">
          <button class="btn-success" type="button">
            <span class="btn-success-play" aria-hidden="true"></span>
            ${escapeHtml(issue.agent.buttonLabel)}
            ${icon('chevron-down', 16)}
          </button>
        </div>
      </div>
    </section>

    <section class="section">
      <div class="section-header">
        ${icon('chevron-down', 16, 'section-chevron')}
        <h2 class="section-title">${escapeHtml(sections.activity)}</h2>
      </div>
      <div class="section-body activity-body">
        <div class="activity-tabs-wrap">
          <div class="activity-tabs" role="tablist">
            ${renderActivityTabs(activity.tabs)}
          </div>
          <button class="icon-btn activity-sort" type="button" aria-label="정렬">
            ${icon('sort', 16)}
          </button>
        </div>

        <div id="comments-panel">
          <div class="comment-compose">
            <div id="compose-avatar" class="avatar avatar-orange"></div>
            <div class="comment-input-wrap">
              <div class="comment-input-shell">
                <textarea id="comment-input" class="comment-input" placeholder="${escapeHtml(activity.composePlaceholder)}" aria-label="${escapeHtml(activity.composePlaceholder)}"></textarea>
                <div class="quick-replies">
                  ${renderQuickReplies(activity.quickReplies)}
                </div>
              </div>
              <div id="comment-actions" class="comment-actions" hidden>
                <button id="comment-save" class="btn-save" type="button">저장</button>
                <button id="comment-cancel" class="btn-cancel" type="button">취소</button>
              </div>
              <p class="comment-tip">전문가 팁: <kbd>Alt</kbd> + <kbd>M</kbd>을 눌러서 댓글 추가</p>
            </div>
          </div>
          <div id="comment-list" class="comment-list"></div>
        </div>

        <p id="activity-placeholder" class="activity-empty" hidden>${escapeHtml(activity.unsupportedMessage)}</p>
      </div>
    </section>
  `;
}

export function renderIssueContext(issue) {
  const ctx = issue.context;
  const aside = document.getElementById('issue-context');

  aside.innerHTML = `
    <div class="context-top-actions">
      <span class="context-top-spacer" aria-hidden="true"></span>
      <button class="context-action-btn context-watcher" type="button" aria-label="관찰자">
        ${icon('eye', 16)}
        <span>${escapeHtml(String(ctx.watcherCount ?? 2))}</span>
      </button>
      <button class="context-action-btn" type="button" aria-label="공유">
        ${icon('share', 16)}
      </button>
      <button class="context-action-btn" type="button" aria-label="더 보기">
        ${icon('more', 16)}
      </button>
    </div>

    <div class="context-status-row">
      <button class="status-lozenge" type="button">
        ${escapeHtml(ctx.status)}
        ${icon('chevron-down', 16)}
      </button>
      <button class="btn-context-icon" type="button" aria-label="자동화">
        ${icon('automation', 16)}
      </button>
      <button class="btn-bug-improve" type="button" title="${escapeHtml(ctx.bugImproveLabel)}">
        ${icon('star', 16, 'icon-purple')}
        ${escapeHtml(ctx.bugImproveLabel)}
      </button>
    </div>

    <div class="context-panel is-expanded">
      <button class="context-panel-header" type="button" aria-expanded="true">
        ${icon('chevron-down', 16, 'panel-chevron')}
        <span class="context-panel-label">${escapeHtml(ctx.detailsHeading)}</span>
      </button>
      <div class="context-panel-body">
        ${ctx.fields.map(renderDetailRow).join('')}
      </div>
    </div>

    <div class="context-panels">
      ${ctx.collapseSections.map(renderCollapsePanel).join('')}
    </div>

    <div class="context-meta">
      <div>${escapeHtml(ctx.meta.created)}</div>
      <div>${escapeHtml(ctx.meta.updated)}</div>
    </div>
  `;
}

export function renderPage(issue) {
  document.title = issue.pageTitle;
  renderNav(issue);
  renderIssueMain(issue);
  renderIssueContext(issue);
}
