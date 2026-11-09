/**
 * NIMIT PANCHAL — VIDEO EDITOR & COLORIST PORTFOLIO
 * Interactive Scripts: Custom Video Player, Before/After Slider,
 * Timecode Clock, Modal Previews, and Brief Mailer.
 */

document.addEventListener('DOMContentLoaded', () => {
  initLiveTimecode();
  initMobileMenu();
  initShowreelPlayer();
  initBeforeAfterSlider();
  initScrollSpy();
  updateCopyrightYear();
});

/* ==========================================================================
   1. LIVE TIMECODE SIMULATOR (24 FPS)
   ========================================================================== */
function initLiveTimecode() {
  const clockEl = document.getElementById('clockTimecode');
  if (!clockEl) return;

  let frames = 18;
  let seconds = 24;
  let minutes = 0;
  let hours = 1;

  setInterval(() => {
    frames++;
    if (frames >= 24) {
      frames = 0;
      seconds++;
      if (seconds >= 60) {
        seconds = 0;
        minutes++;
        if (minutes >= 60) {
          minutes = 0;
          hours++;
        }
      }
    }

    const pad = (n) => String(n).padStart(2, '0');
    clockEl.textContent = `${pad(hours)}:${pad(minutes)}:${pad(seconds)}:${pad(frames)}`;
  }, 1000 / 24);
}

/* ==========================================================================
   2. MOBILE NAVIGATION MENU
   ========================================================================== */
function initMobileMenu() {
  const toggleBtn = document.getElementById('mobileToggle');
  const navMenu = document.getElementById('navMenu');
  const navLinks = document.querySelectorAll('.nav-link');

  if (!toggleBtn || !navMenu) return;

  toggleBtn.addEventListener('click', () => {
    navMenu.classList.toggle('open');
  });

  navLinks.forEach((link) => {
    link.addEventListener('click', () => {
      navMenu.classList.remove('open');
    });
  });
}

/* ==========================================================================
   3. SHOWREEL VIDEO PLAYER & CONTROLS
   ========================================================================== */
function initShowreelPlayer() {
  const video = document.getElementById('mainShowreelVideo');
  const overlay = document.getElementById('playerOverlay');
  const bigPlayBtn = document.getElementById('bigPlayBtn');
  const playPauseBtn = document.getElementById('playPauseBtn');
  const playIcon = document.getElementById('playIcon');
  const pauseIcon = document.getElementById('pauseIcon');
  const scrubber = document.getElementById('timelineScrubber');
  const progress = document.getElementById('scrubberProgress');
  const currentTimeEl = document.getElementById('currentTime');
  const totalTimeEl = document.getElementById('totalTime');
  const muteBtn = document.getElementById('muteBtn');
  const volHigh = document.getElementById('volumeHighIcon');
  const volMuted = document.getElementById('volumeMutedIcon');
  const fullscreenBtn = document.getElementById('fullscreenBtn');
  const container = document.getElementById('showreelPlayerContainer');

  if (!video) return;

  // Toggle Play
  function togglePlay() {
    if (video.paused || video.ended) {
      video.play().then(() => {
        overlay.classList.add('hidden');
        playIcon.classList.add('hidden');
        pauseIcon.classList.remove('hidden');
      }).catch((e) => {
        console.warn('Playback interrupted:', e);
      });
    } else {
      video.pause();
      playIcon.classList.remove('hidden');
      pauseIcon.classList.add('hidden');
      overlay.classList.remove('hidden');
    }
  }

  if (bigPlayBtn) bigPlayBtn.addEventListener('click', togglePlay);
  if (overlay) overlay.addEventListener('click', togglePlay);
  if (playPauseBtn) playPauseBtn.addEventListener('click', togglePlay);

  // Time formatting in SMPTE-like timecode (00:00:SS:FF)
  function formatTimecode(secs) {
    if (isNaN(secs)) return '00:00:00:00';
    const totalSecs = Math.floor(secs);
    const m = Math.floor(totalSecs / 60);
    const s = totalSecs % 60;
    const f = Math.floor((secs - totalSecs) * 24);
    const pad = (n) => String(n).padStart(2, '0');
    return `00:${pad(m)}:${pad(s)}:${pad(f)}`;
  }

  // Update Progress
  video.addEventListener('timeupdate', () => {
    if (video.duration) {
      const pct = (video.currentTime / video.duration) * 100;
      if (progress) progress.style.width = `${pct}%`;
      if (currentTimeEl) currentTimeEl.textContent = formatTimecode(video.currentTime);
    }
  });

  video.addEventListener('loadedmetadata', () => {
    if (totalTimeEl && video.duration) {
      totalTimeEl.textContent = formatTimecode(video.duration);
    }
  });

  // Seeking via scrubber
  if (scrubber) {
    scrubber.addEventListener('click', (e) => {
      const rect = scrubber.getBoundingClientRect();
      const pos = (e.clientX - rect.left) / rect.width;
      if (video.duration) {
        video.currentTime = pos * video.duration;
      }
    });
  }

  // Mute / Unmute
  if (muteBtn) {
    muteBtn.addEventListener('click', () => {
      video.muted = !video.muted;
      if (video.muted) {
        volHigh.classList.add('hidden');
        volMuted.classList.remove('hidden');
      } else {
        volHigh.classList.remove('hidden');
        volMuted.classList.add('hidden');
      }
    });
  }

  // Fullscreen
  if (fullscreenBtn && container) {
    fullscreenBtn.addEventListener('click', () => {
      if (!document.fullscreenElement) {
        container.requestFullscreen().catch(err => console.warn(err));
      } else {
        document.exitFullscreen().catch(err => console.warn(err));
      }
    });
  }
}

/* ==========================================================================
   4. INTERACTIVE BEFORE / AFTER COLOR GRADING SLIDER
   ========================================================================== */
function initBeforeAfterSlider() {
  const container = document.getElementById('colorGradeSlider');
  const afterLayer = document.getElementById('baAfterLayer');
  const handle = document.getElementById('baHandle');

  if (!container || !afterLayer || !handle) return;

  let isDragging = false;

  function updateSlider(clientX) {
    const rect = container.getBoundingClientRect();
    let x = clientX - rect.left;
    if (x < 0) x = 0;
    if (x > rect.width) x = rect.width;

    const percentage = (x / rect.width) * 100;

    // After layer polygon clip (reveals after layer from right to left)
    afterLayer.style.clipPath = `polygon(${percentage}% 0, 100% 0, 100% 100%, ${percentage}% 100%)`;
    handle.style.left = `${percentage}%`;
  }

  container.addEventListener('mousedown', (e) => {
    isDragging = true;
    updateSlider(e.clientX);
  });

  window.addEventListener('mousemove', (e) => {
    if (!isDragging) return;
    updateSlider(e.clientX);
  });

  window.addEventListener('mouseup', () => {
    isDragging = false;
  });

  // Touch Support for mobile & tablets
  container.addEventListener('touchstart', (e) => {
    isDragging = true;
    if (e.touches[0]) updateSlider(e.touches[0].clientX);
  }, { passive: true });

  window.addEventListener('touchmove', (e) => {
    if (!isDragging) return;
    if (e.touches[0]) updateSlider(e.touches[0].clientX);
  }, { passive: true });

  window.addEventListener('touchend', () => {
    isDragging = false;
  });
}

/* ==========================================================================
   5. PROJECT DETAILS & PREVIEW MODAL
   ========================================================================== */
const projectData = {
  band: {
    type: 'Personal Project',
    title: 'Band Portfolio Video — Live Performance Edit',
    role: 'Editor / Colorist',
    tool: 'DaVinci Resolve Studio',
    deliverable: '60–90 sec high-energy band promo',
    details: 'Edited multi-angle footage of an indie band performance, syncing cuts to drum transients and guitar solos. Color graded with a saturated stage aesthetic, balanced skin tones, and rich shadow contrast in DaVinci Resolve.',
    mediaHtml: `
      <div style="aspect-ratio: 16/9; background: #000; border-radius: 8px; overflow: hidden; position: relative;">
        <video controls autoplay loop playsinline style="width: 100%; height: 100%; object-fit: cover;">
          <source src="https://assets.mixkit.co/videos/preview/mixkit-rock-band-giving-a-concert-4011-large.mp4" type="video/mp4">
          Your browser does not support HTML5 video.
        </video>
      </div>
    `
  },
  grade: {
    type: 'Spec / Personal Project',
    title: 'Before/After Color Grading — ACEScc / Rec.709 Master',
    role: 'Colorist',
    tool: 'DaVinci Resolve Studio',
    deliverable: 'Before/After Grade comparison & LUT package',
    details: 'Converted flat RAW / Log profiles into a polished cinematic palette. Implemented customized node-based corrections: primary exposure balancing, skin tone qualifier isolation, split-toning (teal shadows / warm highlights), and subtle film grain texture.',
    mediaHtml: `
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
        <div>
          <img src="assets/color-grade-before.svg" alt="Before Color Grade" style="width: 100%; border-radius: 6px;">
          <p style="font-family: var(--font-mono); font-size: 0.75rem; color: #94a3b8; margin-top: 6px; text-align: center;">LOG Profile (Flat Dynamic Range)</p>
        </div>
        <div>
          <img src="assets/color-grade-after.svg" alt="After Color Grade" style="width: 100%; border-radius: 6px;">
          <p style="font-family: var(--font-mono); font-size: 0.75rem; color: var(--accent-amber); margin-top: 6px; text-align: center;">Graded (Teal &amp; Orange Film Curve)</p>
        </div>
      </div>
    `
  },
  reel: {
    type: 'Personal / Spec Project',
    title: '30-Second Vertical Reel — High Retention Social Cut',
    role: 'Editor / Motion Sync',
    tool: 'DaVinci Resolve Studio',
    deliverable: '30-sec vertical reel (1080x1920)',
    details: 'Fast-paced vertical edit tailored for Instagram Reels and YouTube Shorts. Features tight speed ramping, sound effect design, and rhythm-based match cuts that sustain high viewer retention throughout the 30-second duration.',
    mediaHtml: `
      <div style="max-width: 320px; margin: 0 auto; aspect-ratio: 9/16; background: #000; border-radius: 12px; overflow: hidden; border: 1px solid var(--border-subtle);">
        <img src="assets/reel-thumbnail.svg" alt="Vertical Reel Preview" style="width: 100%; height: 100%; object-fit: cover;">
      </div>
    `
  }
};

function openProjectModal(projectId) {
  const modal = document.getElementById('projectModal');
  const modalType = document.getElementById('modalType');
  const modalTitle = document.getElementById('modalTitle');
  const modalBody = document.getElementById('modalBody');

  const p = projectData[projectId];
  if (!p || !modal) return;

  modalType.textContent = p.type;
  modalTitle.textContent = p.title;

  modalBody.innerHTML = `
    ${p.mediaHtml}
    <div style="margin-top: 1.25rem;">
      <div style="display: flex; gap: 1rem; flex-wrap: wrap; margin-bottom: 0.85rem; font-size: 0.82rem; font-family: var(--font-mono); color: var(--text-muted);">
        <span>Role: <strong style="color: #fff;">${p.role}</strong></span>
        <span>•</span>
        <span>Tool: <strong style="color: var(--accent-amber);">${p.tool}</strong></span>
        <span>•</span>
        <span>Deliverable: <strong style="color: var(--accent-cyan);">${p.deliverable}</strong></span>
      </div>
      <p style="color: #cbd5e1; font-size: 0.95rem; line-height: 1.6;">${p.details}</p>
    </div>
  `;

  modal.classList.add('active');
  document.body.style.overflow = 'hidden';
}

function closeProjectModal() {
  const modal = document.getElementById('projectModal');
  if (modal) {
    modal.classList.remove('active');
    document.body.style.overflow = '';
  }
}

// Close modal on backdrop click or ESC key
window.addEventListener('click', (e) => {
  const modal = document.getElementById('projectModal');
  if (e.target === modal) {
    closeProjectModal();
  }
});

window.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    closeProjectModal();
  }
});

/* ==========================================================================
   6. QUICK PROJECT INTAKE FORM / EMAIL BUILDER
   ========================================================================== */
function handleSendBrief(e) {
  e.preventDefault();

  const name = document.getElementById('clientName')?.value.trim() || 'Client';
  const service = document.getElementById('projectTypeSelect')?.value || 'Video Editing';
  const deadline = document.getElementById('projectDeadline')?.value.trim() || 'Flexible';
  const footageLink = document.getElementById('footageLink')?.value.trim() || 'Pending';
  const notes = document.getElementById('projectNotes')?.value.trim() || 'No additional notes provided.';

  const subject = encodeURIComponent(`Video Editing Project Inquiry — ${name} (${service})`);
  const body = encodeURIComponent(
`Hi Nimit,

I would like to hire you for a video project. Here is my project brief:

• Client / Band Name: ${name}
• Service Needed: ${service}
• Target Deadline: ${deadline}
• Footage / Reference Link: ${footageLink}

Project Notes & Creative Vision:
${notes}

Looking forward to hearing from you!

Best regards,
${name}`
  );

  const mailtoUrl = `mailto:retirededitor21@gmail.com?subject=${subject}&body=${body}`;
  window.location.href = mailtoUrl;

  showToast('Launching your email client with your pre-filled brief...');
}

/* ==========================================================================
   7. COPY EMAIL TO CLIPBOARD WITH TOAST
   ========================================================================== */
function copyEmail(email) {
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(email).then(() => {
      showToast(`Copied ${email} to clipboard!`);
    }).catch(() => {
      fallbackCopy(email);
    });
  } else {
    fallbackCopy(email);
  }
}

function fallbackCopy(text) {
  const tempInput = document.createElement('input');
  tempInput.value = text;
  document.body.appendChild(tempInput);
  tempInput.select();
  document.execCommand('copy');
  document.body.removeChild(tempInput);
  showToast(`Copied ${text} to clipboard!`);
}

function showToast(message) {
  const toast = document.getElementById('toastNotification');
  const toastMsg = document.getElementById('toastMessage');
  if (!toast || !toastMsg) return;

  toastMsg.textContent = message;
  toast.classList.add('show');

  setTimeout(() => {
    toast.classList.remove('show');
  }, 3500);
}

/* ==========================================================================
   8. ACTIVE NAVIGATION SCROLLSPY
   ========================================================================== */
function initScrollSpy() {
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav-link');

  window.addEventListener('scroll', () => {
    let current = '';
    const scrollPos = window.scrollY + 120;

    sections.forEach((sec) => {
      const top = sec.offsetTop;
      const height = sec.offsetHeight;
      if (scrollPos >= top && scrollPos < top + height) {
        current = sec.getAttribute('id');
      }
    });

    navLinks.forEach((link) => {
      link.classList.remove('active');
      if (link.getAttribute('href') === `#${current}`) {
        link.classList.add('active');
      }
    });
  });
}

/* ==========================================================================
   9. COPYRIGHT YEAR
   ========================================================================== */
function updateCopyrightYear() {
  const yearEl = document.getElementById('currentYear');
  if (yearEl) {
    yearEl.textContent = new Date().getFullYear();
  }
}

