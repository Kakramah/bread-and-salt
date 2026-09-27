/* ==========================================================================
   الخبز والملح · Bread and Salt
   منظومة التفاعل البرمجي · script.js
   دستور مشاريع الويب الإصدار 5.1
   ========================================================================== */

(function () {
  'use strict';

  // --------------------------------------------------------------------------
  // 1 · شريط تقدم القراءة (Reading Progress)
  // --------------------------------------------------------------------------
  const progressBar = document.getElementById('reading-progress-bar');

  function updateReadingProgress() {
    if (!progressBar) return;
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    const docHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
    const progress = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
    progressBar.style.width = Math.min(100, Math.max(0, progress)) + '%';
  }

  window.addEventListener('scroll', updateReadingProgress, { passive: true });
  window.addEventListener('resize', updateReadingProgress, { passive: true });
  updateReadingProgress();

  // --------------------------------------------------------------------------
  // 2 · لحظة التوقيع التفاعلية: تتبع تحول المائدة (Interactive Table Tracker)
  // --------------------------------------------------------------------------
  const sceneBlocks = document.querySelectorAll('.scene-block');
  const trackerText = document.getElementById('tracker-state-text');
  const stepNodes = document.querySelectorAll('.step-node');

  function setActiveScene(index, stateName) {
    if (trackerText && stateName) {
      trackerText.textContent = stateName;
    }
    stepNodes.forEach(node => {
      const nodeScene = parseInt(node.getAttribute('data-scene'), 10);
      if (nodeScene === index) {
        node.classList.add('active');
        node.setAttribute('aria-current', 'true');
      } else {
        node.classList.remove('active');
        node.removeAttribute('aria-current');
      }
    });
  }

  // ربط أزرار الخطوات بالانتقال السلس
  stepNodes.forEach(btn => {
    btn.addEventListener('click', () => {
      const targetSceneIndex = btn.getAttribute('data-scene');
      const targetElement = document.getElementById('scene-' + targetSceneIndex);
      if (targetElement) {
        targetElement.scrollIntoView({ behavior: 'smooth' });
      }
    });
  });

  // مراقبة التقاطع عند التمرير
  if ('IntersectionObserver' in window && sceneBlocks.length > 0) {
    const observerOptions = {
      root: null,
      rootMargin: '-30% 0px -40% 0px',
      threshold: 0.1
    };

    const sceneObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const index = parseInt(entry.target.getAttribute('data-scene-index'), 10);
          const stateName = entry.target.getAttribute('data-state-name');
          setActiveScene(index, stateName);
        }
      });
    }, observerOptions);

    sceneBlocks.forEach(scene => sceneObserver.observe(scene));
  }

  // --------------------------------------------------------------------------
  // 3 · مستعرض اللقطات البصرية (Lightbox)
  // --------------------------------------------------------------------------
  const lightbox = document.getElementById('lightbox');
  const lightboxImg = document.getElementById('lightbox-img');
  const lightboxTitle = document.getElementById('lightbox-title');
  const lightboxDesc = document.getElementById('lightbox-desc');
  const lightboxClose = document.getElementById('lightbox-close');
  const lightboxPrev = document.getElementById('lightbox-prev');
  const lightboxNext = document.getElementById('lightbox-next');

  const mediaCards = Array.from(document.querySelectorAll('.scene-media'));
  let currentImageIndex = 0;
  let lastFocusedElement = null;

  function openLightbox(index) {
    if (!lightbox || !mediaCards[index]) return;
    lastFocusedElement = document.activeElement;
    currentImageIndex = index;
    updateLightboxContent();
    lightbox.classList.add('active');
    document.body.style.overflow = 'hidden';
    if (lightboxClose) lightboxClose.focus();
  }

  function closeLightbox() {
    if (!lightbox) return;
    lightbox.classList.remove('active');
    document.body.style.overflow = '';
    if (lastFocusedElement && typeof lastFocusedElement.focus === 'function') {
      lastFocusedElement.focus();
    }
  }

  function updateLightboxContent() {
    const card = mediaCards[currentImageIndex];
    if (!card) return;
    const img = card.querySelector('img');
    if (!img) return;

    if (lightboxImg) {
      lightboxImg.src = img.src;
      lightboxImg.alt = img.alt || '';
    }
    if (lightboxTitle) {
      lightboxTitle.textContent = img.getAttribute('data-title') || '';
    }
    if (lightboxDesc) {
      lightboxDesc.textContent = img.getAttribute('data-desc') || '';
    }
  }

  function showNextImage() {
    currentImageIndex = (currentImageIndex + 1) % mediaCards.length;
    updateLightboxContent();
  }

  function showPrevImage() {
    currentImageIndex = (currentImageIndex - 1 + mediaCards.length) % mediaCards.length;
    updateLightboxContent();
  }

  mediaCards.forEach((card, idx) => {
    card.addEventListener('click', () => openLightbox(idx));
    card.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        openLightbox(idx);
      }
    });
  });

  if (lightboxClose) {
    lightboxClose.addEventListener('click', closeLightbox);
  }

  // في العربية: السهم الأيمن للسابق، والسهم الأيسر للتالي (§8.3ب.4)
  if (lightboxPrev) {
    lightboxPrev.addEventListener('click', showPrevImage);
  }
  if (lightboxNext) {
    lightboxNext.addEventListener('click', showNextImage);
  }

  if (lightbox) {
    lightbox.addEventListener('click', (e) => {
      if (e.target === lightbox) {
        closeLightbox();
      }
    });
  }

  document.addEventListener('keydown', (e) => {
    if (!lightbox || !lightbox.classList.contains('active')) return;
    if (e.key === 'Escape') {
      closeLightbox();
    } else if (e.key === 'ArrowRight') {
      showPrevImage();
    } else if (e.key === 'ArrowLeft') {
      showNextImage();
    }
  });

  // --------------------------------------------------------------------------
  // 4 · المشاركة العاملة (§8.6)
  // --------------------------------------------------------------------------
  const shareToggle = document.getElementById('share-toggle');
  const shareModal = document.getElementById('share-modal');
  const shareClose = document.getElementById('share-close');
  const shareCopyBtn = document.getElementById('share-copy-btn');
  const shareLinkInput = document.getElementById('share-link-input');

  const shareTitle = 'الخبز والملح · تأمل في الوفاء والخيبة';
  const shareUrl = 'https://kakramah.github.io/bread-and-salt/';
  const shareText = '«ليس كلُّ من أكل معك الخبزَ والملحَ صديقَك؛ ربما كان جائعاً فقط.»';

  function handleShare() {
    if (navigator.share) {
      navigator.share({
        title: shareTitle,
        text: shareText,
        url: shareUrl
      }).catch(() => {
        openShareModal();
      });
    } else {
      openShareModal();
    }
  }

  function openShareModal() {
    if (!shareModal) return;
    shareModal.classList.add('active');
    if (shareCopyBtn) shareCopyBtn.focus();
  }

  function closeShareModal() {
    if (!shareModal) return;
    shareModal.classList.remove('active');
  }

  if (shareToggle) {
    shareToggle.addEventListener('click', handleShare);
  }

  if (shareClose) {
    shareClose.addEventListener('click', closeShareModal);
  }

  if (shareModal) {
    shareModal.addEventListener('click', (e) => {
      if (e.target === shareModal) {
        closeShareModal();
      }
    });
  }

  if (shareCopyBtn && shareLinkInput) {
    shareCopyBtn.addEventListener('click', () => {
      shareLinkInput.select();
      shareLinkInput.setSelectionRange(0, 99999);
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(shareUrl).then(() => {
          showCopySuccess();
        }).catch(() => {
          document.execCommand('copy');
          showCopySuccess();
        });
      } else {
        document.execCommand('copy');
        showCopySuccess();
      }
    });
  }

  function showCopySuccess() {
    if (!shareCopyBtn) return;
    const originalText = shareCopyBtn.textContent;
    shareCopyBtn.textContent = 'تم النسخ';
    shareCopyBtn.disabled = true;
    setTimeout(() => {
      shareCopyBtn.textContent = originalText;
      shareCopyBtn.disabled = false;
    }, 2000);
  }

  // --------------------------------------------------------------------------
  // 5 · صوت سكون المائدة المحيطي (Web Audio API)
  // --------------------------------------------------------------------------
  const ambientToggle = document.getElementById('ambient-toggle');
  let audioCtx = null;
  let isPlaying = false;
  let noiseNode = null;
  let gainNode = null;

  function initAmbientAudio() {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) return;

    audioCtx = new AudioContextClass();
    const bufferSize = audioCtx.sampleRate * 2;
    const noiseBuffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
    const output = noiseBuffer.getChannelData(0);

    let lastOut = 0.0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      output[i] = (lastOut + (0.02 * white)) / 1.02;
      lastOut = output[i];
      output[i] *= 3.5;
    }

    noiseNode = audioCtx.createBufferSource();
    noiseNode.buffer = noiseBuffer;
    noiseNode.loop = true;

    const filter = audioCtx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 320;

    gainNode = audioCtx.createGain();
    gainNode.gain.setValueAtTime(0.001, audioCtx.currentTime);

    noiseNode.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(audioCtx.destination);
    noiseNode.start(0);
  }

  function toggleAmbientAudio() {
    if (!ambientToggle) return;

    if (!audioCtx) {
      initAmbientAudio();
    }

    if (!isPlaying) {
      if (audioCtx.state === 'suspended') {
        audioCtx.resume();
      }
      if (gainNode) {
        gainNode.gain.setTargetAtTime(0.08, audioCtx.currentTime, 0.5);
      }
      isPlaying = true;
      ambientToggle.setAttribute('aria-pressed', 'true');
      ambientToggle.classList.add('active');
    } else {
      if (gainNode) {
        gainNode.gain.setTargetAtTime(0.0001, audioCtx.currentTime, 0.4);
      }
      isPlaying = false;
      ambientToggle.setAttribute('aria-pressed', 'false');
      ambientToggle.classList.remove('active');
    }
  }

  if (ambientToggle) {
    ambientToggle.addEventListener('click', toggleAmbientAudio);
  }

})();
