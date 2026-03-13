/* ============================================
   TECH FEST 2K26 - JAVASCRIPT
   ============================================ */

// ============================================
// THREE.JS 3D SCENE
// ============================================
class HeroScene {
    constructor() {
        this.canvas = document.getElementById('hero-canvas');
        if (!this.canvas) return; // Exit if no canvas

        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.renderer = new THREE.WebGLRenderer({ canvas: this.canvas, antialias: true, alpha: true });
        this.objects = [];
        this.particles = [];
        this.mouse = { x: 0, y: 0 };
        this.clock = new THREE.Clock();

        this.init();
    }

    init() {
        // Setup renderer
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        this.renderer.setClearColor(0x000000, 0);

        // Camera position
        this.camera.position.z = 30;

        // Create objects
        this.createGeometries();
        this.createParticles();

        // Event listeners
        window.addEventListener('resize', () => this.onResize());
        window.addEventListener('mousemove', (e) => this.onMouseMove(e));

        // Start animation
        this.animate();
    }

    createGeometries() {
        // Base materials with glowing effect
        const cyanMat = new THREE.MeshBasicMaterial({ color: 0x9333ea, wireframe: true, transparent: true, opacity: 0.6 });
        const pinkMat = new THREE.MeshBasicMaterial({ color: 0xd946ef, wireframe: true, transparent: true, opacity: 0.6 });
        const purpleMat = new THREE.MeshBasicMaterial({ color: 0x7c3aed, wireframe: true, transparent: true, opacity: 0.6 });

        // --- 1. Create Laptop ---
        const laptopGroup = new THREE.Group();

        // Laptop base
        const laptopBaseGeo = new THREE.BoxGeometry(10, 0.5, 7);
        const laptopBase = new THREE.Mesh(laptopBaseGeo, cyanMat);
        laptopGroup.add(laptopBase);

        // Laptop screen
        const laptopScreenGeo = new THREE.BoxGeometry(10, 7, 0.5);
        const laptopScreen = new THREE.Mesh(laptopScreenGeo, cyanMat);
        // Position it at the back edge of the base and tilt it open
        laptopScreen.position.set(0, 3.5, -3.25);
        laptopScreen.rotation.x = -Math.PI / 12; // tilt slightly back
        laptopGroup.add(laptopScreen);

        // Initial position and animation for laptop
        laptopGroup.position.set(-15, 0, -10);
        laptopGroup.rotation.y = Math.PI / 6;
        laptopGroup.rotation.z = Math.PI / 12;
        laptopGroup.scale.set(2.5, 2.5, 2.5); // Increase laptop size further
        this.scene.add(laptopGroup);

        this.objects.push({
            mesh: laptopGroup,
            rotationSpeed: { x: 0.002, y: 0.005, z: 0.001 },
            floatOffset: 0,
            floatSpeed: 0.8
        });

        // --- 2. Create Headphones ---
        const headphoneGroup = new THREE.Group();

        // Earcups
        const earcupGeo = new THREE.CylinderGeometry(2, 2, 1, 16);
        const leftEarcup = new THREE.Mesh(earcupGeo, pinkMat);
        leftEarcup.rotation.z = Math.PI / 2;
        leftEarcup.position.set(-3.5, 0, 0);
        headphoneGroup.add(leftEarcup);

        const rightEarcup = new THREE.Mesh(earcupGeo, pinkMat);
        rightEarcup.rotation.z = Math.PI / 2;
        rightEarcup.position.set(3.5, 0, 0);
        headphoneGroup.add(rightEarcup);

        // Headband
        const headbandGeo = new THREE.TorusGeometry(3.5, 0.5, 8, 24, Math.PI);
        const headband = new THREE.Mesh(headbandGeo, pinkMat);
        // Correctly orient the half-torus arching over the earcups
        headband.rotation.z = 0;
        headband.position.set(0, 0, 0);
        headphoneGroup.add(headband);

        // Initial position and animation for headphones
        headphoneGroup.position.set(15, 5, -5);
        headphoneGroup.rotation.x = Math.PI / 4;
        headphoneGroup.rotation.y = -Math.PI / 6;
        headphoneGroup.scale.set(2.5, 2.5, 2.5); // Increase headphone size further
        this.scene.add(headphoneGroup);

        this.objects.push({
            mesh: headphoneGroup,
            rotationSpeed: { x: 0.004, y: 0.003, z: -0.002 },
            floatOffset: Math.PI, // start animation offset
            floatSpeed: 1.2
        });

        // --- 3. Create Drone ---
        const droneGroup = new THREE.Group();

        // Main Body
        const droneBodyGeo = new THREE.BoxGeometry(3, 1, 3);
        const droneBody = new THREE.Mesh(droneBodyGeo, purpleMat);
        droneGroup.add(droneBody);

        // Arms and Propellers
        const armLength = 4;
        const armGeo = new THREE.CylinderGeometry(0.2, 0.2, armLength, 8);
        const propGeo = new THREE.TorusGeometry(1.5, 0.1, 8, 16);

        // Helper to add an arm+propeller
        const addArmAndProp = (angle, isFront) => {
            const armGroup = new THREE.Group();

            // Arm
            const arm = new THREE.Mesh(armGeo, purpleMat);
            arm.rotation.x = Math.PI / 2;
            arm.position.z = armLength / 2;
            armGroup.add(arm);

            // Propeller guard/disc
            const prop = new THREE.Mesh(propGeo, purpleMat);
            prop.rotation.x = Math.PI / 2; // Flat parallel to body
            prop.position.set(0, 0.5, armLength);

            // Store reference to spin later (optional, but let's just make the whole drone spin for now)
            armGroup.add(prop);

            // Position relative to body center
            armGroup.rotation.y = angle;
            droneGroup.add(armGroup);
        };

        // Add 4 arms at 45 degree angles offsets
        addArmAndProp(Math.PI / 4);
        addArmAndProp((3 * Math.PI) / 4);
        addArmAndProp((5 * Math.PI) / 4);
        addArmAndProp((7 * Math.PI) / 4);

        // Initial position and animation for drone
        droneGroup.position.set(0, 8, -20);
        droneGroup.rotation.x = Math.PI / 8; // slight tilt forward
        droneGroup.scale.set(4, 4, 4); // Increase drone size further
        this.scene.add(droneGroup);

        this.objects.push({
            mesh: droneGroup,
            rotationSpeed: { x: 0.001, y: -0.008, z: 0.002 }, // Spin faster to simulate hovering
            floatOffset: Math.PI / 2,
            floatSpeed: 2.0 // Drone floats faster
        });
    }

    createParticles() {
        const particleCount = 650;
        const geometry = new THREE.BufferGeometry();
        const positions = new Float32Array(particleCount * 3);
        const colors = new Float32Array(particleCount * 3);

        const colorOptions = [
            new THREE.Color(0x9333ea),
            new THREE.Color(0xd946ef),
            new THREE.Color(0x7c3aed)
        ];

        for (let i = 0; i < particleCount; i++) {
            const i3 = i * 3;
            positions[i3] = (Math.random() - 0.5) * 100;
            positions[i3 + 1] = (Math.random() - 0.5) * 100;
            positions[i3 + 2] = (Math.random() - 0.5) * 50 - 25;

            const color = colorOptions[Math.floor(Math.random() * colorOptions.length)];
            colors[i3] = color.r;
            colors[i3 + 1] = color.g;
            colors[i3 + 2] = color.b;
        }

        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

        const material = new THREE.PointsMaterial({
            size: 0.5, // Increased size of stars
            vertexColors: true,
            transparent: true,
            opacity: 0.8,
            blending: THREE.AdditiveBlending
        });

        const particles = new THREE.Points(geometry, material);
        this.scene.add(particles);
        this.particles.push(particles);
    }

    onResize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }

    onMouseMove(event) {
        this.mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        this.mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
    }

    animate() {
        requestAnimationFrame(() => this.animate());

        const time = this.clock.getElapsedTime();

        // Animate objects
        this.objects.forEach((obj, index) => {
            obj.mesh.rotation.x += obj.rotationSpeed.x || 0;
            obj.mesh.rotation.y += obj.rotationSpeed.y || 0;
            obj.mesh.rotation.z += obj.rotationSpeed.z || 0;

            // Floating animation
            if (obj.floatOffset !== undefined) {
                obj.mesh.position.y += Math.sin(time * obj.floatSpeed + obj.floatOffset) * 0.01;
            }
        });

        // Animate particles
        this.particles.forEach(particle => {
            particle.rotation.y += 0.0002;
            particle.rotation.x += 0.0001;
        });

        // Camera follows mouse slightly
        this.camera.position.x += (this.mouse.x * 3 - this.camera.position.x) * 0.05;
        this.camera.position.y += (this.mouse.y * 2 - this.camera.position.y) * 0.05;
        this.camera.lookAt(this.scene.position);

        this.renderer.render(this.scene, this.camera);
    }
}

// ============================================
// NAVIGATION
// ============================================
class Navigation {
    constructor() {
        this.navbar = document.getElementById('navbar');
        this.navToggle = document.getElementById('navToggle');
        this.navMenu = document.getElementById('navMenu');
        this.navLinks = document.querySelectorAll('.nav-link');

        if (!this.navbar || !this.navToggle || !this.navMenu) return;

        this.init();
    }

    init() {
        // Scroll effect
        window.addEventListener('scroll', () => this.onScroll());

        // Mobile menu toggle
        this.navToggle.addEventListener('click', () => this.toggleMenu());

        // Close menu on link click
        this.navLinks.forEach(link => {
            link.addEventListener('click', () => this.closeMenu());
        });
    }

    onScroll() {
        if (window.scrollY > 50) {
            this.navbar.classList.add('scrolled');
        } else {
            this.navbar.classList.remove('scrolled');
        }
    }

    toggleMenu() {
        this.navToggle.classList.toggle('active');
        this.navMenu.classList.toggle('active');
        document.body.style.overflow = this.navMenu.classList.contains('active') ? 'hidden' : '';
    }

    closeMenu() {
        this.navToggle.classList.remove('active');
        this.navMenu.classList.remove('active');
        document.body.style.overflow = '';
    }
}

// ============================================
// COUNTDOWN TIMER
// ============================================
class CountdownTimer {
    constructor() {
        // Set event date (January 15, 2026)
        this.eventDate = new Date('June 27, 2026 00:00:00').getTime();
        this.daysEl = document.getElementById('days');
        this.hoursEl = document.getElementById('hours');
        this.minutesEl = document.getElementById('minutes');
        this.secondsEl = document.getElementById('seconds');

        // Only initialize if all elements exist
        if (!this.daysEl || !this.hoursEl || !this.minutesEl || !this.secondsEl) return;

        this.init();
    }

    init() {
        this.update();
        setInterval(() => this.update(), 1000);
    }

    update() {
        const now = new Date().getTime();
        const distance = this.eventDate - now;

        if (distance > 0) {
            const days = Math.floor(distance / (1000 * 60 * 60 * 24));
            const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((distance % (1000 * 60)) / 1000);

            this.daysEl.textContent = String(days).padStart(2, '0');
            this.hoursEl.textContent = String(hours).padStart(2, '0');
            this.minutesEl.textContent = String(minutes).padStart(2, '0');
            this.secondsEl.textContent = String(seconds).padStart(2, '0');
        } else {
            this.daysEl.textContent = '00';
            this.hoursEl.textContent = '00';
            this.minutesEl.textContent = '00';
            this.secondsEl.textContent = '00';
        }
    }
}

// ============================================
// SCROLL ANIMATIONS
// ============================================
class ScrollAnimations {
    constructor() {
        this.elements = document.querySelectorAll('.section-header, .about-text, .about-visual, .feature-card, .stat-card, .team-card, .event-card, .register-info, .register-form-container, .info-card, .highlight-card, .vm-card, .faq-item, .advisor-card, .team-card-simple');

        if (this.elements.length === 0) return;

        this.init();
    }

    init() {
        // Add reveal class to all elements
        this.elements.forEach(el => el.classList.add('reveal'));

        // Create intersection observer
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('active');
                }
            });
        }, {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        });

        this.elements.forEach(el => observer.observe(el));
    }
}

// ============================================
// STATS COUNTER
// ============================================
class StatsCounter {
    constructor() {
        this.stats = document.querySelectorAll('.stat-card');
        this.animated = false;

        if (this.stats.length === 0) return;

        this.init();
    }

    init() {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting && !this.animated) {
                    this.animated = true;
                    this.animateStats();
                }
            });
        }, { threshold: 0.5 });

        this.stats.forEach(stat => observer.observe(stat));
    }

    animateStats() {
        this.stats.forEach(stat => {
            const targetValue = parseInt(stat.dataset.count);
            const numberEl = stat.querySelector('.stat-number');
            if (!numberEl || isNaN(targetValue)) return;

            let currentValue = 0;
            const increment = targetValue / 60;
            const duration = 2000;
            const stepTime = duration / 60;

            const counter = setInterval(() => {
                currentValue += increment;
                if (currentValue >= targetValue) {
                    numberEl.textContent = targetValue.toLocaleString() + '+';
                    clearInterval(counter);
                } else {
                    numberEl.textContent = Math.floor(currentValue).toLocaleString();
                }
            }, stepTime);
        });
    }
}

// ============================================
// EVENTS FILTER
// ============================================
class EventsFilter {
    constructor() {
        this.filterBtns = document.querySelectorAll('.filter-btn');
        this.eventCards = document.querySelectorAll('.event-card');

        if (this.filterBtns.length === 0) return;

        this.init();
    }

    init() {
        this.filterBtns.forEach(btn => {
            btn.addEventListener('click', () => this.filter(btn));
        });
    }

    filter(activeBtn) {
        // Update active button
        this.filterBtns.forEach(btn => btn.classList.remove('active'));
        activeBtn.classList.add('active');

        const filterValue = activeBtn.dataset.filter;

        this.eventCards.forEach(card => {
            if (filterValue === 'all' || card.dataset.category === filterValue) {
                card.style.display = 'block';
                card.style.animation = 'fadeInUp 0.5s ease forwards';
            } else {
                card.style.display = 'none';
            }
        });
    }
}

// ============================================
// CURSOR GLOW
// ============================================
class CursorGlow {
    constructor() {
        this.cursor = document.getElementById('cursorGlow');

        if (!this.cursor) return;

        if (window.matchMedia('(pointer: fine)').matches) {
            this.init();
        }
    }

    init() {
        document.addEventListener('mousemove', (e) => {
            this.cursor.style.left = e.clientX + 'px';
            this.cursor.style.top = e.clientY + 'px';
        });
    }
}

// ============================================
// REGISTRATION FORM
// ============================================
class RegistrationForm {
    constructor() {
        this.form = document.getElementById('registerForm');
        this.modal = document.getElementById('successModal');

        if (!this.form) return;

        this.init();
    }

    init() {
        this.form.addEventListener('submit', (e) => this.handleSubmit(e));
    }

    handleSubmit(e) {
        e.preventDefault();

        // Get form data
        const formData = new FormData(this.form);
        const data = Object.fromEntries(formData.entries());

        // Simple validation - check for firstName or name field
        const firstName = data.firstName || data.name;
        if (!firstName || !data.email || !data.phone || !data.school || !data.grade) {
            this.showError('Please fill in all required fields');
            return;
        }

        // Email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(data.email)) {
            this.showError('Please enter a valid email address');
            return;
        }

        // Simulate form submission
        this.showLoading();

        setTimeout(() => {
            this.hideLoading();
            this.showSuccess();
            this.form.reset();
        }, 1500);
    }

    showError(message) {
        alert(message);
    }

    showLoading() {
        const submitBtn = this.form.querySelector('.btn-submit');
        if (submitBtn) {
            submitBtn.innerHTML = '<span>Processing...</span>';
            submitBtn.disabled = true;
        }
    }

    hideLoading() {
        const submitBtn = this.form.querySelector('.btn-submit');
        if (submitBtn) {
            submitBtn.innerHTML = `
                <span>Complete Registration</span>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M5 12h14M12 5l7 7-7 7"/>
                </svg>
            `;
            submitBtn.disabled = false;
        }
    }

    showSuccess() {
        if (this.modal) {
            this.modal.classList.add('active');
        }
    }
}

// Close modal function
function closeModal() {
    const modal = document.getElementById('successModal');
    if (modal) {
        modal.classList.remove('active');
    }
}

// ============================================
// PARALLAX EFFECTS
// ============================================
class ParallaxEffects {
    constructor() {
        this.floatingCards = document.querySelectorAll('.float-card');

        if (this.floatingCards.length === 0) return;

        this.init();
    }

    init() {
        window.addEventListener('scroll', () => this.onScroll());
    }

    onScroll() {
        const scrollY = window.scrollY;

        this.floatingCards.forEach((card, index) => {
            const speed = 0.02 + (index * 0.01);
            card.style.transform = `translateY(${scrollY * speed}px)`;
        });
    }
}

// ============================================
// TYPING EFFECT (Optional enhancement)
// ============================================
class TypingEffect {
    constructor(element, words, waitTime = 3000) {
        this.element = element;
        this.words = words;
        this.waitTime = waitTime;
        this.wordIndex = 0;
        this.txt = '';
        this.isDeleting = false;

        this.type();
    }

    type() {
        const current = this.wordIndex % this.words.length;
        const fullTxt = this.words[current];

        if (this.isDeleting) {
            this.txt = fullTxt.substring(0, this.txt.length - 1);
        } else {
            this.txt = fullTxt.substring(0, this.txt.length + 1);
        }

        this.element.textContent = this.txt;

        let typeSpeed = 100;

        if (this.isDeleting) {
            typeSpeed /= 2;
        }

        if (!this.isDeleting && this.txt === fullTxt) {
            typeSpeed = this.waitTime;
            this.isDeleting = true;
        } else if (this.isDeleting && this.txt === '') {
            this.isDeleting = false;
            this.wordIndex++;
            typeSpeed = 500;
        }

        setTimeout(() => this.type(), typeSpeed);
    }
}

// ============================================
// EVENT DETAILS VIEW
// ============================================
class EventDetails {
    constructor() {
        this.listView = document.getElementById('events-list-view');
        this.detailsView = document.getElementById('event-details-view');
        this.eventCards = document.querySelectorAll('.event-card');
        this.backBtn = document.getElementById('back-to-events');
        this.sidebarList = document.getElementById('sidebar-events-list');
        this.detailsContent = document.getElementById('event-details-content');

        if (!this.listView || !this.detailsView) return;

        // Mock event details data matching the HTML order
        this.eventData = {
            'Code Sprint': {
                rules: [
                    'Max team size is 2 members.',
                    'Development must start only after the team is checked in.',
                    'Use of open source libraries is allowed, but core logic must be written during the hackathon.',
                    'Teams must present a working prototype at the end.'
                ],
                guidelines: 'Bring your own laptops and required hardware. Internet will be provided. Food and beverages are available throughout the event.',
                schedule: 'Starts at 10:00 AM on June 27, 2026. Judging begins immediately after the 48-hour period.'
            },
            'Competitive Coding': {
                rules: [
                    'Team of 2 members.',
                    'Allowed languages: C, C++, Java, Python.',
                    'Plagiarism will lead to immediate disqualification.',
                    'Duration is exactly 2 hours.'
                ],
                guidelines: 'The contest will be hosted on HackerRank. Make sure you have a valid account prior to the event.',
                schedule: 'Starts at 02:00 PM on June 27, 2026.'
            },
            'PC building ': {
                rules: [
                    'Team of 2 members.',
                    'Assemble given components to a working state.',
                    'Safe handling of components is mandatory.',
                    'Fastest to successfully boot into BIOS wins.'
                ],
                guidelines: 'Basic tools will be provided. Prior knowledge of PC assembly and troubleshooting is required.',
                schedule: 'Starts at 11:00 AM on June 27, 2026.'
            },
            'Bot Sumo': {
                rules: [
                    'Max team size of 2.',
                    'Bot weight and dimension limits apply.',
                    'Only non-destructive weapons allowed (no fire, liquids, EMPs).',
                    'Matches are elimination style.'
                ],
                guidelines: 'Safety gear must be worn in the arena zone. All bots must pass safety inspection 1 hour before the event.',
                schedule: 'Full day event. Initial weigh-in starts at 09:00 AM on June 27, 2026.'
            },
            'Robo Maze': {
                rules: [
                    'Team of 2 members.',
                    'Bot must be autonomous. No remote control allowed.',
                    'Bot must not exceed size limits.',
                    'Fastest completion of the track without losing the line wins.'
                ],
                guidelines: 'The track will have acute angles and intersections. Prepare your sensors accordingly.',
                schedule: 'Starts at 01:00 PM on June 27, 2026.'
            },
            'Drone Obstacle Course': {
                rules: [
                    'Team of 3 members.',
                    'Navigate the drone through all hoops and obstacles.',
                    'Time penalties apply for touching or missing obstacles.',
                    'Fastest clear time wins.'
                ],
                guidelines: 'A safety net enclosure will be used. Ensure your drone has prop guards installed.',
                schedule: 'Starts at 03:00 PM on June 27, 2026.'
            },
            'Digital Art': {
                rules: [
                    'Individual event.',
                    'Design must be completed within 2 hours based on the given theme.',
                    'Any standard digital art / UI design tool is allowed.',
                    'Final submission details must contain the source files.'
                ],
                guidelines: 'Focus on user experience, composition, and visual aesthetics.',
                schedule: 'Starts at 10:00 AM on June 27, 2026.'
            },
            'Reel Making': {
                rules: [
                    'Team of 2 members.',
                    'Create an engaging short-form video (reel).',
                    'Theme will be provided on the spot.',
                    'Final video must not exceed 60 seconds.'
                ],
                guidelines: 'Audio and stock footage can be used as long as it is copyright-free. Editing must be done on premises.',
                schedule: 'Starts at 02:00 PM on June 27, 2026.'
            },
            'Forza Horizon': {
                rules: [
                    'Individual participation.',
                    'Standard tournament bracket format (1v1 or Time Attack).',
                    'Using exploits is strictly prohibited.'
                ],
                guidelines: 'Racing wheels/controllers will be provided. Pre-set vehicles and tracks will be used for fairness.',
                schedule: 'Starts at 11:00 AM on June 27, 2026.'
            },
            'Innovative Startup': {
                rules: [
                    'Team of 2 members.',
                    'Pitch an innovative business model or prototype.',
                    'Presentations should not exceed 10 minutes (incl. Q&A).',
                    'Judged on feasibility, innovation, and presentation.'
                ],
                guidelines: 'Prepare a slide deck and be ready to answer questions from your "investors".',
                schedule: 'Starts at 10:00 AM on June 27, 2026.'
            },
            'Tech Quiz ': {
                rules: [
                    'Team of 2 members.',
                    'Multiple rounds covering software, hardware, and tech history.',
                    'No electronics allowed during the quiz.',
                    'Top scoring teams advance to the stage finals.'
                ],
                guidelines: 'Brush up on your general tech knowledge and current events in the tech world.',
                schedule: 'Starts at 01:00 PM on June 27, 2026.'
            },
            'Wikipedia Maze': {
                rules: [
                    'Team of 2 members.',
                    'Navigate from a starting Wikipedia article to a target article using only embedded links.',
                    'No use of the search bar or external tools.',
                    'Fastest to reach the target wins the round.'
                ],
                guidelines: 'Requires quick reading, lateral thinking, and general knowledge to find the right link paths.',
                schedule: 'Starts at 03:00 PM on June 27, 2026.'
            }
        };

        this.init();
    }

    init() {
        // Collect all event data from the HTML cards to populate sidebar
        this.eventsList = [];
        this.eventCards.forEach(card => {
            const title = card.querySelector('.event-title').innerText;
            const category = card.querySelector('.event-category').innerText;
            const icon = card.querySelector('.event-icon').innerText;
            const htmlContent = card.innerHTML; // Store original card content

            // Only add once
            if (!this.eventsList.find(e => e.title === title)) {
                this.eventsList.push({ title, category, icon, htmlContent, element: card });
            }

            // Click listener on cards
            card.addEventListener('click', () => {
                this.openDetails(title);
            });
        });

        // Initialize back button
        this.backBtn.addEventListener('click', () => {
            this.closeDetails();
        });

        // Populate sidebar initially
        this.populateSidebar();
    }

    populateSidebar() {
        this.sidebarList.innerHTML = '';
        this.eventsList.forEach(event => {
            const div = document.createElement('div');
            div.className = 'sidebar-event-item';
            div.setAttribute('data-title', event.title);

            div.innerHTML = `
                <div class="sidebar-event-title">${event.icon} ${event.title}</div>
                <div class="sidebar-event-category">${event.category}</div>
            `;

            div.addEventListener('click', () => {
                this.openDetails(event.title);
            });

            this.sidebarList.appendChild(div);
        });
    }

    openDetails(eventTitle) {
        // Find the event
        const event = this.eventsList.find(e => e.title === eventTitle);
        if (!event) return;

        // Populate content
        this.populateDetailsContent(event);

        // Highlight active event in sidebar
        const sidebarItems = this.sidebarList.querySelectorAll('.sidebar-event-item');
        sidebarItems.forEach(item => {
            if (item.getAttribute('data-title') === eventTitle) {
                item.classList.add('active');
            } else {
                item.classList.remove('active');
            }
        });

        // View transition
        this.listView.style.display = 'none';
        this.detailsView.style.display = 'flex';

        // Scroll to top of details
        window.scrollTo({ top: this.detailsView.offsetTop - 100, behavior: 'smooth' });
    }

    closeDetails() {
        // View transition
        this.detailsView.style.display = 'none';
        this.listView.style.display = 'block';
    }

    populateDetailsContent(event) {
        // Extract meta information from the original card element
        const metaEl = event.element.querySelector('.event-meta');
        const detailsEl = event.element.querySelector('.event-details');
        const prizeEl = event.element.querySelector('.event-prize'); // This is commented out in HTML
        const descEl = event.element.querySelector('.event-desc');

        const metaHTML = metaEl ? metaEl.innerHTML : '';
        const detailsHTML = detailsEl ? detailsEl.innerHTML : '';
        const prizeHTML = prizeEl ? prizeEl.innerHTML : '';
        const desc = descEl ? descEl.innerText : '';

        // Get additional data from mock DB
        const extraData = this.eventData[event.title] || { rules: ['Detailed rules will be announced prior to the event.'], guidelines: 'Guidelines are being finalized.', schedule: 'Check back later for schedule updates.' };

        // Format rules list
        const rulesList = extraData.rules.map(rule => `<li>${rule}</li>`).join('');

        // Generate HTML
        this.detailsContent.innerHTML = `
            <div class="details-header">
                <span class="details-category">${event.icon} ${event.category}</span>
                <h2 class="details-title">${event.title}</h2>
                <div class="details-meta">
                    ${metaHTML ? `<div class="meta-item">${metaHTML}</div>` : ''}
                    ${detailsHTML ? `<div class="meta-item">${detailsHTML}</div>` : ''}
                    ${prizeHTML ? `<div class="meta-item">${prizeHTML}</div>` : ''}
                </div>
                <p class="details-desc">${desc}</p>
            </div>
            
            <div class="details-section">
                <h4>Guidelines</h4>
                <p>${extraData.guidelines}</p>
            </div>

            <div class="details-section">
                <h4>Rules & Regulations</h4>
                <ul class="details-list">
                    ${rulesList}
                </ul>
            </div>

            <div class="details-section">
                <h4>Schedule Information</h4>
                <p>${extraData.schedule}</p>
            </div>

            <div class="details-cta">
                <a href="register.html" class="btn btn-primary">
                    <span>Register for ${event.title}</span>
                </a>
            </div>
        `;
    }
}

// ============================================
// INITIALIZE ALL COMPONENTS
// ============================================
document.addEventListener('DOMContentLoaded', () => {
    // Initialize 3D Scene (only if Three.js is loaded and canvas exists)
    if (typeof THREE !== 'undefined' && document.getElementById('hero-canvas')) {
        try {
            new HeroScene();
        } catch (error) {
            console.log('Error initializing 3D scene:', error);
        }
    }

    // Initialize other components (they handle missing elements internally)
    new Navigation();
    new CountdownTimer();
    new ScrollAnimations();
    new StatsCounter();
    new EventsFilter();
    new CursorGlow();
    new RegistrationForm();
    new ParallaxEffects();
    new EventDetails();

    // Setup modal click handler if modal exists
    const successModal = document.getElementById('successModal');
    if (successModal) {
        successModal.addEventListener('click', (e) => {
            if (e.target === e.currentTarget) {
                closeModal();
            }
        });
    }

    // Remove loading state
    document.body.classList.add('loaded');
});

// ============================================
// PRELOADER (Optional)
// ============================================
window.addEventListener('load', () => {
    document.body.classList.add('loaded');
});
