/* Teacher directory controller for /Pages/teacher-lists-available.html. */
(function () {
  'use strict';

  var teachers = [];
  var elements = {};

  function language() {
    var value = document.documentElement.lang || 'vi';
    return value.startsWith('zh') ? 'zh' : (value.startsWith('en') ? 'en' : 'vi');
  }

  function copy() {
    return {
      vi: { nationality: 'Quốc tịch', specialty: 'Chuyên môn', qualification: 'Trình độ', location: 'Khu vực', details: 'Xem hồ sơ', close: 'Đóng' },
      en: { nationality: 'Nationality', specialty: 'Specialization', qualification: 'Qualification', location: 'Location', details: 'View profile', close: 'Close' },
      zh: { nationality: '国籍', specialty: '专业方向', qualification: '资历', location: '地区', details: '查看资料', close: '关闭' }
    }[language()];
  }

  function safeText(value) {
    return String(value || '').trim().replace(/[&<>"']/g, function (character) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[character];
    });
  }

  function normalized(value) {
    return String(value || '').trim().normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
  }

  function profileUrl(value) {
    if (!value) return '';
    try {
      var url = new URL(value, window.location.origin);
      if (url.origin === window.location.origin && url.pathname.startsWith('/Blogs/')) {
        return '/Pages/blogs/' + url.pathname.slice('/Blogs/'.length);
      }
      return url.href;
    } catch (_) {
      return '';
    }
  }

  function card(teacher) {
    var t = copy();
    var article = document.createElement('article');
    article.className = 'teacher-card overflow-hidden rounded-2xl';
    article.innerHTML = [
      '<img class="h-56 w-full object-cover" loading="lazy" alt="" src="' + safeText(teacher.image) + '">',
      '<div class="p-5">',
      '<h2 class="text-xl font-bold text-white">' + safeText(teacher.name) + '</h2>',
      '<dl class="mt-4 space-y-2 text-sm text-neutral-300">',
      '<div><dt class="inline font-semibold text-blue-300">' + t.nationality + ':</dt> <dd class="inline">' + safeText(teacher.nationality) + '</dd></div>',
      '<div><dt class="inline font-semibold text-blue-300">' + t.specialty + ':</dt> <dd class="inline">' + safeText(teacher.specialization) + '</dd></div>',
      '<div><dt class="inline font-semibold text-blue-300">' + t.location + ':</dt> <dd class="inline">' + safeText(teacher.location) + '</dd></div>',
      '</dl>',
      '<button type="button" class="teacher-details mt-5 inline-flex min-h-11 items-center justify-center rounded-xl bg-blue-600 px-4 py-2 font-semibold text-white hover:bg-blue-500">' + t.details + '</button>',
      '</div>'
    ].join('');
    article.querySelector('img').addEventListener('error', function () {
      this.src = '/images/logo/logo.svg';
      this.classList.add('object-contain', 'p-8', 'bg-slate-900');
    }, { once: true });
    article.querySelector('.teacher-details').addEventListener('click', function () { openDetails(teacher); });
    return article;
  }

  function render(list) {
    elements.container.replaceChildren();
    list.forEach(function (teacher) { elements.container.appendChild(card(teacher)); });
    elements.noResults.classList.toggle('hidden', list.length !== 0);
  }

  function filter() {
    var query = normalized(elements.search.value);
    elements.clear.classList.toggle('hidden', !query);
    var matches = teachers.filter(function (teacher) {
      return !query || normalized([teacher.name, teacher.nationality, teacher.specialization, teacher.location, teacher.qualification].join(' ')).includes(query);
    });
    render(matches);
  }

  function openDetails(teacher) {
    var t = copy();
    var link = profileUrl(teacher.profile_link);
    elements.modalContent.innerHTML = [
      '<button type="button" class="teacher-modal-close absolute right-4 top-3 min-h-11 min-w-11 text-3xl text-neutral-300" aria-label="' + t.close + '">&times;</button>',
      '<img class="mx-auto h-36 w-36 rounded-full bg-slate-900 object-cover" src="' + safeText(teacher.image) + '" alt="">',
      '<h2 class="mt-5 text-center text-2xl font-bold text-white">' + safeText(teacher.name) + '</h2>',
      '<dl class="mt-6 space-y-3 text-sm text-neutral-200">',
      '<div><dt class="font-semibold text-blue-300">' + t.qualification + '</dt><dd>' + safeText(teacher.qualification) + '</dd></div>',
      '<div><dt class="font-semibold text-blue-300">' + t.specialty + '</dt><dd>' + safeText(teacher.specialization) + '</dd></div>',
      '<div><dt class="font-semibold text-blue-300">' + t.nationality + '</dt><dd>' + safeText(teacher.nationality) + '</dd></div>',
      '</dl>',
      link ? '<a class="mt-6 inline-flex min-h-11 w-full items-center justify-center rounded-xl bg-blue-600 px-4 py-2 font-semibold text-white" href="' + safeText(link) + '">' + t.details + '</a>' : ''
    ].join('');
    elements.modal.classList.remove('hidden');
    elements.modal.classList.add('flex');
    elements.modalContent.querySelector('.teacher-modal-close').addEventListener('click', closeDetails);
  }

  function closeDetails() {
    elements.modal.classList.add('hidden');
    elements.modal.classList.remove('flex');
  }

  async function init() {
    elements = {
      container: document.getElementById('teacher-list-container'),
      loading: document.getElementById('loading-state'),
      noResults: document.getElementById('no-results-state'),
      search: document.getElementById('teacher-search-input'),
      clear: document.getElementById('clear-search-btn'),
      modal: document.getElementById('teacher-modal'),
      modalContent: document.getElementById('modal-content')
    };
    if (!elements.container || !elements.search) return;

    elements.loading.classList.remove('hidden');
    elements.search.addEventListener('input', filter);
    elements.clear.addEventListener('click', function () { elements.search.value = ''; filter(); elements.search.focus(); });
    elements.modal.addEventListener('click', function (event) { if (event.target === elements.modal) closeDetails(); });
    document.addEventListener('keydown', function (event) { if (event.key === 'Escape') closeDetails(); });
    window.addEventListener('languageChanged', filter);

    try {
      var response = await fetch('/curriculum/data/teachers.json?v=20260821.6');
      if (!response.ok) throw new Error('Teacher data request failed');
      teachers = await response.json();
      render(teachers);
    } catch (error) {
      elements.noResults.classList.remove('hidden');
      console.warn('[IVS Teachers]', error.message);
    } finally {
      elements.loading.classList.add('hidden');
    }
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, { once: true });
  else init();
})();
