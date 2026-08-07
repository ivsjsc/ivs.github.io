/**
 * IVS Academy - IT Training Pages v2 Interactive Scripts
 */

document.addEventListener('DOMContentLoaded', () => {
  // 1. Current Year Auto-fill
  const yearEls = document.querySelectorAll('[data-current-year]');
  const currentYear = new Date().getFullYear();
  yearEls.forEach(el => {
    el.textContent = currentYear;
  });

  // 2. Component Loader (Header & Footer) - handled centrally by /ai/js/loadComponents.js


  // 3. Category Filter Logic (if present on main page)
  const filterBtns = document.querySelectorAll('#course-filter-container .filter-btn');
  const courseCards = document.querySelectorAll('#course-cards-grid .course-card');

  if (filterBtns.length && courseCards.length) {
    filterBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        filterBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        const filter = btn.getAttribute('data-filter');
        courseCards.forEach(card => {
          const category = card.getAttribute('data-category');
          if (filter === 'all' || category === filter || category === 'all') {
            card.style.display = 'flex';
          } else {
            card.style.display = 'none';
          }
        });
      });
    });
  }

  // 4. Custom FAQ Accordions (for non-native details elements if present)
  const faqItems = document.querySelectorAll('#faq-accordion .faq-item');
  if (faqItems.length) {
    faqItems.forEach(item => {
      const button = item.querySelector('.faq-button');
      if (button) {
        button.addEventListener('click', () => {
          const isActive = item.classList.contains('active');
          faqItems.forEach(i => i.classList.remove('active'));
          if (!isActive) {
            item.classList.add('active');
          }
        });
      }
    });
  }

  // 5. Smooth scrolling for internal anchor links
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      const targetId = this.getAttribute('href');
      if (targetId && targetId !== '#') {
        const targetEl = document.querySelector(targetId);
        if (targetEl) {
          e.preventDefault();
          targetEl.scrollIntoView({
            behavior: 'smooth'
          });
        }
      }
    });
  });
});
