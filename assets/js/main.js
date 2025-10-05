/* TerraFlow Pilates — Global interactions */
(function() {
  const qs = (s, r=document) => r.querySelector(s);
  const qsa = (s, r=document) => Array.from(r.querySelectorAll(s));

  // Mobile nav toggle
  const navToggle = qs('[data-nav-toggle]');
  const navLinks = qs('[data-navlinks]');
  if (navToggle && navLinks) {
    navToggle.addEventListener('click', () => {
      const next = navLinks.getAttribute('data-open') !== 'true';
      navLinks.setAttribute('data-open', String(next));
      navToggle.setAttribute('aria-expanded', String(next));
    });
  }

  // Reveal on scroll
  const revealEls = qsa('.reveal');
  if ('IntersectionObserver' in window && revealEls.length) {
    const io = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          entry.target.setAttribute('data-visible', 'true');
          io.unobserve(entry.target);
        }
      }
    }, { rootMargin: '0px 0px -10% 0px' });
    revealEls.forEach(el => io.observe(el));
  } else {
    revealEls.forEach(el => el.setAttribute('data-visible', 'true'));
  }

  // Accessible Lightbox for galleries
  class GalleryLightbox {
    constructor() {
      this.items = [];
      this.currentIndex = 0;
      this.backdrop = null;
      this.dialog = null;
      this.imgEl = null;
      this.prevBtn = null;
      this.nextBtn = null;
      this.closeBtn = null;
      this.lastActive = null;
      this.boundKey = this.onKeyDown.bind(this);
      this.init();
    }

    init() {
      const triggers = qsa('[data-lightbox]');
      if (!triggers.length) return;
      triggers.forEach((el, idx) => {
        el.addEventListener('click', (e) => {
          e.preventDefault();
          const group = el.getAttribute('data-lightbox') || 'gallery';
          const groupItems = qsa(`[data-lightbox="${group}"]`);
          this.items = groupItems.map(a => ({
            src: a.getAttribute('href'),
            alt: a.querySelector('img')?.getAttribute('alt') || 'Gallery image'
          }));
          this.open(groupItems.indexOf(el));
        });
      });
      this.makeUi();
    }

    makeUi() {
      this.backdrop = document.createElement('div');
      this.backdrop.className = 'lightbox-backdrop';
      this.backdrop.setAttribute('aria-hidden', 'true');

      this.dialog = document.createElement('div');
      this.dialog.className = 'lightbox-dialog';
      this.dialog.setAttribute('role', 'dialog');
      this.dialog.setAttribute('aria-modal', 'true');
      this.dialog.setAttribute('aria-label', 'Image viewer');

      const toolbar = document.createElement('div');
      toolbar.className = 'lightbox-toolbar';
      const title = document.createElement('div');
      title.textContent = 'Gallery';
      title.setAttribute('aria-hidden', 'true');
      this.closeBtn = document.createElement('button');
      this.closeBtn.className = 'btn';
      this.closeBtn.type = 'button';
      this.closeBtn.innerHTML = 'Close';
      this.closeBtn.addEventListener('click', () => this.close());

      toolbar.appendChild(title);
      toolbar.appendChild(this.closeBtn);

      const body = document.createElement('div');
      body.className = 'lightbox-body';
      this.imgEl = document.createElement('img');
      this.imgEl.alt = '';
      body.appendChild(this.imgEl);

      const actions = document.createElement('div');
      actions.className = 'lightbox-actions';
      this.prevBtn = document.createElement('button');
      this.prevBtn.className = 'btn';
      this.prevBtn.textContent = 'Prev';
      this.prevBtn.addEventListener('click', () => this.show(this.currentIndex - 1));
      this.nextBtn = document.createElement('button');
      this.nextBtn.className = 'btn';
      this.nextBtn.textContent = 'Next';
      this.nextBtn.addEventListener('click', () => this.show(this.currentIndex + 1));
      actions.append(this.prevBtn, this.nextBtn);

      this.dialog.append(toolbar, body, actions);
      this.backdrop.appendChild(this.dialog);
      document.body.appendChild(this.backdrop);

      this.backdrop.addEventListener('click', (e) => {
        if (e.target === this.backdrop) this.close();
      });
    }

    open(index) {
      if (!this.items.length) return;
      this.lastActive = document.activeElement;
      this.show(index);
      this.backdrop.setAttribute('data-open', 'true');
      this.backdrop.removeAttribute('aria-hidden');
      document.addEventListener('keydown', this.boundKey);
      document.body.style.overflow = 'hidden';
      this.closeBtn.focus();
    }

    close() {
      this.backdrop.setAttribute('aria-hidden', 'true');
      this.backdrop.removeAttribute('data-open');
      document.removeEventListener('keydown', this.boundKey);
      document.body.style.overflow = '';
      if (this.lastActive && this.lastActive.focus) this.lastActive.focus();
    }

    show(idx) {
      if (idx < 0) idx = this.items.length - 1;
      if (idx >= this.items.length) idx = 0;
      this.currentIndex = idx;
      const item = this.items[idx];
      this.imgEl.src = item.src;
      this.imgEl.alt = item.alt;
    }

    onKeyDown(e) {
      if (e.key === 'Escape') this.close();
      if (e.key === 'ArrowRight') this.show(this.currentIndex + 1);
      if (e.key === 'ArrowLeft') this.show(this.currentIndex - 1);
    }
  }

  new GalleryLightbox();

  // Timetable & Booking embed
  const timetableRoot = qs('#timetable-app');
  if (timetableRoot) {
    const form = qs('#timetable-filters');
    const results = qs('#timetable-results');
    const scheduleScript = qs('#schedule-data');
    let schedule = [];
    try {
      schedule = JSON.parse(scheduleScript?.textContent || '[]');
    } catch(err) { schedule = []; }

    function render(list) {
      if (!results) return;
      results.innerHTML = '';
      if (!list.length) {
        results.innerHTML = '<p class="small">No classes match your filters. Try a wider date range.</p>';
        return;
      }
      const frag = document.createDocumentFragment();
      list.forEach(item => {
        const div = document.createElement('div');
        div.className = 'schedule-item reveal';
        div.innerHTML = `
          <div>
            <h4>${item.className}</h4>
            <div class="schedule-meta">
              <span>${new Date(item.datetime).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}</span>
              <span>•</span>
              <span>${item.instructor}</span>
              <span class="badge ${item.energy}">${item.energyLabel}</span>
            </div>
          </div>
          <div>
            <a class="btn btn-secondary" href="#booking" data-book-class="${item.id}">Book</a>
          </div>
        `;
        frag.appendChild(div);
      });
      results.appendChild(frag);
    }

    function applyFilters() {
      const type = qs('#filter-type')?.value || '';
      const instructor = qs('#filter-instructor')?.value || '';
      const date = qs('#filter-date')?.value || '';
      const filtered = schedule.filter(s => {
        const matchType = !type || s.type === type;
        const matchInstructor = !instructor || s.instructor === instructor;
        const matchDate = !date || new Date(s.datetime).toISOString().slice(0,10) === date;
        return matchType && matchInstructor && matchDate;
      });
      render(filtered);
    }

    if (form) form.addEventListener('input', applyFilters);
    render(schedule);

    // Booking embed
    const embedTarget = qs('#booking-embed');
    const url = window.__BOOKING_EMBED_URL;
    if (embedTarget) {
      if (url && typeof url === 'string') {
        const iframe = document.createElement('iframe');
        iframe.src = url;
        iframe.title = 'Class booking widget';
        iframe.style.width = '100%';
        iframe.style.minHeight = '700px';
        iframe.loading = 'lazy';
        iframe.referrerPolicy = 'no-referrer-when-downgrade';
        embedTarget.innerHTML = '';
        embedTarget.appendChild(iframe);
      } else {
        embedTarget.innerHTML = '<p class="small">Booking widget not configured. Set <code>window.__BOOKING_EMBED_URL</code> to your provider\'s embed URL.</p>';
      }
    }
  }
})();
