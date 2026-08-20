import React, { useEffect, useMemo, useState } from 'react'
import { createRoot } from 'react-dom/client'
import MountAPI from './mount'
import './styles.css'

type Language = 'vi' | 'en' | 'zh'

const copy = {
  vi: {
    pageTitle: 'Trung tâm số IVS Academy',
    eyebrow: 'IVS Academy · Digital Hub',
    title: 'Một điểm truy cập cho toàn bộ hệ sinh thái IVS',
    intro: 'Khám phá chương trình giáo dục, dịch vụ giáo viên, tài nguyên học tập và các ứng dụng số trên mọi thiết bị.',
    services: 'Khám phá dịch vụ',
    consultation: 'Đăng ký tư vấn',
    section: 'Truy cập nhanh',
    sectionIntro: 'Chọn đúng khu vực bạn cần. Mọi liên kết đều mở trực tiếp tới trang dịch vụ tương ứng.',
    home: 'IVS Academy',
    homeDesc: 'Tổng quan hệ sinh thái giáo dục và các mô hình hợp tác.',
    teachers: 'Giáo viên quốc tế',
    teachersDesc: 'Nhu cầu giáo viên, hồ sơ, danh sách và dịch vụ hỗ trợ.',
    learning: 'Tài nguyên học tập',
    learningDesc: 'Tài liệu, thư viện và nội dung hỗ trợ giảng dạy.',
    apps: 'IVS Apps',
    appsDesc: 'Ứng dụng, công cụ và trải nghiệm học tập tương tác.',
    technology: 'IVS Tech',
    technologyDesc: 'Website, phần mềm, LMS, CRM, AI và chuyển đổi số.',
    open: 'Mở',
    back: 'Về trang chủ',
    language: 'Ngôn ngữ'
  },
  en: {
    pageTitle: 'IVS Academy Digital Hub',
    eyebrow: 'IVS Academy · Digital Hub',
    title: 'One gateway to the complete IVS ecosystem',
    intro: 'Explore education programs, teacher services, learning resources, and digital applications on any device.',
    services: 'Explore services',
    consultation: 'Request a consultation',
    section: 'Quick access',
    sectionIntro: 'Choose the area you need. Every link opens the relevant service page directly.',
    home: 'IVS Academy',
    homeDesc: 'An overview of the education ecosystem and partnership models.',
    teachers: 'International teachers',
    teachersDesc: 'Teacher requests, profiles, availability, and support services.',
    learning: 'Learning resources',
    learningDesc: 'Materials, libraries, and resources that support teaching and learning.',
    apps: 'IVS Apps',
    appsDesc: 'Applications, tools, and interactive learning experiences.',
    technology: 'IVS Tech',
    technologyDesc: 'Websites, software, LMS, CRM, AI, and digital transformation.',
    open: 'Open',
    back: 'Back to homepage',
    language: 'Language'
  },
  zh: {
    pageTitle: 'IVS Academy 数字中心',
    eyebrow: 'IVS Academy · 数字中心',
    title: '一站访问完整的 IVS 服务生态',
    intro: '随时随地了解教育项目、国际师资、学习资源和数字化应用。',
    services: '浏览全部服务',
    consultation: '预约咨询',
    section: '快速访问',
    sectionIntro: '选择您需要的服务领域，每个入口都会直接打开相应页面。',
    home: 'IVS Academy',
    homeDesc: '了解教育服务生态及多种合作模式。',
    teachers: '国际师资',
    teachersDesc: '教师需求、师资档案、可聘名单及配套服务。',
    learning: '学习资源',
    learningDesc: '教材、资源库及教学支持内容。',
    apps: 'IVS 应用',
    appsDesc: '应用、工具与互动式学习体验。',
    technology: 'IVS Tech',
    technologyDesc: '网站、软件、LMS、CRM、AI 与数字化转型。',
    open: '打开',
    back: '返回首页',
    language: '语言'
  }
} as const

function preferredLanguage(): Language {
  try {
    const value = localStorage.getItem('userPreferredLanguage')
    return value === 'en' || value === 'zh' ? value : 'vi'
  } catch {
    return 'vi'
  }
}

export function DigitalHub() {
  const [language, setLanguage] = useState<Language>(preferredLanguage)
  const t = copy[language]
  const links = useMemo(() => [
    { key: 'home', desc: 'homeDesc', icon: 'fa-graduation-cap', href: '/' },
    { key: 'teachers', desc: 'teachersDesc', icon: 'fa-chalkboard-user', href: '/ivs-global-teacher-hub.html' },
    { key: 'learning', desc: 'learningDesc', icon: 'fa-book-open', href: '/learning-materials.html' },
    { key: 'apps', desc: 'appsDesc', icon: 'fa-layer-group', href: '/Pages/apps/ivsapps.html' },
    { key: 'technology', desc: 'technologyDesc', icon: 'fa-microchip', href: 'https://ivstech.store/' }
  ] as const, [])

  useEffect(() => {
    document.documentElement.lang = language === 'zh' ? 'zh-CN' : language
    document.title = t.pageTitle
    document.querySelector('meta[name="description"]')?.setAttribute('content', t.intro)
  }, [language, t])

  function changeLanguage(next: Language) {
    setLanguage(next)
    try { localStorage.setItem('userPreferredLanguage', next) } catch {}
    document.documentElement.lang = next === 'zh' ? 'zh-CN' : next
  }

  return (
    <div className="hub-shell">
      <header className="hub-header">
        <a className="hub-brand" href="/" aria-label={t.back}>
          <img src="/images/logo/logo.svg" alt="IVS Academy" />
          <span>IVS <strong>Academy</strong></span>
        </a>
        <div className="hub-language" aria-label={t.language}>
          {(['vi', 'en', 'zh'] as Language[]).map(code => (
            <button key={code} type="button" className={language === code ? 'is-active' : ''} onClick={() => changeLanguage(code)} aria-pressed={language === code}>
              {code === 'zh' ? '中文' : code.toUpperCase()}
            </button>
          ))}
        </div>
      </header>

      <main>
        <section className="hub-hero">
          <div className="hub-hero-copy">
            <p className="hub-eyebrow">{t.eyebrow}</p>
            <h1>{t.title}</h1>
            <p className="hub-intro">{t.intro}</p>
            <div className="hub-actions">
              <a className="hub-button hub-button-primary" href="/#service-directory"><i className="fas fa-grid-2" aria-hidden="true" />{t.services}</a>
              <a className="hub-button hub-button-secondary" href="/contact.html"><i className="fas fa-paper-plane" aria-hidden="true" />{t.consultation}</a>
            </div>
          </div>
          <div className="hub-visual" aria-hidden="true">
            <div className="hub-orbit hub-orbit-one" />
            <div className="hub-orbit hub-orbit-two" />
            <div className="hub-logo-mark"><img src="/images/logo/logo.svg" alt="" /></div>
          </div>
        </section>

        <section className="hub-directory" aria-labelledby="hub-directory-title">
          <div className="hub-section-heading">
            <p className="hub-eyebrow">IVS Ecosystem</p>
            <h2 id="hub-directory-title">{t.section}</h2>
            <p>{t.sectionIntro}</p>
          </div>
          <div className="hub-grid">
            {links.map(item => (
              <a className="hub-card" href={item.href} key={item.key} target={item.href.startsWith('http') ? '_blank' : undefined} rel={item.href.startsWith('http') ? 'noopener noreferrer' : undefined}>
                <span className="hub-card-icon"><i className={`fas ${item.icon}`} aria-hidden="true" /></span>
                <span className="hub-card-copy">
                  <strong>{t[item.key]}</strong>
                  <span>{t[item.desc]}</span>
                </span>
                <span className="hub-card-open">{t.open}<i className="fas fa-arrow-right" aria-hidden="true" /></span>
              </a>
            ))}
          </div>
        </section>
      </main>

      <footer className="hub-footer">
        <span>© {new Date().getFullYear()} IVS JSC</span>
        <a href="/">{t.back}</a>
      </footer>
    </div>
  )
}

const rootElement = document.getElementById('root')
if (rootElement) {
  createRoot(rootElement).render(<DigitalHub />)
}

// expose mount API globally for incremental integration
;(window as any).mountIVSReactComponents = MountAPI
