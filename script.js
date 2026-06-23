/* ═══════════════════════════════════════════
   Islamic TechFest — Design Request Portal
   JavaScript Controller (with Request List)
   ═══════════════════════════════════════════ */

document.addEventListener('DOMContentLoaded', () => {
  // ── Init ──
  createParticles();
  addShakeKeyframe();

  // ── Elements ──
  const form = document.getElementById('requestForm');
  const submitBtn = document.getElementById('submitBtn');
  const successModal = document.getElementById('successModal');
  const modalCloseBtn = document.getElementById('modalCloseBtn');
  const modalSummary = document.getElementById('modalSummary');
  const charCount = document.getElementById('charCount');
  const keteranganField = document.getElementById('keterangan');

  // List Elements
  const requestCards = document.getElementById('requestCards');
  const requestCount = document.getElementById('requestCount');
  const emptyState = document.getElementById('emptyState');
  const noResultState = document.getElementById('noResultState');
  const searchInput = document.getElementById('searchInput');
  const filterDivisi = document.getElementById('filterDivisi');
  const btnClearAll = document.getElementById('btnClearAll');

  // Delete Modal Elements
  const deleteModal = document.getElementById('deleteModal');
  const deleteModalDesc = document.getElementById('deleteModalDesc');
  const deleteCancelBtn = document.getElementById('deleteCancelBtn');
  const deleteConfirmBtn = document.getElementById('deleteConfirmBtn');

  let deleteTarget = null; // stores what to delete
  let allRequests = loadRequests();

  // ── Initial Render ──
  renderRequestList();

  // ── Character Counter ──
  keteranganField.setAttribute('maxlength', '1000');
  keteranganField.addEventListener('input', () => {
    const len = keteranganField.value.length;
    charCount.textContent = `${len} / 1000`;
    if (len > 1000) charCount.style.color = '#e74c3c';
    else if (len > 800) charCount.style.color = 'rgba(212, 175, 55, 0.8)';
    else charCount.style.color = 'var(--text-muted)';
  });

  // ── Real-time Validation Clear ──
  const fields = ['nama', 'divisi', 'request', 'keterangan'];
  fields.forEach(fieldName => {
    const el = document.getElementById(fieldName);
    const events = el.tagName === 'SELECT' ? ['change'] : ['input', 'focus'];
    events.forEach(evt => {
      el.addEventListener(evt, () => {
        el.closest('.form-group').classList.remove('error');
      });
    });
  });

  // ── Form Submit ──
  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      const firstError = form.querySelector('.form-group.error');
      if (firstError) {
        shakeElement(firstError);
        firstError.querySelector('input, select, textarea').focus();
      }
      return;
    }

    const formData = {
      id: generateId(),
      nama: document.getElementById('nama').value.trim(),
      divisi: document.getElementById('divisi').value,
      request: document.getElementById('request').value.trim(),
      keterangan: document.getElementById('keterangan').value.trim(),
      timestamp: new Date().toLocaleString('id-ID', {
        dateStyle: 'full',
        timeStyle: 'short'
      }),
      createdAt: Date.now(),
      status: 'pending'
    };

    submitBtn.classList.add('loading');
    await delay(1500);

    allRequests.unshift(formData);
    saveRequests(allRequests);
    renderRequestList();

    submitBtn.classList.remove('loading');
    showSuccessModal(formData);

    form.reset();
    charCount.textContent = '0 / 1000';
  });

  // ── Success Modal ──
  modalCloseBtn.addEventListener('click', closeSuccessModal);
  successModal.addEventListener('click', (e) => {
    if (e.target === successModal) closeSuccessModal();
  });

  // ── Search & Filter ──
  searchInput.addEventListener('input', renderRequestList);
  filterDivisi.addEventListener('change', renderRequestList);

  // ── Clear All ──
  btnClearAll.addEventListener('click', () => {
    if (allRequests.length === 0) return;
    deleteTarget = { type: 'all' };
    deleteModalDesc.textContent = `Yakin mau menghapus semua ${allRequests.length} request? Aksi ini tidak bisa dibatalkan.`;
    deleteModal.classList.add('active');
    document.body.style.overflow = 'hidden';
  });

  // ── Delete Modal Controls ──
  deleteCancelBtn.addEventListener('click', closeDeleteModal);
  deleteModal.addEventListener('click', (e) => {
    if (e.target === deleteModal) closeDeleteModal();
  });

  deleteConfirmBtn.addEventListener('click', () => {
    if (!deleteTarget) return;

    if (deleteTarget.type === 'all') {
      allRequests = [];
    } else if (deleteTarget.type === 'single') {
      allRequests = allRequests.filter(r => r.id !== deleteTarget.id);
    }

    saveRequests(allRequests);
    renderRequestList();
    closeDeleteModal();
  });

  // ── ESC Key ──
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      if (deleteModal.classList.contains('active')) closeDeleteModal();
      else if (successModal.classList.contains('active')) closeSuccessModal();
    }
  });

  // ══════════════════════
  //  FUNCTIONS
  // ══════════════════════

  function validateForm() {
    let valid = true;
    const checks = [
      { id: 'nama', check: (v) => v.trim() !== '' },
      { id: 'divisi', check: (v) => v !== '' },
      { id: 'request', check: (v) => v.trim() !== '' },
      { id: 'keterangan', check: (v) => v.trim() !== '' }
    ];

    checks.forEach(({ id, check }) => {
      const el = document.getElementById(id);
      const group = el.closest('.form-group');
      if (!check(el.value)) {
        group.classList.add('error');
        valid = false;
      } else {
        group.classList.remove('error');
      }
    });

    return valid;
  }

  function showSuccessModal(data) {
    modalSummary.innerHTML = `
      <div class="summary-row">
        <span class="summary-label">Nama</span>
        <span class="summary-value">${esc(data.nama)}</span>
      </div>
      <div class="summary-row">
        <span class="summary-label">Divisi</span>
        <span class="summary-value">${esc(data.divisi)}</span>
      </div>
      <div class="summary-row">
        <span class="summary-label">Request</span>
        <span class="summary-value">${esc(data.request)}</span>
      </div>
      <div class="summary-row">
        <span class="summary-label">Keterangan</span>
        <span class="summary-value">${esc(data.keterangan)}</span>
      </div>
      <div class="summary-row">
        <span class="summary-label">Waktu</span>
        <span class="summary-value">${esc(data.timestamp)}</span>
      </div>
    `;
    successModal.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  function closeSuccessModal() {
    successModal.classList.remove('active');
    document.body.style.overflow = '';
  }

  function closeDeleteModal() {
    deleteModal.classList.remove('active');
    document.body.style.overflow = '';
    deleteTarget = null;
  }

  // ── Render Request List ──
  function renderRequestList() {
    const searchVal = searchInput.value.toLowerCase().trim();
    const filterVal = filterDivisi.value;

    let filtered = allRequests.filter(r => {
      const matchSearch =
        r.nama.toLowerCase().includes(searchVal) ||
        r.request.toLowerCase().includes(searchVal) ||
        r.keterangan.toLowerCase().includes(searchVal);
      const matchFilter = filterVal === 'all' || r.divisi === filterVal;
      return matchSearch && matchFilter;
    });

    // Update count
    requestCount.textContent = allRequests.length;

    // Clear cards
    requestCards.innerHTML = '';

    // Show/hide states
    if (allRequests.length === 0) {
      emptyState.style.display = 'flex';
      noResultState.style.display = 'none';
      requestCards.style.display = 'none';
      return;
    }

    emptyState.style.display = 'none';

    if (filtered.length === 0) {
      noResultState.style.display = 'flex';
      requestCards.style.display = 'none';
      return;
    }

    noResultState.style.display = 'none';
    requestCards.style.display = 'flex';

    // Render each card
    filtered.forEach((item, index) => {
      const card = document.createElement('div');
      card.className = 'request-card-item';
      card.style.animationDelay = `${index * 0.05}s`;

      const globalIndex = allRequests.length - allRequests.indexOf(item);

      card.innerHTML = `
        <div class="request-card-top">
          <div class="request-card-info">
            <div class="request-card-name">${esc(item.nama)}</div>
            <span class="request-card-divisi">${esc(item.divisi)}</span>
          </div>
          <div class="request-card-actions">
            <button class="btn-card-action btn-card-delete" data-id="${item.id}" title="Hapus request">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="3 6 5 6 21 6"/>
                <path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/>
              </svg>
            </button>
          </div>
        </div>
        <div class="request-card-body">
          <div class="request-card-request">
            <strong>Request: </strong>${esc(item.request)}
          </div>
          <div class="request-card-keterangan">
            <strong>Keterangan: </strong>${esc(item.keterangan)}
          </div>
        </div>
        <div class="request-card-footer">
          <span class="request-card-time">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10"/>
              <polyline points="12 6 12 12 16 14"/>
            </svg>
            ${esc(item.timestamp)}
          </span>
          <span class="request-card-number">#${String(globalIndex).padStart(3, '0')}</span>
        </div>
      `;

      requestCards.appendChild(card);
    });

    // Attach delete listeners
    requestCards.querySelectorAll('.btn-card-delete').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.dataset.id;
        const item = allRequests.find(r => r.id === id);
        if (!item) return;

        deleteTarget = { type: 'single', id };
        deleteModalDesc.textContent = `Yakin mau menghapus request dari "${item.nama}"?`;
        deleteModal.classList.add('active');
        document.body.style.overflow = 'hidden';
      });
    });
  }

  // ── Storage ──
  function loadRequests() {
    try {
      return JSON.parse(localStorage.getItem('itf_requests') || '[]');
    } catch {
      return [];
    }
  }

  function saveRequests(data) {
    try {
      localStorage.setItem('itf_requests', JSON.stringify(data));
    } catch (e) {
      console.warn('localStorage error:', e);
    }
  }

  // ── Helpers ──
  function generateId() {
    return 'req_' + Date.now().toString(36) + '_' + Math.random().toString(36).substr(2, 5);
  }

  function esc(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  function shakeElement(el) {
    el.style.animation = 'none';
    el.offsetHeight;
    el.style.animation = 'shake 0.5s ease-in-out';
    setTimeout(() => { el.style.animation = ''; }, 500);
  }

  function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
});

// ── Particles ──
function createParticles() {
  const container = document.getElementById('particles');
  const count = window.innerWidth < 640 ? 15 : 30;

  for (let i = 0; i < count; i++) {
    const p = document.createElement('div');
    p.classList.add('particle');
    const size = Math.random() * 4 + 1;
    p.style.cssText = `
      width:${size}px; height:${size}px;
      left:${Math.random() * 100}%;
      animation-duration:${Math.random() * 20 + 15}s;
      animation-delay:-${Math.random() * 20}s;
      opacity:${Math.random() * 0.5 + 0.1};
    `;
    container.appendChild(p);
  }
}

// ── Shake Keyframe ──
function addShakeKeyframe() {
  const s = document.createElement('style');
  s.textContent = `
    @keyframes shake {
      0%, 100% { transform: translateX(0); }
      10%, 30%, 50%, 70%, 90% { transform: translateX(-4px); }
      20%, 40%, 60%, 80% { transform: translateX(4px); }
    }
  `;
  document.head.appendChild(s);
}
