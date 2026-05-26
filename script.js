/* ==========================================
   GLOBAL CONFIGURATION & STATE
   ========================================== */
document.addEventListener('DOMContentLoaded', () => {
    initCursorGlow();
    initNavbarScroll();
    initMobileNav();
    initCard3DTilt();
    initScrollReveal();
    initAchievementsCounter();
    initContactForm();
    initProjectModal();
});

/* ==========================================
   CURSOR GLOW TRACKING
   ========================================== */
function initCursorGlow() {
    const glow = document.getElementById('cursor-glow');
    if (!glow) return;

    // Detect touch device
    const isTouch = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0);
    if (isTouch) {
        glow.style.display = 'none';
        return;
    }

    glow.style.display = 'block';

    document.addEventListener('mousemove', (e) => {
        // Use requestAnimationFrame for smooth 60fps translation
        window.requestAnimationFrame(() => {
            glow.style.left = e.clientX + 'px';
            glow.style.top = e.clientY + 'px';
        });
    });
}

/* ==========================================
   HEADER SCROLL & SECTION HIGHLIGHTS
   ========================================== */
function initNavbarScroll() {
    const header = document.querySelector('.header');
    const sections = document.querySelectorAll('section');
    const navLinks = document.querySelectorAll('.nav-link');

    // Header scroll background toggle
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            header.classList.add('header-scrolled');
        } else {
            header.classList.remove('header-scrolled');
        }
    });

    // Intersection Observer to highlight current section in navigation
    const observerOptions = {
        root: null,
        rootMargin: '-30% 0px -60% 0px', // Trigger when section occupies screen center
        threshold: 0
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const activeId = entry.target.getAttribute('id');
                navLinks.forEach(link => {
                    link.classList.remove('active');
                    if (link.getAttribute('href') === `#${activeId}`) {
                        link.classList.add('active');
                    }
                });
            }
        });
    }, observerOptions);

    sections.forEach(section => {
        observer.observe(section);
    });
}

/* ==========================================
   MOBILE SIDE NAVIGATION BAR
   ========================================== */
function initMobileNav() {
    const toggleBtn = document.getElementById('nav-toggle');
    const navbar = document.getElementById('navbar');
    const links = document.querySelectorAll('.nav-link');

    if (!toggleBtn || !navbar) return;

    toggleBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        navbar.classList.toggle('active');
        const icon = toggleBtn.querySelector('i');
        if (navbar.classList.contains('active')) {
            icon.className = 'fa-solid fa-xmark';
        } else {
            icon.className = 'fa-solid fa-bars-staggered';
        }
    });

    // Close menu on link click
    links.forEach(link => {
        link.addEventListener('click', () => {
            navbar.classList.remove('active');
            toggleBtn.querySelector('i').className = 'fa-solid fa-bars-staggered';
        });
    });

    // Close menu on outer click
    document.addEventListener('click', (e) => {
        if (!navbar.contains(e.target) && !toggleBtn.contains(e.target)) {
            navbar.classList.remove('active');
            toggleBtn.querySelector('i').className = 'fa-solid fa-bars-staggered';
        }
    });
}

/* ==========================================
   INTERACTIVE 3D TILT & GLOW FOR CARDS
   ========================================== */
function initCard3DTilt() {
    const cards = document.querySelectorAll('[data-tilt]');
    
    cards.forEach(card => {
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left; // x coordinate within card
            const y = e.clientY - rect.top;  // y coordinate within card
            
            // Set custom properties for hover radial spot
            card.style.setProperty('--x', `${x}px`);
            card.style.setProperty('--y', `${y}px`);

            // Compute tilt percentages (-10 to 10 degrees)
            const width = rect.width;
            const height = rect.height;
            const rotateX = -10 * ((y - height / 2) / (height / 2));
            const rotateY = 10 * ((x - width / 2) / (width / 2));

            // Apply transformations
            card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-5px)`;
        });

        card.addEventListener('mouseleave', () => {
            // Reset to flat
            card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateY(0px)';
        });
    });
}

/* ==========================================
   SCROLL REVEAL (TIMELINE & ABOUT CARDS)
   ========================================== */
function initScrollReveal() {
    const timelineItems = document.querySelectorAll('.timeline-item');
    const aboutCards = document.querySelectorAll('.about-card');

    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('in-view');
            }
        });
    }, {
        root: null,
        rootMargin: '0px 0px -10% 0px',
        threshold: 0.15
    });

    timelineItems.forEach(item => {
        revealObserver.observe(item);
    });

    // Animate about cards entrance sequentially
    aboutCards.forEach((card, index) => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(35px)';
        card.style.transition = `opacity 0.6s cubic-bezier(0.4, 0, 0.2, 1) ${index * 0.1}s, transform 0.6s cubic-bezier(0.4, 0, 0.2, 1) ${index * 0.1}s`;
        
        const cardObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    card.style.opacity = '1';
                    card.style.transform = 'translateY(0)';
                    // Re-apply standard style.css hover transformations after animation finishes
                    setTimeout(() => {
                        card.style.transition = 'border-color var(--transition-normal), background-color var(--transition-normal), transform var(--transition-normal), box-shadow var(--transition-normal)';
                    }, 1000);
                }
            });
        }, { threshold: 0.1 });
        
        cardObserver.observe(card);
    });
}

/* ==========================================
   ACHIEVEMENTS SCROLL COUNTER
   ========================================== */
function initAchievementsCounter() {
    const counters = [
        { id: 'count-wins', target: 9, suffix: '' },
        { id: 'count-projects', target: 5, suffix: '+' }
    ];

    let triggered = false;
    const achievementsPanel = document.querySelector('.achievements-panel');
    if (!achievementsPanel) return;

    const runCounters = () => {
        counters.forEach(counterItem => {
            const element = document.getElementById(counterItem.id);
            if (!element) return;

            let count = 0;
            const duration = 1500; // ms
            const stepTime = Math.max(Math.floor(duration / counterItem.target), 30);
            
            const timer = setInterval(() => {
                count++;
                element.innerText = count + counterItem.suffix;
                if (count >= counterItem.target) {
                    element.innerText = counterItem.target + counterItem.suffix;
                    clearInterval(timer);
                }
            }, stepTime);
        });
    };

    const countObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting && !triggered) {
                triggered = true;
                runCounters();
            }
        });
    }, { threshold: 0.5 });

    countObserver.observe(achievementsPanel);
}

/* ==========================================
   PROJECT METRICS MODAL
   ========================================== */
const projectData = {
    rag: {
        title: "RAG Question Answering System",
        desc: "A localized Retrieval-Augmented Generation application that allows secure query capabilities against proprietary files. The engine leverages vector parsing algorithms to retrieve exact snippets, formatting citations to eliminate LLM hallucinations.",
        icon: "fa-database",
        specs: [
            "Recursive text partitioning with adaptive overlap boundaries.",
            "Text embeddings configured locally to protect data integrity.",
            "Semantic index storage using ChromaDB instance.",
            "LangChain orchestration of model prompt interfaces."
        ],
        tags: ["Python", "LangChain", "ChromaDB", "OpenAI", "RAG Systems"],
        link: "https://github.com"
    },
    feedback: {
        title: "AI Feedback Analyzer",
        desc: "An end-to-end feedback analysis program. It parses customer responses through visual n8n interfaces, classifies sentiment distributions using LLM categorization nodes, and saves data to dashboard grids.",
        icon: "fa-chart-line",
        specs: [
            "Dynamic lead ingestion via webhook trigger endpoints.",
            "Sentiment classification scoring (Positive, Neutral, Negative).",
            "Automatic notification dispatching for high-priority user alerts.",
            "Scheduled pandas summary script compilation and delivery."
        ],
        tags: ["Python", "n8n Automation", "AI Workflows", "API Integrations"],
        link: "https://github.com"
    },
    financial: {
        title: "Financial Report Analysis System",
        desc: "A financial data compiler engineered with strict system guidelines. It processes complex balances, compiles revenue metrics, extracts profit percentages, and produces valid JSON data grids.",
        icon: "fa-file-invoice-dollar",
        specs: [
            "Isolates target numeric values using customized markdown parsing.",
            "Strict JSON Schema checks verifying zero schema errors.",
            "Calculates financial ratios automatically with python subprocesses.",
            "Generates comprehensive YoY trend comparison charts."
        ],
        tags: ["Prompt Engineering", "LLMs", "RAG Systems", "Python"],
        link: "https://github.com"
    },
    workflow: {
        title: "Automation Workflow using n8n",
        desc: "A cloud execution pipeline connecting external workspaces. It removes manual entries by setting up automatic database synchronization, spreadsheet updates, and message routing upon hook triggers.",
        icon: "fa-route",
        specs: [
            "100% serverless event-driven webhook execution.",
            "API endpoint mapping with automated schema translations.",
            "Multi-node error catching with backup warnings.",
            "Automated document rendering and cloud drive upload."
        ],
        tags: ["n8n Automation", "Webhooks", "APIs", "AI Workflows"],
        link: "https://github.com"
    }
};

function initProjectModal() {
    const modal = document.getElementById('project-modal');
    const closeBtn = document.getElementById('modal-close-btn');

    if (!modal || !closeBtn) return;

    window.openProjectModal = function(projectId) {
        const data = projectData[projectId];
        if (!data) return;

        // Populate Modal Fields
        document.getElementById('modal-title').innerText = data.title;
        document.getElementById('modal-desc').innerText = data.desc;
        
        // Update Icon
        const iconElement = document.getElementById('modal-icon');
        iconElement.className = `fa-solid ${data.icon}`;
        
        // Populate Specs
        const specsContainer = document.getElementById('modal-specs');
        specsContainer.innerHTML = '';
        data.specs.forEach(spec => {
            const bullet = document.createElement('div');
            bullet.className = 'modal-spec-bullet';
            bullet.innerText = spec;
            specsContainer.appendChild(bullet);
        });

        // Populate Tags
        const tagsContainer = document.getElementById('modal-tags');
        tagsContainer.innerHTML = '';
        data.tags.forEach(tag => {
            const span = document.createElement('span');
            span.innerText = tag;
            tagsContainer.appendChild(span);
        });

        // Update Link
        document.getElementById('modal-external-link').href = data.link;

        // Open Modal
        modal.classList.add('open');
        document.body.style.overflow = 'hidden'; // Stop scroll
    };

    const closeModal = () => {
        modal.classList.remove('open');
        document.body.style.overflow = ''; // Resume scroll
    };

    closeBtn.addEventListener('click', closeModal);
    
    // Close modal on background click
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeModal();
        }
    });

    // Close modal on Escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal.classList.contains('open')) {
            closeModal();
        }
    });
}

/* ==========================================
   CONTACT FORM DISPATCHER
   ========================================== */
function initContactForm() {
    const form = document.getElementById('contact-form');
    const submitBtn = document.getElementById('btn-submit');
    const successAlert = document.getElementById('success-alert');
    const alertClose = document.getElementById('alert-close-btn');

    if (!form || !submitBtn || !successAlert || !alertClose) return;

    form.addEventListener('submit', (e) => {
        e.preventDefault();

        // Visual submit loading state
        const originalText = submitBtn.innerHTML;
        submitBtn.disabled = true;
        submitBtn.innerHTML = `
            <span class="btn-text">TRANSMITTING...</span>
            <i class="fa-solid fa-spinner fa-spin"></i>
        `;

        // Simulate secure transit API routing
        setTimeout(() => {
            // Restore button state
            submitBtn.disabled = false;
            submitBtn.innerHTML = originalText;

            // Reset form inputs
            form.reset();

            // Display success modal
            successAlert.classList.add('open');
            document.body.style.overflow = 'hidden';
        }, 1200);
    });

    // Close success popup
    alertClose.addEventListener('click', () => {
        successAlert.classList.remove('open');
        document.body.style.overflow = '';
    });
    
    successAlert.addEventListener('click', (e) => {
        if (e.target === successAlert) {
            successAlert.classList.remove('open');
            document.body.style.overflow = '';
        }
    });
}
