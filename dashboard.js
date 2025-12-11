// ===== GOPOS Admin Dashboard =====
// JavaScript for Dashboard Functionality

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

// ===== Toast Notifications =====
const Toast = {
    show(message, type = 'info') {
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
            icon: type,
            title: message
        });
    }
};

// ===== Sidebar Management =====
const SidebarManager = {
    init() {
        this.sidebar = document.getElementById('sidebar');
        this.menuToggle = document.getElementById('menuToggle');
        this.sidebarToggle = document.getElementById('sidebarToggle');
        this.overlay = this.createOverlay();
        this.bindEvents();
    },

    createOverlay() {
        const overlay = document.createElement('div');
        overlay.className = 'sidebar-overlay';
        overlay.id = 'sidebarOverlay';
        document.body.appendChild(overlay);
        return overlay;
    },

    bindEvents() {
        this.menuToggle?.addEventListener('click', () => this.toggle());
        this.sidebarToggle?.addEventListener('click', () => this.close());
        this.overlay?.addEventListener('click', () => this.close());

        // Close on window resize if open
        window.addEventListener('resize', () => {
            if (window.innerWidth > 1024) {
                this.close();
            }
        });
    },

    toggle() {
        this.sidebar?.classList.toggle('active');
        this.overlay?.classList.toggle('active');
    },

    close() {
        this.sidebar?.classList.remove('active');
        this.overlay?.classList.remove('active');
    }
};

// ===== Profile Dropdown =====
const ProfileDropdown = {
    init() {
        this.profile = document.getElementById('userProfile');
        this.dropdown = document.getElementById('profileDropdown');
        this.bindEvents();
    },

    bindEvents() {
        this.profile?.addEventListener('click', (e) => {
            e.stopPropagation();
            this.toggle();
        });

        document.addEventListener('click', () => this.close());

        // Logout
        document.getElementById('logoutBtn')?.addEventListener('click', async (e) => {
            e.preventDefault();
            const result = await Swal.fire({
                icon: 'question',
                title: 'Keluar?',
                text: 'Apakah Anda yakin ingin keluar?',
                showCancelButton: true,
                confirmButtonText: 'Ya, Keluar',
                cancelButtonText: 'Batal'
            });

            if (result.isConfirmed) {
                localStorage.removeItem('gopos-user');
                Toast.show('Berhasil keluar', 'success');
                setTimeout(() => {
                    window.location.href = 'index.html';
                }, 1000);
            }
        });
    },

    toggle() {
        this.dropdown?.classList.toggle('active');
    },

    close() {
        this.dropdown?.classList.remove('active');
    }
};

// ===== Chart Initialization =====
const ChartManager = {
    init() {
        this.initChatChart();
        this.initQuestionTypeChart();
        this.bindEvents();
    },

    bindEvents() {
        document.getElementById('chatPeriod')?.addEventListener('change', (e) => {
            this.updateChatChart(parseInt(e.target.value));
        });
    },

    initChatChart() {
        const ctx = document.getElementById('chatChart');
        if (!ctx) return;

        const data = this.generateChatData(30);

        this.chatChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: data.labels,
                datasets: [{
                    label: 'Chat',
                    data: data.values,
                    borderColor: '#1E3A5F',
                    backgroundColor: 'rgba(30, 58, 95, 0.1)',
                    borderWidth: 2,
                    fill: true,
                    tension: 0.4,
                    pointRadius: 0,
                    pointHoverRadius: 6,
                    pointHoverBackgroundColor: '#1E3A5F',
                    pointHoverBorderColor: '#fff',
                    pointHoverBorderWidth: 2
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    },
                    tooltip: {
                        backgroundColor: 'rgba(30, 58, 95, 0.9)',
                        titleColor: '#fff',
                        bodyColor: '#fff',
                        padding: 12,
                        cornerRadius: 8,
                        displayColors: false
                    }
                },
                scales: {
                    x: {
                        grid: {
                            display: false
                        },
                        ticks: {
                            color: '#64748b'
                        }
                    },
                    y: {
                        beginAtZero: true,
                        grid: {
                            color: 'rgba(100, 116, 139, 0.1)'
                        },
                        ticks: {
                            color: '#64748b'
                        }
                    }
                },
                interaction: {
                    intersect: false,
                    mode: 'index'
                }
            }
        });
    },

    initQuestionTypeChart() {
        const ctx = document.getElementById('questionTypeChart');
        if (!ctx) return;

        this.questionChart = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: ['Cek Resi', 'Cek Ongkir', 'Cari Kantor', 'Lainnya'],
                datasets: [{
                    data: [45, 30, 15, 10],
                    backgroundColor: [
                        '#1E3A5F',
                        '#F26522',
                        '#3B82F6',
                        '#10B981'
                    ],
                    borderWidth: 0,
                    hoverOffset: 8
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                cutout: '65%',
                plugins: {
                    legend: {
                        display: false
                    },
                    tooltip: {
                        backgroundColor: 'rgba(30, 58, 95, 0.9)',
                        padding: 12,
                        cornerRadius: 8
                    }
                }
            }
        });
    },

    generateChatData(days) {
        const labels = [];
        const values = [];
        const today = new Date();

        for (let i = days - 1; i >= 0; i--) {
            const date = new Date(today);
            date.setDate(date.getDate() - i);
            labels.push(date.toLocaleDateString('id-ID', { day: '2-digit', month: 'short' }));
            values.push(Math.floor(Math.random() * 500) + 200);
        }

        return { labels, values };
    },

    updateChatChart(days) {
        if (!this.chatChart) return;

        const data = this.generateChatData(days);
        this.chatChart.data.labels = data.labels;
        this.chatChart.data.datasets[0].data = data.values;
        this.chatChart.update();

        Toast.show(`Data diperbarui untuk ${days} hari terakhir`, 'success');
    }
};

// ===== Refresh Data =====
const RefreshManager = {
    init() {
        document.getElementById('refreshBtn')?.addEventListener('click', () => this.refresh());
    },

    async refresh() {
        const btn = document.getElementById('refreshBtn');
        const originalText = btn.innerHTML;

        btn.innerHTML = '<span class="spinner"></span> Loading...';
        btn.disabled = true;

        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1500));

        btn.innerHTML = originalText;
        btn.disabled = false;

        Toast.show('Data berhasil diperbarui!', 'success');
    }
};

// ===== Notification =====
const NotificationManager = {
    init() {
        document.getElementById('notificationBtn')?.addEventListener('click', () => {
            Swal.fire({
                title: 'Notifikasi',
                html: `
          <div style="text-align: left;">
            <div style="padding: 12px; border-bottom: 1px solid #e2e8f0;">
              <strong>📦 Resi Baru</strong><br>
              <small style="color: #64748b;">5 resi baru dilacak 2 menit lalu</small>
            </div>
            <div style="padding: 12px; border-bottom: 1px solid #e2e8f0;">
              <strong>⭐ Feedback Baru</strong><br>
              <small style="color: #64748b;">3 feedback baru masuk 10 menit lalu</small>
            </div>
            <div style="padding: 12px;">
              <strong>💬 Chat Pending</strong><br>
              <small style="color: #64748b;">12 chat menunggu respon</small>
            </div>
          </div>
        `,
                showConfirmButton: false,
                showCloseButton: true
            });
        });
    }
};

// ===== Active Nav Item =====
const NavManager = {
    init() {
        const currentPage = window.location.pathname.split('/').pop() || 'dashboard.html';
        const navItems = document.querySelectorAll('.nav-item');

        navItems.forEach(item => {
            const href = item.getAttribute('href');
            if (href === currentPage || (currentPage === '' && href === 'dashboard.html')) {
                item.classList.add('active');
            } else {
                item.classList.remove('active');
            }
        });
    }
};

// ===== Counter Animation =====
const CounterAnimation = {
    init() {
        const statValues = document.querySelectorAll('.stat-value');

        statValues.forEach(stat => {
            const text = stat.textContent;
            const hasPercent = text.includes('/') || text.includes('%');

            if (!hasPercent) {
                const numericValue = parseInt(text.replace(/[^0-9]/g, ''));
                if (!isNaN(numericValue)) {
                    this.animateValue(stat, 0, numericValue, 1500);
                }
            }
        });
    },

    animateValue(element, start, end, duration) {
        const startTime = performance.now();
        const format = (num) => num.toLocaleString('id-ID');

        const update = (currentTime) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const easeOut = 1 - Math.pow(1 - progress, 3);
            const current = Math.floor(start + (end - start) * easeOut);

            element.textContent = format(current);

            if (progress < 1) {
                requestAnimationFrame(update);
            }
        };

        requestAnimationFrame(update);
    }
};

// ===== Initialize Dashboard =====
document.addEventListener('DOMContentLoaded', () => {
    ThemeManager.init();
    SidebarManager.init();
    ProfileDropdown.init();
    ChartManager.init();
    RefreshManager.init();
    NotificationManager.init();
    NavManager.init();
    CounterAnimation.init();

    console.log('📊 GOPOS Admin Dashboard Initialized');
});
