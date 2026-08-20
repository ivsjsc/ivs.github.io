'use strict';

(function () {
    const photos = [
        '/images/pages/aiphoto.jpg',
        '/images/pages/albums/20242011thcspt.jpg',
        '/images/pages/albums/20242011thcspt11.jpg',
        '/images/pages/albums/2024thcslp.jpg',
        '/images/pages/albums/2024thcspt.jpg',
        '/images/pages/albums/2024thcsth.jpg',
        '/images/pages/albums/2024thptlp.jpg',
        '/images/pages/albums/2024thtp.jpg',
        '/images/pages/albums/2024thtp1.jpg',
        '/images/pages/albums/2024thtp2.jpg',
        '/images/pages/albums/2024thtpht.jpg',
        '/images/pages/albums/2025thptlp.jpg',
        '/images/pages/albums/2025thptlt.jpg',
        '/images/pages/careers/career.jpg',
        '/images/pages/careers/website/web-doanhnghiep.jpg',
        '/images/pages/careers/website/web-khudulich.jpg',
        '/images/pages/careers/website/web-nhahang.jpg',
        '/images/pages/careers/website/web-plus.jpg',
        '/images/pages/careers/website/web-TMDT.jpg',
        '/images/pages/daotao-gv.jpg',
        '/images/pages/daotao-nn-kn.jpg',
        '/images/pages/englishlearners/1.jpg',
        '/images/pages/englishlearners/10.jpg',
        '/images/pages/englishlearners/11.png',
        '/images/pages/englishlearners/2.jpg',
        '/images/pages/englishlearners/3.jpg',
        '/images/pages/englishlearners/4.jpg',
        '/images/pages/englishlearners/5.jpg',
        '/images/pages/englishlearners/6.jpg',
        '/images/pages/englishlearners/7.jpg',
        '/images/pages/englishlearners/8.jpg',
        '/images/pages/englishlearners/9.jpg',
        '/images/pages/englishlearners/clb.jpg',
        '/images/pages/eov2025/eov2025.jpg',
        '/images/pages/eov2025/eov2025activities.jpg',
        '/images/pages/eov2025/eov2025award.jpg',
        '/images/pages/eov2025/eov2025round.jpg',
        '/images/pages/eov2025/iu-english-academy.jpg',
        '/images/pages/footer.jpg',
        '/images/pages/haynoi_banner.jpg',
        '/images/pages/healths/luvyoga1.jpg',
        '/images/pages/healths/luvyoga2.jpg',
        '/images/pages/healths/luvyoga3.jpg',
        '/images/pages/healths/luvyoga4.jpg',
        '/images/pages/healths/yensao1.jpg',
        '/images/pages/healths/yensao2.jpg',
        '/images/pages/healths/yensaocover.jpg',
        '/images/pages/ivs_solutions.jpg',
        '/images/pages/ivs-contact-banner.jpg',
        '/images/pages/ivs-kindergarten.jpg',
        '/images/pages/ivscelestech/it-learners.png',
        '/images/pages/ivscelestech/ivs.jpg',
        '/images/pages/ivscelestech/noithat-amgphuocthai.jpg',
        '/images/pages/ivscelestech/noithat-ieltsstation.jpg',
        '/images/pages/litigation_consulting.jpg',
        '/images/pages/novels/author-legnaxe.jpg',
        '/images/pages/novels/legnaxe.jpg',
        '/images/pages/novels/legnaxe1horizontal.jpg',
        '/images/pages/novels/legnaxe1vertical.jpg',
        '/images/pages/novels/legnaxe2horizontal.jpg',
        '/images/pages/novels/legnaxe2vertical.jpg',
        '/images/pages/novels/logo-legnaxe.jpg',
        '/images/pages/novels/pic-legnaxe3.jpg',
        '/images/pages/novels/pic-legnaxe4.jpg',
        '/images/pages/novels/pic-legnaxe5.jpg',
        '/images/pages/novels/pic-legnaxe6.jpg',
        '/images/pages/talktask.jpg'
    ];

    const categories = ['all', 'activities', 'education', 'technology', 'projects', 'communications'];
    let activeCategory = 'all';
    let visiblePhotos = [];
    let activeIndex = 0;
    let lastFocusedElement = null;

    function currentLanguage() {
        const raw = window.langSystem?.currentLanguage || document.documentElement.lang || 'vi';
        return raw.toLowerCase().startsWith('zh') ? 'zh' : (raw.toLowerCase().startsWith('en') ? 'en' : 'vi');
    }

    function translateKey(key) {
        if (typeof window.translate === 'function') {
            const translated = window.translate(key, currentLanguage());
            if (translated !== key) return translated;
        }
        const fallbacks = {
            gallery_filter_all: 'Tất cả',
            gallery_filter_activities: 'Hoạt động',
            gallery_filter_education: 'Giáo dục',
            gallery_filter_technology: 'Công nghệ',
            gallery_filter_projects: 'Dự án',
            gallery_filter_communications: 'Ấn phẩm',
            gallery_photos_count: '{count} hình ảnh',
            gallery_photo_label: 'Hình ảnh {index}',
            gallery_open_photo: 'Mở hình ảnh {index}',
            gallery_lightbox_close: 'Đóng',
            gallery_lightbox_previous: 'Ảnh trước',
            gallery_lightbox_next: 'Ảnh tiếp theo'
        };
        return fallbacks[key] || key;
    }

    function categoryFor(path) {
        if (/\/(albums|englishlearners|eov2025)\//.test(path)) return 'activities';
        if (/\/ivscelestech\//.test(path) || /\/careers\/website\//.test(path) || /\/(aiphoto|ivs_solutions)\./.test(path)) return 'technology';
        if (/\/(healths|novels)\//.test(path) || /\/(career|litigation_consulting)\./.test(path)) return 'projects';
        if (/\/(daotao-gv|daotao-nn-kn|haynoi_banner|ivs-kindergarten|talktask)\./.test(path)) return 'education';
        return 'communications';
    }

    function interpolate(template, values) {
        return Object.keys(values).reduce(function (result, key) {
            return result.replaceAll('{' + key + '}', String(values[key]));
        }, template);
    }

    function categoryLabel(category) {
        return translateKey('gallery_filter_' + category);
    }

    function photoLabel(photo) {
        return interpolate(translateKey('gallery_photo_label'), { index: photo.number });
    }

    function buildPhotoData() {
        return photos.map(function (src, index) {
            return { src: src, number: index + 1, category: categoryFor(src) };
        });
    }

    const photoData = buildPhotoData();

    function renderFilters() {
        const filters = document.getElementById('gallery-photo-filters');
        if (!filters) return;
        filters.replaceChildren();

        categories.forEach(function (category) {
            const button = document.createElement('button');
            button.type = 'button';
            button.className = 'ivs-photo-gallery__filter' + (category === activeCategory ? ' is-active' : '');
            button.textContent = categoryLabel(category);
            button.dataset.category = category;
            button.setAttribute('aria-pressed', String(category === activeCategory));
            button.addEventListener('click', function () {
                activeCategory = category;
                renderGallery();
            });
            filters.appendChild(button);
        });
    }

    function createPhotoCard(photo) {
        const button = document.createElement('button');
        const image = document.createElement('img');
        const caption = document.createElement('span');
        const label = document.createElement('span');
        const icon = document.createElement('i');

        button.type = 'button';
        button.className = 'ivs-photo-gallery__item';
        button.setAttribute('aria-label', interpolate(translateKey('gallery_open_photo'), { index: photo.number }));

        image.src = photo.src;
        image.alt = photoLabel(photo) + ' – ' + categoryLabel(photo.category);
        image.loading = 'lazy';
        image.decoding = 'async';

        caption.className = 'ivs-photo-gallery__caption';
        label.textContent = categoryLabel(photo.category);
        icon.className = 'fas fa-expand-alt';
        icon.setAttribute('aria-hidden', 'true');
        caption.append(label, icon);

        button.append(image, caption);
        button.addEventListener('click', function () {
            openLightbox(visiblePhotos.indexOf(photo), button);
        });
        return button;
    }

    function renderGallery() {
        const grid = document.getElementById('gallery-photo-grid');
        const count = document.getElementById('gallery-photo-count');
        if (!grid || !count) return;

        visiblePhotos = activeCategory === 'all'
            ? photoData.slice()
            : photoData.filter(function (photo) { return photo.category === activeCategory; });

        grid.replaceChildren(...visiblePhotos.map(createPhotoCard));
        count.textContent = interpolate(translateKey('gallery_photos_count'), { count: visiblePhotos.length });
        renderFilters();
    }

    function ensureLightbox() {
        let lightbox = document.getElementById('gallery-lightbox');
        if (lightbox) return lightbox;

        lightbox = document.createElement('div');
        lightbox.id = 'gallery-lightbox';
        lightbox.className = 'ivs-gallery-lightbox';
        lightbox.setAttribute('role', 'dialog');
        lightbox.setAttribute('aria-modal', 'true');
        lightbox.setAttribute('aria-hidden', 'true');

        const figure = document.createElement('figure');
        figure.className = 'ivs-gallery-lightbox__figure';
        const image = document.createElement('img');
        image.className = 'ivs-gallery-lightbox__image';
        image.id = 'gallery-lightbox-image';
        const caption = document.createElement('figcaption');
        caption.className = 'ivs-gallery-lightbox__caption';
        caption.id = 'gallery-lightbox-caption';
        figure.append(image, caption);

        function control(className, iconClass, action) {
            const button = document.createElement('button');
            const icon = document.createElement('i');
            button.type = 'button';
            button.className = 'ivs-gallery-lightbox__button ' + className;
            button.dataset.action = action;
            icon.className = iconClass;
            icon.setAttribute('aria-hidden', 'true');
            button.appendChild(icon);
            return button;
        }

        const close = control('ivs-gallery-lightbox__close', 'fas fa-times', 'close');
        const previous = control('ivs-gallery-lightbox__previous', 'fas fa-chevron-left', 'previous');
        const next = control('ivs-gallery-lightbox__next', 'fas fa-chevron-right', 'next');
        lightbox.append(figure, close, previous, next);
        document.body.appendChild(lightbox);

        close.addEventListener('click', closeLightbox);
        previous.addEventListener('click', function () { moveLightbox(-1); });
        next.addEventListener('click', function () { moveLightbox(1); });
        lightbox.addEventListener('click', function (event) {
            if (event.target === lightbox) closeLightbox();
        });
        return lightbox;
    }

    function updateLightboxCopy() {
        const lightbox = document.getElementById('gallery-lightbox');
        if (!lightbox) return;
        const labels = {
            close: translateKey('gallery_lightbox_close'),
            previous: translateKey('gallery_lightbox_previous'),
            next: translateKey('gallery_lightbox_next')
        };
        Object.keys(labels).forEach(function (action) {
            lightbox.querySelector('[data-action="' + action + '"]')?.setAttribute('aria-label', labels[action]);
        });
    }

    function updateLightboxPhoto() {
        const lightbox = ensureLightbox();
        const photo = visiblePhotos[activeIndex];
        if (!photo) return;
        const image = lightbox.querySelector('#gallery-lightbox-image');
        const caption = lightbox.querySelector('#gallery-lightbox-caption');
        const label = photoLabel(photo) + ' – ' + categoryLabel(photo.category);
        image.src = photo.src;
        image.alt = label;
        caption.textContent = label + ' · ' + (activeIndex + 1) + ' / ' + visiblePhotos.length;
        updateLightboxCopy();
    }

    function openLightbox(index, trigger) {
        activeIndex = index;
        lastFocusedElement = trigger;
        const lightbox = ensureLightbox();
        updateLightboxPhoto();
        lightbox.classList.add('is-open');
        lightbox.setAttribute('aria-hidden', 'false');
        document.body.style.overflow = 'hidden';
        lightbox.querySelector('[data-action="close"]')?.focus();
    }

    function closeLightbox() {
        const lightbox = document.getElementById('gallery-lightbox');
        if (!lightbox || !lightbox.classList.contains('is-open')) return;
        lightbox.classList.remove('is-open');
        lightbox.setAttribute('aria-hidden', 'true');
        document.body.style.overflow = '';
        lastFocusedElement?.focus();
    }

    function moveLightbox(direction) {
        if (!visiblePhotos.length) return;
        activeIndex = (activeIndex + direction + visiblePhotos.length) % visiblePhotos.length;
        updateLightboxPhoto();
    }

    function handleKeydown(event) {
        const lightbox = document.getElementById('gallery-lightbox');
        if (!lightbox?.classList.contains('is-open')) return;
        if (event.key === 'Escape') closeLightbox();
        if (event.key === 'ArrowLeft') moveLightbox(-1);
        if (event.key === 'ArrowRight') moveLightbox(1);
    }

    function initializeGallery() {
        if (!document.getElementById('gallery-photo-grid')) return;
        renderGallery();
        document.addEventListener('keydown', handleKeydown);
        window.addEventListener('languageChanged', function () {
            renderGallery();
            updateLightboxPhoto();
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initializeGallery, { once: true });
    } else {
        initializeGallery();
    }
})();
