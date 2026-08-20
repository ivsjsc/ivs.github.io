/**
 * Analytics Implementation Module
 * Handles Google Analytics integration and custom event tracking for IVS Academy
 */

class AnalyticsManager {
    constructor() {
        // Cấu hình GA4 property ID (hoặc đọc từ window.IVS_GA_ID)
        this.gaId = window.IVS_GA_ID || 'G-XXXXXXXXXX'; 
        this.events = [];
        this.userSession = this.initializeSession();
        this.initialize();
    }

    initialize() {
        if (this.gaId !== 'G-XXXXXXXXXX') {
            this.loadGoogleAnalytics();
        } else {
            // Safe stub if GA4 ID is placeholder
            window.dataLayer = window.dataLayer || [];
            window.gtag = window.gtag || function(){ dataLayer.push(arguments); };
        }
        this.setupEventTracking();
        this.setupEcosystemTracking();
        this.trackPageViews();
    }

    /**
     * Load Google Analytics 4 with Cross-Domain Measurement
     */
    loadGoogleAnalytics() {
        const script = document.createElement('script');
        script.async = true;
        script.src = `https://www.googletagmanager.com/gtag/js?id=${this.gaId}`;
        document.head.appendChild(script);

        window.dataLayer = window.dataLayer || [];
        function gtag(){dataLayer.push(arguments);}
        gtag('js', new Date());
        
        // Configure GA4 cross-domain measurement across the IVS platform ecosystem.
        gtag('config', this.gaId, {
            'linker': {
                'domains': [
                    'ivsacademy.edu.vn',
                    'ivstech.store',
                    'ivslearning.io.vn',
                    'dongnaicity.com.vn'
                ]
            },
            'anonymize_ip': true
        });

        window.gtag = gtag;
    }

    /**
     * Setup Ecosystem Navigation & Form Submission Event Listeners
     */
    setupEcosystemTracking() {
        document.addEventListener('click', (e) => {
            const link = e.target.closest('a');
            if (!link) return;

            const href = link.getAttribute('href') || '';
            const linkText = link.innerText.trim();

            const ecosystemDomains = ['ivstech.store', 'ivslearning.io.vn', 'dongnaicity.com.vn'];
            const targetSite = ecosystemDomains.find((domain) => href.includes(domain));

            if (targetSite) {
                this.trackEcosystemNavigation({
                    source_site: 'ivsacademy.edu.vn',
                    target_site: targetSite,
                    placement: link.closest('header') ? 'header' : link.closest('footer') ? 'footer' : 'body',
                    link_text: linkText,
                    link_url: href
                });
            } else if (href.includes('#contact')) {
                this.trackEvent('education_consultation_click', {
                    placement: link.closest('header') ? 'header' : 'hero',
                    link_text: linkText
                });
            }
        });

        // Form submission listener
        const form = document.getElementById('education-consultation-form') || document.getElementById('contact-form');
        if (form) {
            form.addEventListener('submit', (e) => {
                const isValid = form.checkValidity();
                if (isValid) {
                    this.trackEvent('education_form_submit', {
                        form_id: form.id,
                        service_selected: form.querySelector('[name="service_interest"]')?.value || 'N/A'
                    });
                } else {
                    this.trackEvent('form_submit_error', {
                        form_id: form.id,
                        reason: 'validation_failed'
                    });
                }
            });
        }
    }

    /**
     * Track ecosystem cross-domain navigation event
     */
    trackEcosystemNavigation(params) {
        this.trackEvent('ecosystem_navigation', params);
        if (params.target_site === 'ivstech.store') {
            this.trackEvent('academy_to_tech_click', params);
        }
    }

    /**
     * Generic Event Tracker
     */
    trackEvent(eventName, eventParams = {}) {
        if (typeof window.gtag === 'function') {
            window.gtag('event', eventName, eventParams);
        }
    }

    /**
     * Initialize user session tracking
     */
    initializeSession() {
        const session = {
            id: this.generateSessionId(),
            startTime: new Date().toISOString(),
            userId: this.getUserId(),
            pageViews: 0,
            events: [],
            educationalMetrics: {
                coursesViewed: [],
                materialsDownloaded: [],
                quizAttempts: [],
                timeSpentLearning: 0
            }
        };

        // Store session in sessionStorage
        sessionStorage.setItem('ivs-analytics-session', JSON.stringify(session));
        return session;
    }

    /**
     * Setup comprehensive event tracking
     */
    setupEventTracking() {
        // Course interactions
        this.trackCourseInteractions();

        // Material downloads
        this.trackMaterialDownloads();

        // Quiz interactions
        this.trackQuizInteractions();

        // Search interactions
        this.trackSearchInteractions();

        // User engagement
        this.trackUserEngagement();

        // Learning progress
        this.trackLearningProgress();

        // Social interactions
        this.trackSocialInteractions();
    }

    /**
     * Track course-related interactions
     */
    trackCourseInteractions() {
        // Course view events
        document.addEventListener('click', (e) => {
            if (e.target.closest('[data-course-id]')) {
                const courseElement = e.target.closest('[data-course-id]');
                const courseId = courseElement.dataset.courseId;
                const courseName = courseElement.dataset.courseName || 'Unknown Course';

                this.trackEvent('course_interaction', {
                    course_id: courseId,
                    course_name: courseName,
                    action: 'view_course',
                    category: courseElement.dataset.category || 'general'
                });
            }
        });

        // Course enrollment
        document.addEventListener('click', (e) => {
            if (e.target.closest('.enroll-button, [data-action="enroll"]')) {
                const courseId = e.target.closest('[data-course-id]')?.dataset.courseId || 'unknown';
                this.trackEvent('course_enrollment', {
                    course_id: courseId,
                    enrollment_type: 'self_enrolled'
                });
            }
        });
    }

    /**
     * Track material download interactions
     */
    trackMaterialDownloads() {
        document.addEventListener('click', (e) => {
            if (e.target.closest('.download-button, [data-action="download"]')) {
                const materialElement = e.target.closest('[data-material-id]');
                const materialId = materialElement?.dataset.materialId || 'unknown';
                const materialType = materialElement?.dataset.materialType || 'unknown';

                this.trackEvent('material_download', {
                    material_id: materialId,
                    material_type: materialType,
                    download_method: 'direct_download'
                });

                // Update session metrics
                this.userSession.educationalMetrics.materialsDownloaded.push({
                    id: materialId,
                    type: materialType,
                    timestamp: new Date().toISOString()
                });
                this.saveSession();
            }
        });
    }

    /**
     * Track quiz interactions
     */
    trackQuizInteractions() {
        // Quiz start
        document.addEventListener('click', (e) => {
            if (e.target.closest('.start-quiz, [data-action="start-quiz"]')) {
                const quizId = e.target.closest('[data-quiz-id]')?.dataset.quizId || 'unknown';
                this.trackEvent('quiz_interaction', {
                    quiz_id: quizId,
                    action: 'quiz_started'
                });
            }
        });

        // Quiz completion
        document.addEventListener('submit', (e) => {
            if (e.target.classList.contains('quiz-form')) {
                const quizId = e.target.dataset.quizId || 'unknown';
                const score = e.target.dataset.score || 0;

                this.trackEvent('quiz_completion', {
                    quiz_id: quizId,
                    score: parseInt(score),
                    completion_time: Date.now() - (e.target.dataset.startTime || Date.now())
                });

                // Update session metrics
                this.userSession.educationalMetrics.quizAttempts.push({
                    id: quizId,
                    score: parseInt(score),
                    timestamp: new Date().toISOString()
                });
                this.saveSession();
            }
        });
    }

    /**
     * Track search interactions
     */
    trackSearchInteractions() {
        const searchInputs = document.querySelectorAll('input[type="search"], .search-input');

        searchInputs.forEach(input => {
            let searchTimeout;

            input.addEventListener('input', (e) => {
                clearTimeout(searchTimeout);
                searchTimeout = setTimeout(() => {
                    if (e.target.value.length >= 3) {
                        this.trackEvent('search_interaction', {
                            search_term: e.target.value,
                            search_category: e.target.dataset.searchCategory || 'general',
                            results_count: 0 // Would be populated by actual search results
                        });
                    }
                }, 1000);
            });
        });
    }

    /**
     * Track user engagement metrics
     */
    trackUserEngagement() {
        // Time spent on page
        let pageStartTime = Date.now();

        window.addEventListener('beforeunload', () => {
            const timeSpent = Math.round((Date.now() - pageStartTime) / 1000);
            this.trackEvent('engagement', {
                time_spent: timeSpent,
                page_url: window.location.pathname,
                scroll_depth: this.getScrollDepth()
            });
        });

        // Scroll depth tracking
        let maxScrollDepth = 0;
        window.addEventListener('scroll', () => {
            const scrollDepth = this.getScrollDepth();
            if (scrollDepth > maxScrollDepth) {
                maxScrollDepth = scrollDepth;
            }
        });

        // Track when user reaches different scroll depths
        const scrollMilestones = [25, 50, 75, 90];
        scrollMilestones.forEach(milestone => {
            // This would be implemented with Intersection Observer for better performance
        });
    }

    /**
     * Track learning progress
     */
    trackLearningProgress() {
        // Course progress updates
        document.addEventListener('learning_progress_update', (e) => {
            const { courseId, progress, lessonId } = e.detail;

            this.trackEvent('learning_progress', {
                course_id: courseId,
                lesson_id: lessonId,
                progress_percentage: progress,
                learning_time: e.detail.timeSpent || 0
            });

            // Update session metrics
            this.userSession.educationalMetrics.timeSpentLearning += e.detail.timeSpent || 0;
            this.saveSession();
        });

        // Certificate earned
        document.addEventListener('certificate_earned', (e) => {
            this.trackEvent('certificate_achievement', {
                course_id: e.detail.courseId,
                certificate_type: e.detail.type,
                completion_score: e.detail.score
            });
        });
    }

    /**
     * Track social interactions
     */
    trackSocialInteractions() {
        // Social media shares
        document.addEventListener('click', (e) => {
            if (e.target.closest('[data-share-platform]')) {
                const platform = e.target.closest('[data-share-platform]').dataset.sharePlatform;
                const contentId = e.target.closest('[data-content-id]')?.dataset.contentId;

                this.trackEvent('social_interaction', {
                    platform: platform,
                    action: 'share',
                    content_id: contentId,
                    content_type: e.target.closest('[data-content-type]')?.dataset.contentType
                });
            }
        });

        // Comments and discussions
        document.addEventListener('submit', (e) => {
            if (e.target.classList.contains('comment-form')) {
                this.trackEvent('social_interaction', {
                    action: 'comment',
                    content_type: 'discussion',
                    character_count: e.target.querySelector('textarea')?.value.length || 0
                });
            }
        });
    }

    /**
     * Track page views
     */
    trackPageViews() {
        this.trackEvent('page_view', {
            page_title: document.title,
            page_url: window.location.pathname,
            page_referrer: document.referrer,
            user_agent: navigator.userAgent
        });

        this.userSession.pageViews++;
        this.saveSession();
    }

    /**
     * Setup performance monitoring
     */
    setupPerformanceMonitoring() {
        // Core Web Vitals
        if ('web-vitals' in window) {
            import('https://unpkg.com/web-vitals@3.1.1/dist/web-vitals.js').then(({ getCLS, getFID, getFCP, getLCP, getTTFB }) => {
                getCLS((metric) => this.trackWebVital('CLS', metric));
                getFID((metric) => this.trackWebVital('FID', metric));
                getFCP((metric) => this.trackWebVital('FCP', metric));
                getLCP((metric) => this.trackWebVital('LCP', metric));
                getTTFB((metric) => this.trackWebVital('TTFB', metric));
            });
        }

        // Custom performance metrics
        window.addEventListener('load', () => {
            setTimeout(() => {
                this.trackPerformanceMetrics();
            }, 0);
        });
    }

    /**
     * Track Web Vitals
     */
    trackWebVital(name, metric) {
        this.trackEvent('web_vitals', {
            metric_name: name,
            value: metric.value,
            rating: metric.rating,
            page_url: window.location.pathname
        });
    }

    /**
     * Track custom performance metrics
     */
    trackPerformanceMetrics() {
        const navigation = performance.getEntriesByType('navigation')[0];
        const paint = performance.getEntriesByType('paint');

        if (navigation) {
            this.trackEvent('performance_metric', {
                metric_type: 'navigation_timing',
                dom_content_loaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
                load_complete: navigation.loadEventEnd - navigation.loadEventStart,
                dns_lookup: navigation.domainLookupEnd - navigation.domainLookupStart
            });
        }

        // First Paint and First Contentful Paint
        paint.forEach(entry => {
            this.trackEvent('performance_metric', {
                metric_type: 'paint_timing',
                paint_type: entry.name,
                start_time: entry.startTime
            });
        });
    }

    /**
     * Initialize educational metrics tracking
     */
    initializeEducationalMetrics() {
        // Track learning objectives
        this.trackEducationalGoals();

        // Track assessment performance
        this.trackAssessmentMetrics();

        // Track learning path progression
        this.trackLearningPath();
    }

    /**
     * Track educational goals and objectives
     */
    trackEducationalGoals() {
        // Course completion goals
        document.addEventListener('course_completed', (e) => {
            this.trackEvent('educational_goal', {
                goal_type: 'course_completion',
                course_id: e.detail.courseId,
                completion_time: e.detail.completionTime,
                final_score: e.detail.finalScore
            });
        });

        // Skill acquisition goals
        document.addEventListener('skill_achieved', (e) => {
            this.trackEvent('educational_goal', {
                goal_type: 'skill_acquisition',
                skill_name: e.detail.skillName,
                proficiency_level: e.detail.level,
                assessment_method: e.detail.method
            });
        });
    }

    /**
     * Track assessment and quiz metrics
     */
    trackAssessmentMetrics() {
        // Detailed quiz analytics
        document.addEventListener('quiz_question_answered', (e) => {
            this.trackEvent('assessment_metric', {
                question_id: e.detail.questionId,
                answer_correct: e.detail.isCorrect,
                time_to_answer: e.detail.timeToAnswer,
                difficulty_level: e.detail.difficulty
            });
        });

        // Assignment submissions
        document.addEventListener('assignment_submitted', (e) => {
            this.trackEvent('assessment_metric', {
                assignment_type: 'written_assignment',
                word_count: e.detail.wordCount,
                submission_time: e.detail.submissionTime,
                grading_criteria: e.detail.criteria
            });
        });
    }

    /**
     * Track learning path progression
     */
    trackLearningPath() {
        // Learning path milestones
        document.addEventListener('learning_milestone', (e) => {
            this.trackEvent('learning_path', {
                milestone_type: e.detail.type,
                milestone_name: e.detail.name,
                path_id: e.detail.pathId,
                progress_percentage: e.detail.progress
            });
        });

        // Adaptive learning adjustments
        document.addEventListener('learning_adaptation', (e) => {
            this.trackEvent('learning_path', {
                adaptation_type: e.detail.type,
                trigger_reason: e.detail.reason,
                old_difficulty: e.detail.oldDifficulty,
                new_difficulty: e.detail.newDifficulty
            });
        });
    }

    /**
     * Generic event tracking method
     */
    trackEvent(eventName, parameters = {}) {
        const event = {
            name: eventName,
            parameters: {
                ...parameters,
                timestamp: new Date().toISOString(),
                session_id: this.userSession.id,
                user_id: this.userSession.userId,
                page_url: window.location.pathname
            }
        };

        // Store event locally
        this.events.push(event);
        this.saveEvents();

        // Send to Google Analytics
        if (window.gtag) {
            window.gtag('event', eventName, {
                custom_parameter_1: parameters.educational_level,
                custom_parameter_2: parameters.course_category,
                custom_parameter_3: parameters.learning_progress,
                ...parameters
            });
        }

        // Send to custom analytics endpoint (if available)
        this.sendToAnalyticsEndpoint(event);

        console.log('Analytics Event:', event);
    }

    /**
     * Send event to custom analytics endpoint
     */
    sendToAnalyticsEndpoint(event) {
        // In production, this would send to your analytics server
        // fetch('/api/analytics/events', {
        //     method: 'POST',
        //     headers: { 'Content-Type': 'application/json' },
        //     body: JSON.stringify(event)
        // }).catch(err => console.warn('Analytics endpoint error:', err));
    }

    /**
     * Get scroll depth percentage
     */
    getScrollDepth() {
        const windowHeight = window.innerHeight;
        const documentHeight = document.documentElement.scrollHeight - windowHeight;
        const scrolled = window.scrollY;
        return Math.round((scrolled / documentHeight) * 100);
    }

    /**
     * Generate unique session ID
     */
    generateSessionId() {
        return 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    /**
     * Get or create user ID
     */
    getUserId() {
        let userId = localStorage.getItem('ivs-user-id');
        if (!userId) {
            userId = 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
            localStorage.setItem('ivs-user-id', userId);
        }
        return userId;
    }

    /**
     * Save session data
     */
    saveSession() {
        sessionStorage.setItem('ivs-analytics-session', JSON.stringify(this.userSession));
    }

    /**
     * Save events to localStorage
     */
    saveEvents() {
        const existingEvents = JSON.parse(localStorage.getItem('ivs-analytics-events') || '[]');
        const allEvents = [...existingEvents, ...this.events];

        // Keep only last 1000 events to prevent storage bloat
        const recentEvents = allEvents.slice(-1000);
        localStorage.setItem('ivs-analytics-events', JSON.stringify(recentEvents));
    }

    /**
     * Get analytics data for reporting
     */
    getAnalyticsData(timeRange = '7d') {
        const events = JSON.parse(localStorage.getItem('ivs-analytics-events') || '[]');
        const sessions = JSON.parse(sessionStorage.getItem('ivs-analytics-session') || '{}');

        return {
            events: events,
            currentSession: sessions,
            summary: this.generateAnalyticsSummary(events, timeRange)
        };
    }

    /**
     * Generate analytics summary
     */
    generateAnalyticsSummary(events, timeRange) {
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - parseInt(timeRange));

        const recentEvents = events.filter(e => new Date(e.parameters.timestamp) > cutoffDate);

        return {
            totalEvents: recentEvents.length,
            pageViews: recentEvents.filter(e => e.name === 'page_view').length,
            courseInteractions: recentEvents.filter(e => e.name === 'course_interaction').length,
            materialDownloads: recentEvents.filter(e => e.name === 'material_download').length,
            quizCompletions: recentEvents.filter(e => e.name === 'quiz_completion').length,
            averageSessionDuration: this.calculateAverageSessionDuration(recentEvents),
            topCourses: this.getTopCourses(recentEvents),
            topMaterials: this.getTopMaterials(recentEvents)
        };
    }

    /**
     * Calculate average session duration
     */
    calculateAverageSessionDuration(events) {
        const engagementEvents = events.filter(e => e.name === 'engagement');
        if (engagementEvents.length === 0) return 0;

        const totalTime = engagementEvents.reduce((sum, e) => sum + (e.parameters.time_spent || 0), 0);
        return Math.round(totalTime / engagementEvents.length);
    }

    /**
     * Get top courses by interactions
     */
    getTopCourses(events) {
        const courseEvents = events.filter(e => e.parameters.course_id);
        const courseCounts = {};

        courseEvents.forEach(event => {
            const courseId = event.parameters.course_id;
            courseCounts[courseId] = (courseCounts[courseId] || 0) + 1;
        });

        return Object.entries(courseCounts)
            .sort(([,a], [,b]) => b - a)
            .slice(0, 5)
            .map(([courseId, count]) => ({ courseId, interactions: count }));
    }

    /**
     * Get top materials by downloads
     */
    getTopMaterials(events) {
        const downloadEvents = events.filter(e => e.name === 'material_download');
        const materialCounts = {};

        downloadEvents.forEach(event => {
            const materialId = event.parameters.material_id;
            materialCounts[materialId] = (materialCounts[materialId] || 0) + 1;
        });

        return Object.entries(materialCounts)
            .sort(([,a], [,b]) => b - a)
            .slice(0, 5)
            .map(([materialId, downloads]) => ({ materialId, downloads }));
    }

    /**
     * Export analytics data
     */
    exportAnalyticsData(format = 'json') {
        const data = this.getAnalyticsData();

        if (format === 'csv') {
            return this.convertToCSV(data.events);
        }

        return JSON.stringify(data, null, 2);
    }

    /**
     * Convert events to CSV format
     */
    convertToCSV(events) {
        if (events.length === 0) return '';

        const headers = Object.keys(events[0]);
        const csvRows = [headers.join(',')];

        events.forEach(event => {
            const values = headers.map(header => {
                const value = event[header];
                return typeof value === 'object' ? JSON.stringify(value) : value;
            });
            csvRows.push(values.join(','));
        });

        return csvRows.join('\n');
    }
}

// Initialize analytics when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    window.analyticsManager = new AnalyticsManager();
});

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AnalyticsManager;
}
