// js/chapter-loader.js - IVS Story Reader Engine & Customization System

/**
 * Hàm khởi tạo bộ tải chương & trình đọc truyện chuyên nghiệp.
 * @param {string} storyPath - Tên thư mục chứa các tệp JSON (ví dụ: 'legnaxe_part1').
 * @param {number} totalChapters - Tổng số chương (không bao gồm epilogue/after-credit).
 * @param {boolean} hasSpecialChapter - Có hay không có chương đặc biệt (epilogue/after-credit).
 * @param {string} lang - Ngôn ngữ hiện tại ('en' hoặc 'vi').
 */
function initializeChapterLoader(storyPath, totalChapters, hasSpecialChapter, lang = 'vi') {
    // 1. TRẠNG THÁI READER & DỮ LIỆU
    let currentChapterIndex = 0;
    const chapterIds = [];
    const chapterTitlesMap = new Map();
    const isPart1 = storyPath.includes('part1');

    // Default & Saved Settings
    const defaultSettings = {
        fontSize: 17,
        fontFamily: 'serif',
        theme: 'light',
        lineHeight: 'normal',
        textAlign: 'justify',
        speechRate: 1.0,
    };

    let readerSettings = { ...defaultSettings };
    try {
        const saved = localStorage.getItem('ivs_reader_settings');
        if (saved) {
            readerSettings = { ...defaultSettings, ...JSON.parse(saved) };
        }
    } catch (e) {
        console.warn('Could not read reader settings from localStorage', e);
    }

    // TTS Audio States
    let ttsState = 'stopped'; // 'stopped' | 'playing' | 'paused'
    let synth = window.speechSynthesis || null;
    let currentUtterance = null;
    let currentChapterData = null;
    let ttsParagraphs = [];     // Array of plain-text paragraphs
    let ttsParagraphEls = [];   // Corresponding DOM <p> elements
    let ttsCurrentIndex = 0;    // Which paragraph is playing
    let availableVoices = [];   // All voices for current lang
    const speechSupported = 'speechSynthesis' in window;

    // Scroll & Auto-hide states
    let lastScrollY = window.pageYOffset;

    // Dynamic UI Container injection for Drawer, Toolbar, and Side Nav
    injectReaderUIContainers();

    // 2. PHẦN TỬ DOM CẦN THIẾT
    const dynamicContent = document.getElementById('dynamic-chapter-content');
    const mainElement = document.querySelector('main');
    const progressBar = document.querySelector('.progress-bar');
    
    const prevButtons = [
        document.getElementById('prev-chapter-btn'),
        document.getElementById('mobile-prev-chapter-btn'),
        document.getElementById('top-prev-chapter-btn'),
        document.getElementById('side-prev-chapter-btn'),
        document.getElementById('mobile-btn-prev'),
    ].filter(Boolean);

    const nextButtons = [
        document.getElementById('next-chapter-btn'),
        document.getElementById('mobile-next-chapter-btn'),
        document.getElementById('top-next-chapter-btn'),
        document.getElementById('side-next-chapter-btn'),
        document.getElementById('mobile-btn-next'),
    ].filter(Boolean);

    // 3. HELPER FUNCTIONS
    function saveSettings() {
        try {
            localStorage.setItem('ivs_reader_settings', JSON.stringify(readerSettings));
        } catch (e) {
            console.warn('Failed to save settings', e);
        }
        applyReaderSettings();
    }

    function applyReaderSettings() {
        const rootHtml = document.documentElement;
        const body = document.body;

        // Apply Theme
        rootHtml.classList.remove('theme-sepia', 'theme-midnight');
        body.classList.remove('theme-sepia', 'theme-midnight');
        if (readerSettings.theme === 'sepia') {
            rootHtml.classList.add('theme-sepia');
            body.classList.add('theme-sepia');
            rootHtml.classList.remove('dark');
        } else if (readerSettings.theme === 'midnight') {
            rootHtml.classList.add('theme-midnight', 'dark');
            body.classList.add('theme-midnight', 'dark');
        } else if (readerSettings.theme === 'dark') {
            rootHtml.classList.add('dark');
            rootHtml.classList.remove('theme-sepia', 'theme-midnight');
        } else {
            rootHtml.classList.remove('dark', 'theme-sepia', 'theme-midnight');
        }

        // Apply Font Family
        body.classList.remove('reader-font-serif', 'reader-font-sans', 'reader-font-book');
        body.classList.add(`reader-font-${readerSettings.fontFamily}`);

        // Apply Line Height & Text Align
        body.classList.remove('line-height-compact', 'line-height-normal', 'line-height-relaxed');
        body.classList.add(`line-height-${readerSettings.lineHeight}`);

        body.classList.remove('text-align-justify', 'text-align-left');
        body.classList.add(`text-align-${readerSettings.textAlign}`);

        // Apply Font Size to chapter paragraphs
        document.querySelectorAll('.chapter-body p').forEach((p) => {
            p.style.fontSize = `${readerSettings.fontSize}px`;
        });

        // Sync Settings Panel UI Controls
        syncSettingsUIControls();
    }

    function syncSettingsUIControls() {
        const settingsPanel = document.getElementById('reader-settings-panel');
        if (!settingsPanel) return;

        settingsPanel.querySelectorAll('.theme-pill').forEach((pill) => {
            const isMatch = pill.dataset.theme === readerSettings.theme;
            pill.classList.toggle('is-selected', isMatch);
        });

        const fontSizeVal = settingsPanel.querySelector('#font-size-value');
        if (fontSizeVal) fontSizeVal.textContent = `${readerSettings.fontSize}px`;

        const fontSelect = settingsPanel.querySelector('#font-family-select');
        if (fontSelect) fontSelect.value = readerSettings.fontFamily;

        const lineSelect = settingsPanel.querySelector('#line-height-select');
        if (lineSelect) lineSelect.value = readerSettings.lineHeight;

        const alignSelect = settingsPanel.querySelector('#text-align-select');
        if (alignSelect) alignSelect.value = readerSettings.textAlign;

        const speedSelect = settingsPanel.querySelector('#speech-rate-select');
        if (speedSelect) speedSelect.value = String(readerSettings.speechRate);

        const speedRange = document.getElementById('tts-speed-range');
        if (speedRange) speedRange.value = String(readerSettings.speechRate || 1.0);

        const speedLabel = document.getElementById('tts-speed-label');
        if (speedLabel) speedLabel.textContent = `${parseFloat(readerSettings.speechRate || 1.0).toFixed(1)}x`;

        const voiceSel = document.getElementById('tts-voice-select');
        if (voiceSel && readerSettings.voiceIndex !== undefined) voiceSel.value = String(readerSettings.voiceIndex);
    }

    function escapeHtml(text) {
        return String(text ?? '')
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
    }

    function stripHtml(text) {
        return String(text ?? '').replace(/<[^>]*>/g, ' ');
    }

    function parseChapterData(chapterData, fallbackChapterId = '') {
        const rawTitle = String(chapterData?.[`title_${lang}`] || chapterData?.title || chapterData?.title_vi || '').trim();
        const rawContent = String(chapterData?.[`content_${lang}`] || chapterData?.content || chapterData?.content_vi || '').trim();
        const fallbackLabel = fallbackChapterId.startsWith('chapter-')
            ? `${lang === 'vi' ? 'Chương' : 'Chapter'} ${fallbackChapterId.split('-')[1]}`
            : (lang === 'vi' ? 'Chương đặc biệt' : 'Special Chapter');

        const containsHtml = /<[^>]+>/.test(rawContent);
        if (containsHtml) {
            const bodyText = stripHtml(rawContent).replace(/\s+/g, ' ').trim();
            const words = bodyText.split(/\s+/).filter(Boolean).length;
            const readTimeMinutes = Math.max(1, Math.ceil(words / 200));
            return {
                chapterId: fallbackChapterId,
                label: fallbackLabel,
                title: rawTitle || fallbackLabel,
                fullTitle: rawTitle ? `${fallbackLabel}: ${rawTitle}` : fallbackLabel,
                bodyHtml: rawContent,
                bodyText,
                wordCount: words,
                readTimeMinutes,
            };
        }

        const lines = rawContent.replace(/\r\n/g, '\n').split('\n').map(l => l.trim()).filter(Boolean);
        let label = fallbackLabel;
        let title = rawTitle;
        let bodyLines = [...lines];

        if (lines.length > 0 && /^(chương|chapter)\s+\d+/i.test(lines[0])) {
            label = lines[0];
            bodyLines = lines.slice(1);
        }

        if (!title && bodyLines.length > 0) {
            title = bodyLines[0];
            bodyLines = bodyLines.slice(1);
        }

        if (bodyLines[0] && /^\[[^\]]+\]$/.test(bodyLines[0])) {
            bodyLines = bodyLines.slice(1);
        }

        const bodyText = bodyLines.join('\n\n').trim();
        const words = bodyText.split(/\s+/).filter(Boolean).length;
        const readTimeMinutes = Math.max(1, Math.ceil(words / 200));

        const bodyHtml = bodyLines.length
            ? bodyLines.map(p => `<p>${escapeHtml(p)}</p>`).join('')
            : `<p class="text-gray-500 dark:text-gray-400">${lang === 'vi' ? 'Chưa có nội dung.' : 'No content.'}</p>`;

        return {
            chapterId: fallbackChapterId,
            label,
            title: title || fallbackLabel,
            fullTitle: title ? `${label}: ${title}` : label,
            bodyHtml,
            bodyText,
            wordCount: words,
            readTimeMinutes,
        };
    }

    // 4. INJECT HTML UI CONTAINERS FOR TOOLBAR, DRAWER, AND SIDE FLOATING NAV
    function injectReaderUIContainers() {
        // Create Side Floating Desktop Navigation Arrows
        if (!document.getElementById('side-prev-chapter-btn')) {
            const sideNavMarkup = `
                <button id="side-prev-chapter-btn" class="side-nav-btn side-nav-left" title="${lang === 'vi' ? 'Chương trước (Phím ←)' : 'Previous Chapter (Left Arrow)'}">
                    <i class="fas fa-chevron-left text-lg"></i>
                </button>
                <button id="side-next-chapter-btn" class="side-nav-btn side-nav-right" title="${lang === 'vi' ? 'Chương sau (Phím →)' : 'Next Chapter (Right Arrow)'}">
                    <i class="fas fa-chevron-right text-lg"></i>
                </button>
            `;
            document.body.insertAdjacentHTML('beforeend', sideNavMarkup);
        }

        // Create Off-Canvas Drawer & Overlay
        if (!document.getElementById('reader-drawer-overlay')) {
            const drawerMarkup = `
                <div id="reader-drawer-overlay" class="reader-drawer-overlay"></div>
                <aside id="reader-drawer" class="reader-drawer" aria-label="Danh sách chương">
                    <div class="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-800">
                        <h3 class="text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                            <i class="fas fa-list-ul text-blue-600 dark:text-blue-400"></i>
                            <span>${lang === 'vi' ? 'Danh Sách Chương' : 'Chapter Table of Contents'}</span>
                        </h3>
                        <button id="close-drawer-btn" class="p-2 rounded-xl text-slate-500 hover:text-red-500 transition-colors">
                            <i class="fas fa-times text-xl"></i>
                        </button>
                    </div>
                    <div class="p-3 border-b border-slate-200 dark:border-slate-800">
                        <div class="relative">
                            <i class="fas fa-search absolute left-3 top-3 text-slate-400"></i>
                            <input id="drawer-chapter-search" type="text" placeholder="${lang === 'vi' ? 'Tìm chương...' : 'Search chapter...'}"
                                   class="w-full pl-9 pr-4 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500">
                        </div>
                    </div>
                    <div id="drawer-chapter-list" class="flex-1 overflow-y-auto p-3 space-y-1">
                        <!-- Populated by JS -->
                    </div>
                </aside>
            `;
            document.body.insertAdjacentHTML('beforeend', drawerMarkup);
        }

        // Create Floating TTS Player Bar
        if (!document.getElementById('tts-player-bar')) {
            const ttsBar = `
                <div id="tts-player-bar">
                    <button id="tts-bar-prev" class="tts-bar-btn tts-bar-btn-secondary" title="${lang === 'vi' ? 'Đoạn trước' : 'Prev paragraph'}">
                        <i class="fas fa-step-backward"></i>
                    </button>
                    <button id="tts-bar-play" class="tts-bar-btn tts-bar-btn-primary" title="${lang === 'vi' ? 'Phát / Tạm dừng' : 'Play / Pause'}">
                        <i class="fas fa-play"></i>
                    </button>
                    <button id="tts-bar-next" class="tts-bar-btn tts-bar-btn-secondary" title="${lang === 'vi' ? 'Đoạn sau' : 'Next paragraph'}">
                        <i class="fas fa-step-forward"></i>
                    </button>
                    <div class="tts-progress-info">
                        <span id="tts-bar-label" class="tts-progress-label">${lang === 'vi' ? 'Đang đọc...' : 'Reading...'}</span>
                        <div class="tts-progress-track">
                            <div id="tts-bar-fill" class="tts-progress-fill" style="width:0%"></div>
                        </div>
                    </div>
                    <button id="tts-bar-stop" class="tts-bar-btn tts-bar-btn-danger" title="${lang === 'vi' ? 'Dừng đọc' : 'Stop'}">
                        <i class="fas fa-stop"></i>
                    </button>
                </div>
            `;
            document.body.insertAdjacentHTML('beforeend', ttsBar);
        }

        // Create Focus Exit Button
        if (!document.getElementById('focus-exit-btn')) {
            const exitBtn = `<button id="focus-exit-btn" class="focus-exit-btn" title="Thoát chế độ tập trung"><i class="fas fa-compress"></i> <span>Thoát tập trung</span></button>`;
            document.body.insertAdjacentHTML('beforeend', exitBtn);
        }

        // Create Mobile App Bar
        if (!document.getElementById('mobile-app-bar')) {
            const mobileBar = `
                <div id="mobile-app-bar" class="mobile-app-bar sm:hidden">
                    <button id="mobile-btn-home" class="mobile-bar-btn" title="Trang chủ">
                        <i class="fas fa-house"></i>
                        <span class="btn-label">Trang chủ</span>
                    </button>
                    <button id="mobile-btn-drawer" class="mobile-bar-btn" title="Mục lục">
                        <i class="fas fa-list-ul"></i>
                        <span class="btn-label">Mục lục</span>
                    </button>
                    <button id="mobile-btn-prev" class="mobile-bar-btn" title="Chương trước">
                        <i class="fas fa-arrow-left"></i>
                        <span class="btn-label">Trước</span>
                    </button>
                    <button id="mobile-btn-next" class="mobile-bar-btn" title="Chương sau">
                        <i class="fas fa-arrow-right"></i>
                        <span class="btn-label">Sau</span>
                    </button>
                    <button id="mobile-btn-settings" class="mobile-bar-btn" title="Tùy chỉnh">
                        <i class="fas fa-sliders-h"></i>
                        <span class="btn-label">Tùy chỉnh</span>
                    </button>
                </div>
            `;
            document.body.insertAdjacentHTML('beforeend', mobileBar);
        }

        // Build Sticky Toolbar inside Reader Header with Prev & Next Chapter buttons
        const toolbarPlaceholder = document.querySelector('.reader-toolbar');
        if (toolbarPlaceholder) {
            toolbarPlaceholder.innerHTML = `
                <div class="reader-toolbar-container relative">
                    <div class="flex items-center gap-1.5 sm:gap-2">
                        <!-- Top Prev Chapter Button -->
                        <button id="top-prev-chapter-btn" class="reader-btn reader-btn-nav" title="${lang === 'vi' ? 'Chương trước (Phím ←)' : 'Previous Chapter'}">
                            <i class="fas fa-chevron-left"></i>
                            <span class="hidden md:inline">${lang === 'vi' ? 'Trước' : 'Prev'}</span>
                        </button>

                        <button id="btn-open-drawer" class="reader-btn text-slate-700 dark:text-slate-200" title="Mở danh sách chương">
                            <i class="fas fa-list-ul"></i>
                            <span class="hidden lg:inline">${lang === 'vi' ? 'Mục Lục' : 'Chapters'}</span>
                        </button>
                        
                        <select id="quick-chapter-select" class="text-xs sm:text-sm font-semibold py-1.5 px-2 sm:px-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 max-w-[130px] sm:max-w-[200px]">
                            <!-- Chapters option -->
                        </select>

                        <!-- Top Next Chapter Button -->
                        <button id="top-next-chapter-btn" class="reader-btn reader-btn-nav" title="${lang === 'vi' ? 'Chương sau (Phím →)' : 'Next Chapter'}">
                            <span class="hidden md:inline">${lang === 'vi' ? 'Sau' : 'Next'}</span>
                            <i class="fas fa-chevron-right"></i>
                        </button>
                    </div>

                    <div class="flex items-center gap-1.5 sm:gap-2">
                        <!-- Story Home Button -->
                        <a href="/Pages/apps/story/index.html" class="reader-btn reader-btn-nav text-slate-700 dark:text-slate-200" title="${lang === 'vi' ? 'Trang Chủ Truyện' : 'Story Home'}">
                            <i class="fas fa-house"></i>
                            <span class="hidden xl:inline">${lang === 'vi' ? 'Trang Chủ' : 'Home'}</span>
                        </a>

                        <!-- TTS Button -->
                        <button id="tts-toggle-btn" class="reader-btn reader-btn-primary shadow-sm" title="Nghe truyện bằng AI Voice">
                            <i id="tts-icon" class="fas fa-play"></i>
                            <span id="tts-text" class="hidden sm:inline">${lang === 'vi' ? 'Nghe truyện' : 'Audio'}</span>
                        </button>

                        <!-- Focus Mode Toggle -->
                        <button id="btn-toggle-focus" class="reader-btn hidden sm:inline-flex" title="Chế độ đọc tập trung (Toàn màn hình)">
                            <i class="fas fa-expand"></i>
                        </button>

                        <!-- Reader Settings Button & Popover Panel -->
                        <div class="relative">
                            <button id="btn-toggle-settings" class="reader-btn" title="Tùy chỉnh giao diện đọc">
                                <i class="fas fa-cog text-base"></i>
                            </button>

                            <div id="reader-settings-panel" class="reader-settings-panel">
                                <h4 class="text-sm font-bold text-slate-900 dark:text-slate-100 mb-3 border-b border-slate-200 dark:border-slate-700 pb-2">
                                    ${lang === 'vi' ? 'Tùy Chỉnh Giao Diện Đọc' : 'Reader Settings'}
                                </h4>
                                
                                <!-- Theme Selection -->
                                <div class="mb-4">
                                    <label class="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-2">${lang === 'vi' ? 'CHỦ ĐỀ ĐỌC' : 'THEME'}</label>
                                    <div class="grid grid-cols-4 gap-1.5">
                                        <button class="theme-pill theme-pill-light" data-theme="light">Sáng</button>
                                        <button class="theme-pill theme-pill-sepia" data-theme="sepia">Sepia</button>
                                        <button class="theme-pill theme-pill-dark" data-theme="dark">Tối</button>
                                        <button class="theme-pill theme-pill-midnight" data-theme="midnight">Midnight</button>
                                    </div>
                                </div>

                                <!-- Font Size Controls -->
                                <div class="mb-4">
                                    <div class="flex justify-between items-center mb-1.5">
                                        <label class="text-xs font-semibold text-slate-500 dark:text-slate-400">${lang === 'vi' ? 'KÍCH THƯỚC CHỮ' : 'FONT SIZE'}</label>
                                        <span id="font-size-value" class="text-xs font-bold text-blue-600 dark:text-blue-400">17px</span>
                                    </div>
                                    <div class="flex items-center gap-2">
                                        <button id="btn-font-dec" class="reader-settings-btn-action px-3 py-1 rounded-lg font-bold text-sm">A-</button>
                                        <button id="btn-font-reset" class="reader-settings-btn-action flex-1 py-1 rounded-lg font-semibold text-xs">${lang === 'vi' ? 'Mặc định' : 'Reset'}</button>
                                        <button id="btn-font-inc" class="reader-settings-btn-action px-3 py-1 rounded-lg font-bold text-sm">A+</button>
                                    </div>
                                </div>

                                <!-- Font Family Select -->
                                <div class="mb-4">
                                    <label class="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5">${lang === 'vi' ? 'FONT CHỮ' : 'FONT FAMILY'}</label>
                                    <select id="font-family-select" class="w-full text-xs font-semibold py-1.5 px-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200">
                                        <option value="serif">Merriweather (Serif cổ điển)</option>
                                        <option value="book">Georgia / Charter (Book Font)</option>
                                        <option value="sans">Inter / System (Sans-serif)</option>
                                    </select>
                                </div>

                                <!-- Line Height & Text Align -->
                                <div class="grid grid-cols-2 gap-2 mb-4">
                                    <div>
                                        <label class="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">${lang === 'vi' ? 'DÒNG' : 'SPACING'}</label>
                                        <select id="line-height-select" class="w-full text-xs font-semibold py-1.5 px-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200">
                                            <option value="compact">Gọn (1.65)</option>
                                            <option value="normal">Chuẩn (1.95)</option>
                                            <option value="relaxed">Thoáng (2.3)</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label class="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">${lang === 'vi' ? 'CĂN LỀ' : 'ALIGN'}</label>
                                        <select id="text-align-select" class="w-full text-xs font-semibold py-1.5 px-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200">
                                            <option value="justify">Căn đều 2 bên</option>
                                            <option value="left">Căn trái</option>
                                        </select>
                                    </div>
                                </div>

                                <!-- TTS Voice & Speed -->
                                <div class="mb-3">
                                    <label class="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">${lang === 'vi' ? 'GIỌNG ĐỌC' : 'VOICE'}</label>
                                    <select id="tts-voice-select">
                                        <option value="">${lang === 'vi' ? 'Đang tải giọng...' : 'Loading voices...'}</option>
                                    </select>
                                </div>
                                <div>
                                    <div class="flex justify-between items-center mb-1">
                                        <label class="text-xs font-semibold text-slate-500 dark:text-slate-400">${lang === 'vi' ? 'TỐC ĐỘ ĐỌC' : 'SPEED'}</label>
                                        <span id="tts-speed-label" class="text-xs font-bold text-blue-600 dark:text-blue-400">1.0x</span>
                                    </div>
                                    <input type="range" id="tts-speed-range" min="0.6" max="2.0" step="0.1" value="${readerSettings.speechRate || 1.0}">
                                    <!-- hidden select kept for settings save compatibility -->
                                    <select id="speech-rate-select" class="hidden">
                                        <option value="0.8">0.8x</option>
                                        <option value="1.0">1.0x</option>
                                        <option value="1.2">1.2x</option>
                                        <option value="1.5">1.5x</option>
                                        <option value="2.0">2.0x</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            `;

            // --- Sticky "is-stuck" detection via IntersectionObserver ---
            // Place a 1-px invisible sentinel just ABOVE the toolbar.
            // When the sentinel leaves the viewport the toolbar is stuck.
            const toolbar = document.querySelector('.reader-toolbar');
            if (toolbar && 'IntersectionObserver' in window) {
                const sentinel = document.createElement('div');
                sentinel.style.cssText = 'position:absolute;top:0;height:1px;width:1px;pointer-events:none;visibility:hidden;';
                toolbar.parentElement.insertBefore(sentinel, toolbar);

                const obs = new IntersectionObserver(
                    ([entry]) => toolbar.classList.toggle('is-stuck', !entry.isIntersecting),
                    { threshold: [1] }
                );
                obs.observe(sentinel);
            }
        }
    }

    // 5. LOAD ALL CHAPTER METADATA FOR DRAWER & SELECT
    async function loadAllChapterMetadata() {
        for (let i = 1; i <= totalChapters; i++) {
            chapterIds.push(`chapter-${i}`);
        }
        if (hasSpecialChapter) {
            chapterIds.push(isPart1 ? 'epilogue' : 'after-credit');
        }

        for (let i = 0; i < chapterIds.length; i++) {
            const id = chapterIds[i];
            let fileName = id.startsWith('chapter-') ? `chapter_${id.split('-')[1].padStart(2, '0')}.json` : `${id}.json`;
            const path = `../data/novels/${storyPath}/${fileName}`;

            try {
                const res = await fetch(path);
                if (res.ok) {
                    const data = await res.json();
                    const parsed = parseChapterData(data, id);
                    chapterTitlesMap.set(id, parsed);
                }
            } catch (err) {
                console.error('Error fetching metadata for', id, err);
            }
        }

        renderDrawerItems();
        renderQuickSelectOptions();
    }

    function renderQuickSelectOptions() {
        const quickSelect = document.getElementById('quick-chapter-select');
        if (!quickSelect) return;

        quickSelect.innerHTML = chapterIds.map(id => {
            const meta = chapterTitlesMap.get(id);
            const label = meta ? meta.fullTitle : id;
            return `<option value="${id}">${escapeHtml(label)}</option>`;
        }).join('');

        quickSelect.value = chapterIds[currentChapterIndex] || chapterIds[0];
    }

    function renderDrawerItems(filterQuery = '') {
        const drawerList = document.getElementById('drawer-chapter-list');
        if (!drawerList) return;

        const currentId = chapterIds[currentChapterIndex];
        const query = filterQuery.toLowerCase().trim();

        const filtered = chapterIds.filter(id => {
            const meta = chapterTitlesMap.get(id);
            if (!query) return true;
            return (meta?.fullTitle || id).toLowerCase().includes(query) || (meta?.bodyText || '').toLowerCase().includes(query);
        });

        if (filtered.length === 0) {
            drawerList.innerHTML = `<p class="text-xs text-center p-4 chapter-meta-info">${lang === 'vi' ? 'Không tìm thấy chương phù hợp' : 'No matching chapters found'}</p>`;
            return;
        }

        drawerList.innerHTML = filtered.map(id => {
            const meta = chapterTitlesMap.get(id);
            const isCurrent = id === currentId;
            return `
                <a href="#${id}" data-chapter-id="${id}" class="drawer-chapter-item ${isCurrent ? 'is-current' : ''}">
                    <div class="flex justify-between items-start">
                        <span class="chapter-item-title text-xs font-bold">${escapeHtml(meta?.fullTitle || id)}</span>
                        ${meta?.readTimeMinutes ? `<span class="chapter-item-time text-[10px] px-1.5 py-0.5 rounded font-medium">~${meta.readTimeMinutes}p</span>` : ''}
                    </div>
                </a>
            `;
        }).join('');
    }

    // 6. FETCH & RENDER CHAPTER CONTENT
    async function fetchChapterContent(chapterId) {
        dynamicContent.innerHTML = `
            <div class="p-12 text-center chapter-meta-info">
                <i class="fas fa-spinner fa-spin text-3xl mb-3 text-blue-500"></i>
                <p>${lang === 'vi' ? 'Đang tải nội dung chương...' : 'Loading chapter content...'}</p>
            </div>
        `;

        const num = chapterId.startsWith('chapter-') ? chapterId.split('-')[1].padStart(2, '0') : '';
        const fileName = num ? `chapter_${num}.json` : `${chapterId}.json`;
        const path = `../data/novels/${storyPath}/${fileName}`;

        try {
            const res = await fetch(path);
            if (!res.ok) throw new Error(`HTTP Error ${res.status}`);
            return await res.json();
        } catch (err) {
            console.error('Fetch chapter failed:', err);
            dynamicContent.innerHTML = `<p class="p-6 text-center text-red-500">Lỗi không thể tải chương: ${chapterId}</p>`;
            return null;
        }
    }

    function renderChapter(chapterData, chapterId) {
        if (!chapterData) return;

        currentChapterData = chapterData;
        const parsed = parseChapterData(chapterData, chapterId);
        const partNumber = storyPath.includes('part1') ? '1' : '2';

        const contentHtml = `
            <article class="chapter-article">
                <header class="chapter-header mb-8 border-b border-slate-200/80 pb-6 dark:border-slate-800">
                    <div class="flex items-center justify-between mb-2">
                        <span class="chapter-label-badge text-xs font-bold uppercase tracking-widest">${escapeHtml(parsed.label)}</span>
                        <div class="chapter-meta-info flex items-center gap-3 text-xs font-medium">
                            <span><i class="far fa-clock mr-1"></i>~${parsed.readTimeMinutes} ${lang === 'vi' ? 'phút đọc' : 'min read'}</span>
                            <span><i class="fas fa-align-left mr-1"></i>${parsed.wordCount} ${lang === 'vi' ? 'từ' : 'words'}</span>
                        </div>
                    </div>
                    <h2 class="chapter-title text-2xl sm:text-4xl font-extrabold">${escapeHtml(parsed.title)}</h2>
                </header>
                <div class="prose chapter-body max-w-none">
                    ${parsed.bodyHtml}
                </div>
            </article>
        `;

        dynamicContent.innerHTML = contentHtml;
        document.title = `${parsed.fullTitle} - LEGNAXE Part ${partNumber}`;

        applyReaderSettings();

        const quickSelect = document.getElementById('quick-chapter-select');
        if (quickSelect) quickSelect.value = chapterId;
        renderDrawerItems();

        const headerOffset = 90;
        window.scrollTo({ top: mainElement.offsetTop - headerOffset, behavior: 'smooth' });

        saveBookmark(chapterId);
    }

    function saveBookmark(chapterId) {
        try {
            const bookmarkKey = `ivs_bookmark_${storyPath}`;
            localStorage.setItem(bookmarkKey, JSON.stringify({
                chapterId,
                timestamp: Date.now(),
            }));
        } catch (e) {
            console.warn('Cannot save bookmark', e);
        }
    }

    // 7. TTS AUDIO LOGIC — Paragraph-by-paragraph with highlight & scroll
    if (speechSupported) {
        synth = window.speechSynthesis;
        if (synth.onvoiceschanged !== undefined) {
            synth.onvoiceschanged = () => { loadVoiceOptions(); };
        }
        // Some browsers fire onvoiceschanged sync
        setTimeout(loadVoiceOptions, 200);
    }

    // --- Voice Loading ---
    function loadVoiceOptions() {
        if (!synth) return;
        const voices = synth.getVoices();
        const targetLang = lang === 'vi' ? 'vi-VN' : 'en';
        availableVoices = lang === 'vi'
            ? voices.filter(v => v.lang.toLowerCase().startsWith('vi'))
            : voices.filter(v => v.lang.startsWith('en-'));

        // Fallback: if no lang-specific voices, offer all
        if (availableVoices.length === 0) availableVoices = voices;

        // Sort voices to pick the best/most natural default voice
        availableVoices.sort((a, b) => {
            const score = v => {
                let s = 0;
                const name = v.name.toLowerCase();
                if (lang === 'vi') {
                    if (name.includes('namminh') || name.includes('nam minh')) s += 100;
                    if (name.includes('hoaimy') || name.includes('hoai my')) s += 50;
                    if (name.includes('natural')) s += 30;
                    if (name.includes('google')) s += 20;
                    if (name.includes('microsoft')) s += 10;
                } else {
                    // English voices ranking
                    if (name.includes('natural')) s += 50;
                    if (name.includes('online')) s += 40;
                    if (name.includes('aria') || name.includes('guy') || name.includes('jenny')) s += 30;
                    if (name.includes('google')) s += 20;
                    if (name.includes('neural')) s += 20;
                    if (name.includes('premium') || name.includes('enhanced')) s += 15;
                    if (name.includes('microsoft')) s += 10;
                }
                return s;
            };
            return score(b) - score(a);
        });

        const sel = document.getElementById('tts-voice-select');
        if (!sel) return;
        sel.innerHTML = availableVoices.map((v, i) => {
            const label = v.name.replace(/^Microsoft\s+/i, '').replace(/\s*Online\s*/i, ' ').trim();
            return `<option value="${i}">${label} (${v.lang})</option>`;
        }).join('');

        // Restore saved voice, or set default to index 0 (top-scored best voice)
        if (readerSettings.voiceIndex !== undefined && availableVoices[readerSettings.voiceIndex]) {
            sel.value = String(readerSettings.voiceIndex);
        } else {
            sel.value = '0';
            readerSettings.voiceIndex = 0;
        }
    }

    function getSelectedVoice() {
        const sel = document.getElementById('tts-voice-select');
        const idx = sel ? parseInt(sel.value, 10) : 0;
        return (availableVoices[idx] || null);
    }

    // --- Player Bar UI ---
    function showTTSBar() {
        document.getElementById('tts-player-bar')?.classList.add('is-visible');
    }
    function hideTTSBar() {
        document.getElementById('tts-player-bar')?.classList.remove('is-visible');
    }

    function updateTTSBarProgress() {
        const label = document.getElementById('tts-bar-label');
        const fill = document.getElementById('tts-bar-fill');
        const total = ttsParagraphs.length;
        if (label) label.textContent = total > 0 ? `${lang === 'vi' ? 'Đoạn' : 'Para'} ${ttsCurrentIndex + 1} / ${total}` : (lang === 'vi' ? 'Đang đọc...' : 'Reading...');
        if (fill) fill.style.width = total > 0 ? `${((ttsCurrentIndex + 1) / total) * 100}%` : '0%';
    }

    function updateTTSToolbarBtn() {
        const btn = document.getElementById('tts-toggle-btn');
        const icon = document.getElementById('tts-icon');
        const text = document.getElementById('tts-text');
        const barPlayBtn = document.getElementById('tts-bar-play');
        if (!btn || !icon || !text) return;

        if (ttsState === 'playing') {
            icon.className = 'fas fa-pause';
            text.textContent = lang === 'vi' ? 'Tạm dừng' : 'Pause';
            btn.classList.add('reader-btn-tts-active');
            if (barPlayBtn) barPlayBtn.innerHTML = '<i class="fas fa-pause"></i>';
        } else if (ttsState === 'paused') {
            icon.className = 'fas fa-play';
            text.textContent = lang === 'vi' ? 'Tiếp tục' : 'Resume';
            btn.classList.remove('reader-btn-tts-active');
            if (barPlayBtn) barPlayBtn.innerHTML = '<i class="fas fa-play"></i>';
        } else {
            icon.className = 'fas fa-play';
            text.textContent = lang === 'vi' ? 'Nghe truyện' : 'Listen';
            btn.classList.remove('reader-btn-tts-active');
            if (barPlayBtn) barPlayBtn.innerHTML = '<i class="fas fa-play"></i>';
        }
    }

    // --- Highlight ---
    function highlightParagraph(index) {
        ttsParagraphEls.forEach(el => el.classList.remove('tts-active'));
        const el = ttsParagraphEls[index];
        if (el) {
            el.classList.add('tts-active');
            el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    }

    function clearHighlight() {
        ttsParagraphEls.forEach(el => el.classList.remove('tts-active'));
    }

    // --- Core TTS: speak a single paragraph ---
    function speakParagraph(index) {
        if (!speechSupported || !synth || index < 0 || index >= ttsParagraphs.length) {
            stopTTS();
            return;
        }

        if (synth.speaking) synth.cancel();

        ttsCurrentIndex = index;
        ttsState = 'playing';
        highlightParagraph(index);
        updateTTSBarProgress();
        updateTTSToolbarBtn();

        const text = ttsParagraphs[index];
        currentUtterance = new SpeechSynthesisUtterance(text);
        currentUtterance.lang = lang === 'vi' ? 'vi-VN' : 'en-US';
        currentUtterance.rate = parseFloat(readerSettings.speechRate) || 1.0;
        const voice = getSelectedVoice();
        if (voice) currentUtterance.voice = voice;

        currentUtterance.onend = () => {
            if (ttsState !== 'playing') return;
            if (ttsCurrentIndex < ttsParagraphs.length - 1) {
                speakParagraph(ttsCurrentIndex + 1);
            } else {
                // Finished entire chapter
                stopTTS();
            }
        };
        currentUtterance.onerror = (e) => {
            if (e.error === 'interrupted') return; // user-triggered cancel, ignore
            console.warn('TTS error:', e.error);
            stopTTS();
        };

        synth.speak(currentUtterance);
    }

    // --- TTS Controls ---
    function startTTS() {
        if (!speechSupported || !currentChapterData) return;

        // Build paragraph list from current chapter DOM
        ttsParagraphEls = Array.from(document.querySelectorAll('.chapter-body p'));
        ttsParagraphs = ttsParagraphEls.map(p => p.innerText.trim()).filter(t => t.length > 0);
        // Filter out empties and re-sync el array
        const validPairs = ttsParagraphEls
            .map((el, i) => ({ el, text: el.innerText.trim() }))
            .filter(pair => pair.text.length > 0);
        ttsParagraphEls = validPairs.map(p => p.el);
        ttsParagraphs = validPairs.map(p => p.text);

        if (ttsParagraphs.length === 0) return;

        showTTSBar();
        speakParagraph(0);
    }

    function pauseTTS() {
        if (!synth || ttsState !== 'playing') return;
        synth.pause();
        ttsState = 'paused';
        updateTTSToolbarBtn();
    }

    function resumeTTS() {
        if (!synth || ttsState !== 'paused') return;
        synth.resume();
        ttsState = 'playing';
        updateTTSToolbarBtn();
    }

    function stopTTS() {
        if (synth && synth.speaking) synth.cancel();
        ttsState = 'stopped';
        clearHighlight();
        hideTTSBar();
        updateTTSToolbarBtn();
    }

    function toggleSpeech() {
        if (!speechSupported || !currentChapterData) return;
        if (ttsState === 'stopped') {
            startTTS();
        } else if (ttsState === 'playing') {
            pauseTTS();
        } else if (ttsState === 'paused') {
            resumeTTS();
        }
    }

    // 8. NAVIGATION LOGIC
    async function navigateToChapter(chapterId) {
        stopTTS();
        const data = await fetchChapterContent(chapterId);
        if (data) {
            currentChapterIndex = chapterIds.indexOf(chapterId);
            renderChapter(data, chapterId);
            updateNavigationButtons();
            if (window.location.hash.substring(1) !== chapterId) {
                window.location.hash = chapterId;
            }
            updateProgressBar();
        }
    }

    function updateNavigationButtons() {
        const prevDisabled = currentChapterIndex <= 0;
        const nextDisabled = currentChapterIndex >= chapterIds.length - 1;

        prevButtons.forEach((btn) => {
            btn.disabled = prevDisabled;
            btn.classList.toggle('opacity-30', prevDisabled);
            btn.classList.toggle('cursor-not-allowed', prevDisabled);
        });

        nextButtons.forEach((btn) => {
            btn.disabled = nextDisabled;
            btn.classList.toggle('opacity-30', nextDisabled);
            btn.classList.toggle('cursor-not-allowed', nextDisabled);
        });
    }

    function updateProgressBar() {
        if (!progressBar) return;
        const total = chapterIds.length;
        const overallProgress = Math.min(100, Math.max(5, ((currentChapterIndex + 1) / total) * 100));
        progressBar.style.width = `${overallProgress}%`;
    }

    // 9. EVENT LISTENERS SETUP
    function bindEventListeners() {
        prevButtons.forEach(btn => btn.addEventListener('click', () => {
            if (currentChapterIndex > 0) navigateToChapter(chapterIds[currentChapterIndex - 1]);
        }));

        nextButtons.forEach(btn => btn.addEventListener('click', () => {
            if (currentChapterIndex < chapterIds.length - 1) navigateToChapter(chapterIds[currentChapterIndex + 1]);
        }));

        const openDrawerBtn = document.getElementById('btn-open-drawer');
        const mobileDrawerBtn = document.getElementById('mobile-btn-drawer');

        function toggleDrawer(open) {
            const drawer = document.getElementById('reader-drawer');
            const drawerOverlay = document.getElementById('reader-drawer-overlay');
            if (!drawer || !drawerOverlay) return;
            drawer.classList.toggle('is-active', open);
            drawerOverlay.classList.toggle('is-active', open);
            document.body.style.overflow = open ? 'hidden' : '';
        }

        openDrawerBtn?.addEventListener('click', () => toggleDrawer(true));
        mobileDrawerBtn?.addEventListener('click', () => toggleDrawer(true));
        document.getElementById('close-drawer-btn')?.addEventListener('click', () => toggleDrawer(false));
        document.getElementById('reader-drawer-overlay')?.addEventListener('click', () => toggleDrawer(false));

        document.getElementById('drawer-chapter-search')?.addEventListener('input', (e) => renderDrawerItems(e.target.value));

        document.getElementById('drawer-chapter-list')?.addEventListener('click', (e) => {
            const item = e.target.closest('a.drawer-chapter-item');
            if (item && item.dataset.chapterId) {
                e.preventDefault();
                navigateToChapter(item.dataset.chapterId);
                toggleDrawer(false);
            }
        });

        const quickSelect = document.getElementById('quick-chapter-select');
        quickSelect?.addEventListener('change', (e) => {
            navigateToChapter(e.target.value);
        });

        const toggleSettingsBtn = document.getElementById('btn-toggle-settings');
        const mobileSettingsBtn = document.getElementById('mobile-btn-settings');

        function toggleSettingsPanel() {
            const settingsPanel = document.getElementById('reader-settings-panel');
            if (!settingsPanel) return;
            settingsPanel.classList.toggle('is-active');
        }

        toggleSettingsBtn?.addEventListener('click', (e) => {
            e.stopPropagation();
            toggleSettingsPanel();
        });
        mobileSettingsBtn?.addEventListener('click', (e) => {
            e.stopPropagation();
            toggleSettingsPanel();
        });

        document.addEventListener('click', (e) => {
            const settingsPanel = document.getElementById('reader-settings-panel');
            if (settingsPanel && !settingsPanel.contains(e.target) && !toggleSettingsBtn?.contains(e.target) && !mobileSettingsBtn?.contains(e.target)) {
                settingsPanel.classList.remove('is-active');
            }
        });

        document.getElementById('reader-settings-panel')?.querySelectorAll('.theme-pill').forEach(pill => {
            pill.addEventListener('click', () => {
                readerSettings.theme = pill.dataset.theme;
                saveSettings();
            });
        });

        document.getElementById('btn-font-dec')?.addEventListener('click', () => {
            if (readerSettings.fontSize > 14) {
                readerSettings.fontSize -= 1;
                saveSettings();
            }
        });
        document.getElementById('btn-font-inc')?.addEventListener('click', () => {
            if (readerSettings.fontSize < 24) {
                readerSettings.fontSize += 1;
                saveSettings();
            }
        });
        document.getElementById('btn-font-reset')?.addEventListener('click', () => {
            readerSettings.fontSize = defaultSettings.fontSize;
            saveSettings();
        });

        document.getElementById('font-family-select')?.addEventListener('change', (e) => {
            readerSettings.fontFamily = e.target.value;
            saveSettings();
        });

        document.getElementById('line-height-select')?.addEventListener('change', (e) => {
            readerSettings.lineHeight = e.target.value;
            saveSettings();
        });
        document.getElementById('text-align-select')?.addEventListener('change', (e) => {
            readerSettings.textAlign = e.target.value;
            saveSettings();
        });

        document.getElementById('speech-rate-select')?.addEventListener('change', (e) => {
            readerSettings.speechRate = parseFloat(e.target.value) || 1.0;
            saveSettings();
        });

        // TTS Speed Range Slider
        const speedRange = document.getElementById('tts-speed-range');
        const speedLabel = document.getElementById('tts-speed-label');
        if (speedRange) {
            speedRange.value = String(readerSettings.speechRate || 1.0);
            if (speedLabel) speedLabel.textContent = `${parseFloat(speedRange.value).toFixed(1)}x`;
            speedRange.addEventListener('input', (e) => {
                const val = parseFloat(e.target.value);
                readerSettings.speechRate = val;
                if (speedLabel) speedLabel.textContent = `${val.toFixed(1)}x`;
                // Also sync hidden select
                const rateSelect = document.getElementById('speech-rate-select');
                if (rateSelect) {
                    const closest = ['0.8','1.0','1.2','1.5','2.0'].reduce((prev, cur) => Math.abs(parseFloat(cur) - val) < Math.abs(parseFloat(prev) - val) ? cur : prev);
                    rateSelect.value = closest;
                }
                saveSettings();
                // If currently playing, restart current paragraph with new speed
                if (ttsState === 'playing') speakParagraph(ttsCurrentIndex);
            });
        }

        // TTS Voice Select
        document.getElementById('tts-voice-select')?.addEventListener('change', (e) => {
            readerSettings.voiceIndex = parseInt(e.target.value, 10);
            saveSettings();
            // Restart current paragraph with new voice
            if (ttsState === 'playing') speakParagraph(ttsCurrentIndex);
        });

        // TTS Toolbar Toggle Button
        document.getElementById('tts-toggle-btn')?.addEventListener('click', toggleSpeech);

        // TTS Player Bar Buttons
        document.getElementById('tts-bar-play')?.addEventListener('click', toggleSpeech);
        document.getElementById('tts-bar-stop')?.addEventListener('click', stopTTS);
        document.getElementById('tts-bar-prev')?.addEventListener('click', () => {
            if (ttsCurrentIndex > 0) speakParagraph(ttsCurrentIndex - 1);
        });
        document.getElementById('tts-bar-next')?.addEventListener('click', () => {
            if (ttsCurrentIndex < ttsParagraphs.length - 1) speakParagraph(ttsCurrentIndex + 1);
        });

        const toggleFocusBtn = document.getElementById('btn-toggle-focus');
        const exitFocusBtn = document.getElementById('focus-exit-btn');

        function toggleFocusMode(enable) {
            document.body.classList.toggle('focus-mode', enable);
        }

        toggleFocusBtn?.addEventListener('click', () => toggleFocusMode(true));
        exitFocusBtn?.addEventListener('click', () => toggleFocusMode(false));

        document.getElementById('mobile-btn-home')?.addEventListener('click', () => {
            window.location.href = '/Pages/apps/story/index.html';
        });

        window.addEventListener('scroll', () => {
            const currentY = window.pageYOffset;
            const mobileAppBar = document.getElementById('mobile-app-bar');
            if (mobileAppBar) {
                if (currentY > lastScrollY && currentY > 200) {
                    mobileAppBar.classList.add('is-hidden');
                } else {
                    mobileAppBar.classList.remove('is-hidden');
                }
            }
            lastScrollY = currentY;
            updateProgressBar();
        });

        // Desktop Keyboard Shortcuts
        document.addEventListener('keydown', (e) => {
            if (['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement?.tagName)) return;
            const drawer = document.getElementById('reader-drawer');
            if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
                if (currentChapterIndex > 0) navigateToChapter(chapterIds[currentChapterIndex - 1]);
            } else if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
                if (currentChapterIndex < chapterIds.length - 1) navigateToChapter(chapterIds[currentChapterIndex + 1]);
            } else if (e.key === 'f' || e.key === 'F') {
                toggleFocusMode(!document.body.classList.contains('focus-mode'));
            } else if (e.key === 'm' || e.key === 'M') {
                if (drawer) toggleDrawer(!drawer.classList.contains('is-active'));
            } else if (e.key === 's' || e.key === 'S') {
                toggleSettingsPanel();
            }
        });
    }

    // 10. INITIALIZATION
    async function init() {
        applyReaderSettings();
        await loadAllChapterMetadata();
        bindEventListeners();

        const initialHash = window.location.hash.substring(1);
        if (initialHash && chapterIds.includes(initialHash)) {
            navigateToChapter(initialHash);
        } else if (chapterIds.length > 0) {
            navigateToChapter(chapterIds[0]);
        }
    }

    init();
}

window.initializeChapterLoader = initializeChapterLoader;
