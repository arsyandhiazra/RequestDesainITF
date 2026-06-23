/* ═══════════════════════════════════════════
   Islamic TechFest — Design Request Portal
   JavaScript Controller
   ═══════════════════════════════════════════ */

document.addEventListener('DOMContentLoaded', () => {
  // ── Particle System ──
  createParticles();

  // ── Form Elements ──
  const form = document.getElementById('requestForm');
  const submitBtn = document.getElementById('submitBtn');
  const successModal = document.getElementById('successModal');
  const modalCloseBtn = document.getElementById('modalCloseBtn');
  const modalSummary = document.getElementById('modalSummary');
  const charCount = document.getElementById('charCount');
  const keteranganField = document.getElementById('keterangan');

  // ── Character Counter ──
  keteranganField.addEventListener('input', () => {
    const len = keteranganField.value.length;
    charCount.textContent = `${len} / 1000`;

    if (len > 1000) {
      charCount.style.color = '#e74c3c';
    } else if (len > 800) {
      charCount.style.color = 'rgba(212, 175, 55, 0.8)';
    } else {
      charCount.style.color = 'var(--text-muted)';
    }
  });

  // ── Max Length ──
  keteranganField.setAttribute('maxlength', '1000');

  // ── Real-time Validation (clear errors on input) ──
  const fields = ['nama', 'divisi', 'request', 'keterangan'];

  fields.forEach(fieldName => {
    const el = document.getElementById(fieldName);
    const events = el.tagName === 'SELECT' ? ['change'] : ['input', 'focus'];

    events.forEach(evt => {
      el.addEventListener(evt, () => {
        const group = el.closest('.form-group');
        if (group.classList.contains('error')) {
          group.classList.remove('error');
        }
      });
    });
  });

  // ── Form Submission ──
  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    // Validate
    const isValid = validateForm();
    if (!isValid) {
      // Shake the first error field
      const firstError = form.querySelector('.form-group.error');
      if (firstError) {
        shakeElement(firstError);
        firstError.querySelector('input, select, textarea').focus();
      }
      return;
    }

    // Collect data
    const formData = {
      nama: document.getElementById('nama').value.trim(),
      divisi: document.getElementById('divisi').value,
      request: document.getElementById('request').value.trim(),
      keterangan: document.getElementById('keterangan').value.trim(),
      timestamp: new Date().toLocaleString('id-ID', {
        dateStyle: 'full',
        timeStyle: 'short'
      })
    };

    // Loading state
    submitBtn.classList.add('loading');

    // Simulate sending (replace with actual API call)
    await simulateSend();

    // Save to localStorage as backup
    saveToLocalStorage(formData);

    // Show success
    submitBtn.classList.remove('loading');
    showSuccessModal(formData);

    // Reset form
    form.reset();
    charCount.textContent = '0 / 1000';
  });

  // ── Modal Close ──
  modalCloseBtn.addEventListener('click', () => {
    closeModal();
  });

  successModal.addEventListener('click', (e) => {
    if (e.target === successModal) {
      closeModal();
    }
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && successModal.classList.contains('active')) {
      closeModal();
    }
  });

  // ── Validation Function ──
  function validateForm() {
    let valid = true;

    // Nama
    const nama = document.getElementById('nama');
    if (!nama.value.trim()) {
      showError('nama');
      valid = false;
    }

    // Divisi
    const divisi = document.getElementById('divisi');
    if (!divisi.value) {
      showError('divisi');
      valid = false;
    }

    // Request
    const request = document.getElementById('request');
    if (!request.value.trim()) {
      showError('request');
      valid = false;
    }

    // Keterangan
    const keterangan = document.getElementById('keterangan');
    if (!keterangan.value.trim()) {
      showError('keterangan');
      valid = false;
    }

    return valid;
  }

  function showError(fieldName) {
    const group = document.querySelector(`[data-field="${fieldName}"]`);
    if (group) {
      group.classList.add('error');
    }
  }

  function shakeElement(el) {
    el.style.animation = 'none';
    el.offsetHeight; // trigger reflow
    el.style.animation = 'shake 0.5s ease-in-out';
    setTimeout(() => {
      el.style.animation = '';
    }, 500);
  }

  // ── Simulate API Call ──
  function simulateSend() {
    return new Promise(resolve => setTimeout(resolve, 1500));
  }

  // ── Save to localStorage ──
  function saveToLocalStorage(data) {
    try {
      const existing = JSON.parse(localStorage.getItem('itf_requests') || '[]');
      existing.push(data);
      localStorage.setItem('itf_requests', JSON.stringify(existing));
    } catch (e) {
      console.warn('Could not save to localStorage', e);
    }
  }

  // ── Success Modal ──
  function showSuccessModal(data) {
    modalSummary.innerHTML = `
      <div class="summary-row">
        <span class="summary-label">Nama</span>
        <span class="summary-value">${escapeHtml(data.nama)}</span>
      </div>
      <div class="summary-row">
        <span class="summary-label">Divisi</span>
        <span class="summary-value">${escapeHtml(data.divisi)}</span>
      </div>
      <div class="summary-row">
        <span class="summary-label">Request</span>
        <span class="summary-value">${escapeHtml(data.request)}</span>
      </div>
      <div class="summary-row">
        <span class="summary-label">Keterangan</span>
        <span class="summary-value">${escapeHtml(data.keterangan)}</span>
      </div>
      <div class="summary-row">
        <span class="summary-label">Waktu</span>
        <span class="summary-value">${escapeHtml(data.timestamp)}</span>
      </div>
    `;

    successModal.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  function closeModal() {
    successModal.classList.remove('active');
    document.body.style.overflow = '';
  }

  function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
});

// ── Particle System ──
function createParticles() {
  const container = document.getElementById('particles');
  const count = window.innerWidth < 640 ? 15 : 30;

  for (let i = 0; i < count; i++) {
    const particle = document.createElement('div');
    particle.classList.add('particle');

    const size = Math.random() * 4 + 1;
    const left = Math.random() * 100;
    const duration = Math.random() * 20 + 15;
    const delay = Math.random() * 20;

    particle.style.cssText = `
      width: ${size}px;
      height: ${size}px;
      left: ${left}%;
      animation-duration: ${duration}s;
      animation-delay: -${delay}s;
      opacity: ${Math.random() * 0.5 + 0.1};
    `;

    container.appendChild(particle);
  }
}

// ── Add shake keyframe dynamically ──
const shakeStyle = document.createElement('style');
shakeStyle.textContent = `
  @keyframes shake {
    0%, 100% { transform: translateX(0); }
    10%, 30%, 50%, 70%, 90% { transform: translateX(-4px); }
    20%, 40%, 60%, 80% { transform: translateX(4px); }
  }
`;
document.head.appendChild(shakeStyle);

// ── Intersection Observer for Scroll Reveal ──
if ('IntersectionObserver' in window) {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.style.opacity = '1';
          entry.target.style.transform = 'translateY(0)';
        }
      });
    },
    { threshold: 0.1 }
  );

  document.querySelectorAll('.form-group, .form-actions').forEach(el => {
    observer.observe(el);
  });
}

// ── Easter Egg: Konami-ish pattern for fun ──
let konamiSequence = [];
const konamiCode = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown'];

document.addEventListener('keydown', (e) => {
  konamiSequence.push(e.key);
  konamiSequence = konamiSequence.slice(-4);

  if (JSON.stringify(konamiSequence) === JSON.stringify(konamiCode)) {
    document.body.style.transition = 'filter 1s';
    document.body.style.filter = 'hue-rotate(30deg)';
    setTimeout(() => {
      document.body.style.filter = '';
    }, 3000);
  }
});