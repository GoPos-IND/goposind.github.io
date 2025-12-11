// ===== GOPOS - GO-LANG POS ASSISTANT =====
// JavaScript for Landing Page

// ===== Configuration =====
const CONFIG = {
    whatsappNumber: '6281234567890', // Ganti dengan nomor WhatsApp GOPOS
    whatsappMessage: 'Halo GOPOS! Saya ingin bertanya tentang layanan Pos Indonesia.',
    animationDelay: 100,
    counterDuration: 2000,
};

// ===== Theme Management =====
const ThemeManager = {
    init() {
        const savedTheme = localStorage.getItem('gopos-theme') || 'dark';
        this.setTheme(savedTheme);
        this.bindEvents();
    },

    setTheme(theme) {
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('gopos-theme', theme);
    },

    toggleTheme() {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        this.setTheme(newTheme);

        // Show toast notification
        Toast.show(
            newTheme === 'dark' ? '🌙 Mode Gelap Aktif' : '☀️ Mode Terang Aktif',
            'success'
        );
    },

    bindEvents() {
        const themeToggle = document.getElementById('themeToggle');
        if (themeToggle) {
            themeToggle.addEventListener('click', () => this.toggleTheme());
        }
    }
};

// ===== Toast Notifications (using SweetAlert2) =====
const Toast = {
    show(message, type = 'info') {
        const iconMap = {
            success: 'success',
            error: 'error',
            warning: 'warning',
            info: 'info'
        };

        const Toast = Swal.mixin({
            toast: true,
            position: 'top-end',
            showConfirmButton: false,
            timer: 3000,
            timerProgressBar: true,
            didOpen: (toast) => {
                toast.addEventListener('mouseenter', Swal.stopTimer);
                toast.addEventListener('mouseleave', Swal.resumeTimer);
            }
        });

        Toast.fire({
            icon: iconMap[type] || 'info',
            title: message
        });
    }
};

// ===== Alert Helper =====
const Alert = {
    success(title, message) {
        return Swal.fire({
            icon: 'success',
            title: title,
            text: message,
            confirmButtonText: 'OK',
            customClass: {
                popup: 'swal-custom-popup',
                confirmButton: 'btn btn-primary'
            }
        });
    },

    error(title, message) {
        return Swal.fire({
            icon: 'error',
            title: title,
            text: message,
            confirmButtonText: 'OK',
            customClass: {
                popup: 'swal-custom-popup',
                confirmButton: 'btn btn-primary'
            }
        });
    },

    confirm(title, message) {
        return Swal.fire({
            icon: 'question',
            title: title,
            text: message,
            showCancelButton: true,
            confirmButtonText: 'Ya',
            cancelButtonText: 'Batal',
            customClass: {
                popup: 'swal-custom-popup',
                confirmButton: 'btn btn-primary',
                cancelButton: 'btn btn-secondary'
            }
        });
    },

    loading(title = 'Memproses...') {
        return Swal.fire({
            title: title,
            allowOutsideClick: false,
            didOpen: () => {
                Swal.showLoading();
            }
        });
    }
};

// ===== Navbar Scroll Effect =====
const NavbarManager = {
    init() {
        this.navbar = document.querySelector('.navbar');
        this.bindEvents();
    },

    bindEvents() {
        window.addEventListener('scroll', () => this.handleScroll());
    },

    handleScroll() {
        if (window.scrollY > 50) {
            this.navbar.classList.add('scrolled');
        } else {
            this.navbar.classList.remove('scrolled');
        }
    }
};

// ===== Mobile Menu =====
const MobileMenuManager = {
    init() {
        this.menu = document.getElementById('mobileMenu');
        this.openBtn = document.getElementById('mobileMenuBtn');
        this.closeBtn = document.getElementById('mobileMenuClose');
        this.bindEvents();
    },

    bindEvents() {
        if (this.openBtn) {
            this.openBtn.addEventListener('click', () => this.open());
        }
        if (this.closeBtn) {
            this.closeBtn.addEventListener('click', () => this.close());
        }

        // Close on link click
        const links = this.menu?.querySelectorAll('a');
        links?.forEach(link => {
            link.addEventListener('click', () => this.close());
        });

        // Mobile login/register buttons
        const mobileLoginBtn = document.getElementById('mobileLoginBtn');
        const mobileRegisterBtn = document.getElementById('mobileRegisterBtn');

        if (mobileLoginBtn) {
            mobileLoginBtn.addEventListener('click', () => {
                this.close();
                ModalManager.open('loginModal');
            });
        }

        if (mobileRegisterBtn) {
            mobileRegisterBtn.addEventListener('click', () => {
                this.close();
                ModalManager.open('registerModal');
            });
        }
    },

    open() {
        this.menu?.classList.add('active');
        document.body.style.overflow = 'hidden';
    },

    close() {
        this.menu?.classList.remove('active');
        document.body.style.overflow = '';
    }
};

// ===== Modal Management =====
const ModalManager = {
    init() {
        this.modals = document.querySelectorAll('.modal-overlay');
        this.bindEvents();
    },

    bindEvents() {
        // Open modal buttons
        document.getElementById('loginBtn')?.addEventListener('click', () => this.open('loginModal'));
        document.getElementById('registerBtn')?.addEventListener('click', () => this.open('registerModal'));

        // Close buttons
        this.modals.forEach(modal => {
            const closeBtn = modal.querySelector('.modal-close');
            closeBtn?.addEventListener('click', () => this.close(modal.id));

            // Close on backdrop click
            modal.addEventListener('click', (e) => {
                if (e.target === modal) this.close(modal.id);
            });
        });

        // Modal links (switch between modals)
        document.querySelectorAll('[data-modal]').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const targetModal = link.dataset.modal;
                this.modals.forEach(m => m.classList.remove('active'));
                this.open(targetModal);
            });
        });

        // ESC key to close
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.modals.forEach(modal => {
                    if (modal.classList.contains('active')) {
                        this.close(modal.id);
                    }
                });
            }
        });
    },

    open(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.add('active');
            document.body.style.overflow = 'hidden';
        }
    },

    close(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.remove('active');
            document.body.style.overflow = '';
        }
    }
};

// ===== Form Handling =====
const FormManager = {
    init() {
        this.bindEvents();
    },

    bindEvents() {
        // Login form
        document.getElementById('loginForm')?.addEventListener('submit', (e) => this.handleLogin(e));

        // Register form
        document.getElementById('registerForm')?.addEventListener('submit', (e) => this.handleRegister(e));

        // Reset form
        document.getElementById('resetForm')?.addEventListener('submit', (e) => this.handleReset(e));

        // Password toggle
        document.querySelectorAll('.password-toggle').forEach(btn => {
            btn.addEventListener('click', (e) => this.togglePassword(e));
        });
    },

    togglePassword(e) {
        const input = e.currentTarget.previousElementSibling;
        const icon = e.currentTarget.querySelector('span');

        if (input.type === 'password') {
            input.type = 'text';
            icon.textContent = '🔒';
        } else {
            input.type = 'password';
            icon.textContent = '👁';
        }
    },

    async handleLogin(e) {
        e.preventDefault();
        const email = document.getElementById('loginEmail').value;
        const password = document.getElementById('loginPassword').value;

        // Show loading
        Alert.loading('Memproses login...');

        // Simulate API call
        await this.delay(1500);

        // Close loading and show success
        Swal.close();

        // Store user data
        const userData = { email, name: email.split('@')[0] };
        localStorage.setItem('gopos-user', JSON.stringify(userData));

        await Alert.success('Login Berhasil!', `Selamat datang kembali, ${userData.name}!`);

        ModalManager.close('loginModal');
        UserManager.updateUI();
        document.getElementById('loginForm').reset();
    },

    async handleRegister(e) {
        e.preventDefault();
        const name = document.getElementById('registerName').value;
        const email = document.getElementById('registerEmail').value;
        const password = document.getElementById('registerPassword').value;
        const confirmPassword = document.getElementById('confirmPassword').value;

        // Validate password match
        if (password !== confirmPassword) {
            Alert.error('Oops!', 'Password tidak cocok. Silakan coba lagi.');
            return;
        }

        // Show loading
        Alert.loading('Membuat akun...');

        // Simulate API call
        await this.delay(1500);

        // Close loading and show success
        Swal.close();

        // Store user data
        const userData = { email, name };
        localStorage.setItem('gopos-user', JSON.stringify(userData));

        await Alert.success('Registrasi Berhasil!', `Selamat datang di GOPOS, ${name}!`);

        ModalManager.close('registerModal');
        UserManager.updateUI();
        document.getElementById('registerForm').reset();
    },

    async handleReset(e) {
        e.preventDefault();
        const email = document.getElementById('resetEmail').value;
        const newPassword = document.getElementById('newPassword').value;
        const confirmNewPassword = document.getElementById('confirmNewPassword').value;

        // Validate password match
        if (newPassword !== confirmNewPassword) {
            Alert.error('Oops!', 'Password baru tidak cocok. Silakan coba lagi.');
            return;
        }

        // Show loading
        Alert.loading('Mereset password...');

        // Simulate API call
        await this.delay(1500);

        // Close loading and show success
        Swal.close();

        await Alert.success('Password Berhasil Direset!', 'Silakan login dengan password baru Anda.');

        ModalManager.close('resetModal');
        ModalManager.open('loginModal');
        document.getElementById('resetForm').reset();
    },

    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
};

// ===== User Management =====
const UserManager = {
    init() {
        this.updateUI();
        this.bindEvents();
    },

    bindEvents() {
        // User avatar click
        document.getElementById('userAvatar')?.addEventListener('click', () => this.toggleDropdown());

        // Logout button
        document.getElementById('logoutBtn')?.addEventListener('click', () => this.logout());

        // Close dropdown on outside click
        document.addEventListener('click', (e) => {
            const userMenu = document.getElementById('userMenu');
            const dropdown = document.getElementById('userDropdown');

            if (userMenu && !userMenu.contains(e.target)) {
                dropdown?.classList.remove('active');
            }
        });
    },

    toggleDropdown() {
        const dropdown = document.getElementById('userDropdown');
        dropdown?.classList.toggle('active');
    },

    updateUI() {
        const userData = JSON.parse(localStorage.getItem('gopos-user'));
        const loginBtn = document.getElementById('loginBtn');
        const registerBtn = document.getElementById('registerBtn');
        const userMenu = document.getElementById('userMenu');
        const userName = document.getElementById('userName');
        const userEmail = document.getElementById('userEmail');
        const userAvatar = document.getElementById('userAvatar');

        if (userData) {
            loginBtn?.classList.add('hidden');
            registerBtn?.classList.add('hidden');
            userMenu?.classList.remove('hidden');

            if (userName) userName.textContent = userData.name;
            if (userEmail) userEmail.textContent = userData.email;
            if (userAvatar) userAvatar.textContent = userData.name.charAt(0).toUpperCase();
        } else {
            loginBtn?.classList.remove('hidden');
            registerBtn?.classList.remove('hidden');
            userMenu?.classList.add('hidden');
        }
    },

    async logout() {
        const result = await Alert.confirm('Keluar?', 'Apakah Anda yakin ingin keluar dari akun?');

        if (result.isConfirmed) {
            localStorage.removeItem('gopos-user');
            document.getElementById('userDropdown')?.classList.remove('active');
            this.updateUI();
            Toast.show('Berhasil keluar dari akun', 'success');
        }
    }
};

// ===== WhatsApp Integration =====
const WhatsAppManager = {
    init() {
        this.bindEvents();
    },

    bindEvents() {
        const buttons = [
            'whatsappBtn',
            'heroWhatsappBtn',
            'ctaWhatsappBtn'
        ];

        buttons.forEach(id => {
            document.getElementById(id)?.addEventListener('click', () => this.openChat());
        });
    },

    openChat() {
        const url = `https://wa.me/${CONFIG.whatsappNumber}?text=${encodeURIComponent(CONFIG.whatsappMessage)}`;
        window.open(url, '_blank');
        Toast.show('Membuka WhatsApp...', 'success');
    }
};

// ===== Scroll Reveal Animation =====
const ScrollReveal = {
    init() {
        this.elements = document.querySelectorAll('.reveal, .reveal-left, .reveal-right');
        this.bindEvents();
        this.checkElements();
    },

    bindEvents() {
        window.addEventListener('scroll', () => this.checkElements());
        window.addEventListener('resize', () => this.checkElements());
    },

    checkElements() {
        const windowHeight = window.innerHeight;
        const revealPoint = 150;

        this.elements.forEach((element, index) => {
            const elementTop = element.getBoundingClientRect().top;

            if (elementTop < windowHeight - revealPoint) {
                setTimeout(() => {
                    element.classList.add('active');
                }, index * CONFIG.animationDelay);
            }
        });
    }
};

// ===== Counter Animation =====
const CounterAnimation = {
    init() {
        this.counters = document.querySelectorAll('.stat-number[data-count]');
        this.animated = new Set();
        this.bindEvents();
    },

    bindEvents() {
        window.addEventListener('scroll', () => this.checkCounters());
    },

    checkCounters() {
        const windowHeight = window.innerHeight;

        this.counters.forEach(counter => {
            const elementTop = counter.getBoundingClientRect().top;

            if (elementTop < windowHeight - 100 && !this.animated.has(counter)) {
                this.animated.add(counter);
                this.animateCounter(counter);
            }
        });
    },

    animateCounter(counter) {
        const target = parseInt(counter.dataset.count);
        const duration = CONFIG.counterDuration;
        const startTime = performance.now();

        const updateCounter = (currentTime) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);

            // Easing function for smooth animation
            const easeOutQuart = 1 - Math.pow(1 - progress, 4);
            const current = Math.floor(easeOutQuart * target);

            counter.textContent = this.formatNumber(current);

            if (progress < 1) {
                requestAnimationFrame(updateCounter);
            } else {
                counter.textContent = this.formatNumber(target);
            }
        };

        requestAnimationFrame(updateCounter);
    },

    formatNumber(num) {
        if (num >= 1000) {
            return (num / 1000).toFixed(num >= 10000 ? 0 : 1) + 'K+';
        }
        return num + (num >= 90 ? '%' : '+');
    }
};

// ===== Smooth Scroll =====
const SmoothScroll = {
    init() {
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', (e) => {
                e.preventDefault();
                const targetId = anchor.getAttribute('href');

                if (targetId === '#') return;

                const targetElement = document.querySelector(targetId);
                if (targetElement) {
                    const navbarHeight = document.querySelector('.navbar').offsetHeight;
                    const targetPosition = targetElement.offsetTop - navbarHeight - 20;

                    window.scrollTo({
                        top: targetPosition,
                        behavior: 'smooth'
                    });
                }
            });
        });
    }
};

// ===== Floating Animation for Cards =====
const FloatingCards = {
    init() {
        const cards = document.querySelectorAll('.feature-card, .service-card, .stat-card');

        cards.forEach(card => {
            card.addEventListener('mouseenter', () => {
                card.style.transition = 'transform 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55)';
            });
        });
    }
};

// ===== Chatbot Demo Widget =====
const ChatbotDemo = {
    responses: {
        resi: {
            pattern: /resi|tracking|lacak|cek.*resi/i,
            reply: (msg) => {
                const resiMatch = msg.match(/[A-Z]{2}\d+[A-Z]{2}|\d{10,}/i);
                const resiNo = resiMatch ? resiMatch[0].toUpperCase() : 'EX123456789ID';
                return `📦 **Status Pengiriman**\n\n` +
                    `Resi: ${resiNo}\n` +
                    `Status: ✅ Dalam Perjalanan\n` +
                    `Posisi: Hub Semarang\n` +
                    `Estimasi: ${new Date(Date.now() + 86400000).toLocaleDateString('id-ID')}\n\n` +
                    `_Catatan: Ini adalah demo. Untuk cek resi asli, hubungi kami via WhatsApp._`;
            }
        },
        ongkir: {
            pattern: /ongkir|ongkos|tarif|harga|kirim/i,
            reply: (msg) => {
                return `💰 **Estimasi Ongkos Kirim**\n\n` +
                    `Jakarta → Bandung (1kg)\n` +
                    `• Pos Express: Rp 25.000 (1 hari)\n` +
                    `• Kilat Khusus: Rp 18.000 (2-3 hari)\n` +
                    `• Reguler: Rp 12.000 (5-7 hari)\n\n` +
                    `_Untuk cek ongkir tujuan lain, kirim: "ongkir [asal] ke [tujuan] [berat]"_`;
            }
        },
        kantor: {
            pattern: /kantor|cabang|alamat|lokasi|terdekat/i,
            reply: (msg) => {
                return `🏢 **Kantor Pos Terdekat**\n\n` +
                    `1. Kantor Pos Jakarta Pusat\n` +
                    `   📍 Jl. Lapangan Banteng Utara No.1\n` +
                    `   ⏰ 08:00 - 17:00\n\n` +
                    `2. Kantor Pos Menteng\n` +
                    `   📍 Jl. Sutan Syahrir No.1\n` +
                    `   ⏰ 08:00 - 16:00\n\n` +
                    `_Ketik nama kota untuk mencari kantor pos di wilayah Anda._`;
            }
        },
        layanan: {
            pattern: /layanan|service|jenis|produk|express|kilat/i,
            reply: () => {
                return `🚚 **Layanan Pos Indonesia**\n\n` +
                    `• **Pos Express** - Tercepat, H+1\n` +
                    `• **Kilat Khusus** - Cepat & ekonomis\n` +
                    `• **Reguler** - Hemat untuk paket standar\n` +
                    `• **Internasional** - Kirim ke luar negeri\n\n` +
                    `Ketik nama layanan untuk info lebih detail.`;
            }
        },
        greeting: {
            pattern: /halo|hai|hi|hello|selamat|pagi|siang|sore|malam/i,
            reply: () => {
                const hour = new Date().getHours();
                const greeting = hour < 11 ? 'Selamat pagi' : hour < 15 ? 'Selamat siang' : hour < 18 ? 'Selamat sore' : 'Selamat malam';
                return `👋 ${greeting}! Saya GOPOS Bot.\n\nAda yang bisa saya bantu? Ketik:\n• "cek resi" untuk lacak paket\n• "ongkir" untuk cek tarif\n• "kantor pos" untuk cari lokasi`;
            }
        },
        thanks: {
            pattern: /terima kasih|thanks|thx|makasih/i,
            reply: () => `Sama-sama! 😊 Jika ada pertanyaan lain, jangan ragu untuk bertanya ya! 📮`
        },
        default: {
            reply: () => `Maaf, saya belum mengerti pertanyaan Anda. 🤔\n\nCoba ketik:\n• "cek resi" + nomor resi\n• "ongkir" untuk tarif pengiriman\n• "kantor pos" untuk cari lokasi\n\nAtau klik tombol di bawah untuk bantuan cepat!`
        }
    },

    init() {
        this.widget = document.getElementById('chatbotDemo');
        this.toggle = document.getElementById('chatbotToggle');
        this.window = document.getElementById('chatbotWindow');
        this.messages = document.getElementById('chatbotMessages');
        this.input = document.getElementById('chatbotInput');
        this.sendBtn = document.getElementById('chatbotSend');
        this.suggestions = document.querySelectorAll('.suggestion-btn');

        if (!this.widget) return;

        this.bindEvents();
    },

    bindEvents() {
        // Toggle chatbot window
        this.toggle?.addEventListener('click', () => this.toggleChat());

        // Send message
        this.sendBtn?.addEventListener('click', () => this.sendMessage());
        this.input?.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.sendMessage();
        });

        // Suggestion buttons
        this.suggestions.forEach(btn => {
            btn.addEventListener('click', () => {
                const msg = btn.dataset.msg;
                this.input.value = msg;
                this.sendMessage();
            });
        });
    },

    toggleChat() {
        this.widget.classList.toggle('active');
        if (this.widget.classList.contains('active')) {
            this.input?.focus();
        }
    },

    sendMessage() {
        const text = this.input?.value.trim();
        if (!text) return;

        // Add user message
        this.addMessage(text, 'user');
        this.input.value = '';

        // Show typing indicator
        this.showTyping();

        // Generate response after delay
        setTimeout(() => {
            this.hideTyping();
            const response = this.generateResponse(text);
            this.addMessage(response, 'bot');
        }, 1000 + Math.random() * 1000);
    },

    addMessage(text, type) {
        const msgDiv = document.createElement('div');
        msgDiv.className = `${type}-message`;

        const bubble = document.createElement('div');
        bubble.className = 'message-bubble';
        bubble.innerHTML = text.replace(/\n/g, '<br>').replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/_(.*?)_/g, '<em>$1</em>');

        msgDiv.appendChild(bubble);
        this.messages.appendChild(msgDiv);
        this.messages.scrollTop = this.messages.scrollHeight;
    },

    showTyping() {
        const typing = document.createElement('div');
        typing.className = 'bot-message typing-msg';
        typing.innerHTML = '<div class="typing-dots"><span></span><span></span><span></span></div>';
        this.messages.appendChild(typing);
        this.messages.scrollTop = this.messages.scrollHeight;
    },

    hideTyping() {
        const typing = this.messages.querySelector('.typing-msg');
        typing?.remove();
    },

    generateResponse(text) {
        for (const [key, handler] of Object.entries(this.responses)) {
            if (key === 'default') continue;
            if (handler.pattern.test(text)) {
                return handler.reply(text);
            }
        }
        return this.responses.default.reply();
    }
};

// ===== Initialize All Managers =====
document.addEventListener('DOMContentLoaded', () => {
    // Core functionality
    ThemeManager.init();
    NavbarManager.init();
    MobileMenuManager.init();
    ModalManager.init();
    FormManager.init();
    UserManager.init();
    WhatsAppManager.init();

    // Animations
    ScrollReveal.init();
    CounterAnimation.init();
    SmoothScroll.init();
    FloatingCards.init();

    // Chatbot Demo
    ChatbotDemo.init();

    // Log initialization
    console.log('🚀 GOPOS Landing Page Initialized');
    console.log('📮 GO-LANG POS ASSISTANT - PT Pos Indonesia');
});
