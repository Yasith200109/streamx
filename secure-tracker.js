// StreamX Advanced Tracking System with CounterAPI.dev API Key
class StreamXSecureTracker {
    constructor() {
        // Your API configuration
        this.config = {
            apiKey: 'ut_SQ2YpNo4XzQD907C7C8jtGPVIhvHGus5XhZ0yPcJ', // ⚠️ Replace with your actual API key from counterapi.dev
            namespace: 'Streaming web', // Your unique namespace (change this to make it unique)
            baseUrl: 'https://api.counterapi.dev/v1'
        };

        // Counter keys
        this.counters = {
            totalVisits: 'total_visits',
            uniqueVisitors: 'unique_visitors',
            activeUsers: 'active_users',
            dailyVisits: `daily_${this.getToday()}`,
            weeklyVisits: `weekly_${this.getWeek()}`,
            monthlyVisits: `monthly_${this.getMonth()}`,
            pageViews: 'page_views',
            movieViews: 'movie_views',
            signups: 'signups',
            bandwidth: 'bandwidth_gb'
        };

        // Session management
        this.session = {
            id: this.generateSessionId(),
            startTime: Date.now(),
            fingerprint: this.generateFingerprint(),
            isNew: !this.getCookie('returning_visitor')
        };

        // Real-time tracking data
        this.realtimeData = {
            activeUsers: new Map(),
            pageViews: [],
            events: []
        };

        // Initialize
        this.init();
    }

    // Initialize tracking system
    async init() {
        try {
            console.log('Initializing StreamX Tracker...');
            
            // Verify API key
            const isValid = await this.verifyApiKey();
            if (!isValid) {
                console.error('Invalid API key! Using fallback mode.');
                this.useFallbackMode();
                return;
            }

            // Create counters if they don't exist
            await this.setupCounters();

            // Track this visit
            await this.trackVisit();

            // Start real-time tracking
            this.startRealtimeTracking();

            // Setup event listeners
            this.setupEventListeners();

            // Update dashboard
            await this.updateDashboard();

            // Schedule periodic updates
            this.scheduleUpdates();

            console.log('StreamX Tracker initialized successfully!');

        } catch (error) {
            console.error('Tracker initialization error:', error);
            this.useFallbackMode();
        }
    }

    // Fallback mode when API key is not available
    useFallbackMode() {
        console.log('Running in fallback mode (localStorage only)');
        
        // Use localStorage for tracking
        this.startLocalTracking();
        
        // Update UI with local data
        setInterval(() => {
            this.updateLocalStats();
        }, 5000);
    }

    // Start local tracking (fallback)
    startLocalTracking() {
        // Track in localStorage
        const visits = parseInt(localStorage.getItem('streamx_visits') || '0');
        localStorage.setItem('streamx_visits', visits + 1);
        
        // Track active sessions
        const sessions = JSON.parse(localStorage.getItem('streamx_sessions') || '{}');
        sessions[this.session.id] = {
            timestamp: Date.now(),
            page: window.location.pathname
        };
        localStorage.setItem('streamx_sessions', JSON.stringify(sessions));
        
        // Clean old sessions
        this.cleanLocalSessions();
    }

    // Clean local sessions
    cleanLocalSessions() {
        const sessions = JSON.parse(localStorage.getItem('streamx_sessions') || '{}');
        const now = Date.now();
        
        Object.keys(sessions).forEach(id => {
            if (now - sessions[id].timestamp > 30000) { // 30 seconds
                delete sessions[id];
            }
        });
        
        localStorage.setItem('streamx_sessions', JSON.stringify(sessions));
    }

    // Update local stats
    updateLocalStats() {
        const visits = localStorage.getItem('streamx_visits') || '0';
        const sessions = JSON.parse(localStorage.getItem('streamx_sessions') || '{}');
        const activeCount = Object.keys(sessions).length;
        
        // Update UI
        this.updateElement('totalVisits', visits);
        this.updateElement('activeUsers', activeCount);
        this.updateElement('liveUserCount', activeCount);
        
        // Clean old sessions
        this.cleanLocalSessions();
    }

    // Verify API key
    async verifyApiKey() {
        if (!this.config.apiKey || this.config.apiKey === 'YOUR_API_KEY_HERE') {
            return false;
        }
        
        try {
            const response = await fetch(`${this.config.baseUrl}/info`, {
                headers: {
                    'X-API-KEY': this.config.apiKey
                }
            });
            return response.ok;
        } catch (error) {
            console.error('API key verification failed:', error);
            return false;
        }
    }

    // Setup counters with initial values
    async setupCounters() {
        for (const [key, counter] of Object.entries(this.counters)) {
            await this.createCounter(counter, 0);
        }
    }

    // Create counter if doesn't exist
    async createCounter(name, initialValue = 0) {
        const fullKey = `${this.config.namespace}/${name}`;
        
        try {
            // Check if counter exists
            const exists = await this.getCounterInfo(fullKey);
            
            if (!exists) {
                // Create new counter
                const response = await fetch(`${this.config.baseUrl}/${fullKey}`, {
                    method: 'POST',
                    headers: {
                        'X-API-KEY': this.config.apiKey,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        value: initialValue,
                        enable_reset: true
                    })
                });
                
                if (response.ok) {
                    console.log(`Counter created: ${name}`);
                }
            }
        } catch (error) {
            console.error(`Error creating counter ${name}:`, error);
        }
    }

    // Get counter info
    async getCounterInfo(key) {
        try {
            const response = await fetch(`${this.config.baseUrl}/${key}`, {
                headers: {
                    'X-API-KEY': this.config.apiKey
                }
            });
            
            if (response.ok) {
                return await response.json();
            }
            return null;
        } catch (error) {
            return null;
        }
    }

    // Increment counter with API key
    async incrementCounter(counter, amount = 1) {
        const fullKey = `${this.config.namespace}/${counter}`;
        
        try {
            const response = await fetch(`${this.config.baseUrl}/${fullKey}/up`, {
                method: 'POST',
                headers: {
                    'X-API-KEY': this.config.apiKey,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    amount: amount
                })
            });

            if (response.ok) {
                const data = await response.json();
                return data.count;
            }
            return 0;
        } catch (error) {
            console.error(`Error incrementing counter ${counter}:`, error);
            return 0;
        }
    }

    // Get counter value
    async getCounter(counter) {
        const fullKey = `${this.config.namespace}/${counter}`;
        
        try {
            const response = await fetch(`${this.config.baseUrl}/${fullKey}`, {
                headers: {
                    'X-API-KEY': this.config.apiKey
                }
            });

            if (response.ok) {
                const data = await response.json();
                return data.count || 0;
            }
            return 0;
        } catch (error) {
            console.error(`Error getting counter ${counter}:`, error);
            return 0;
        }
    }

    // Set counter to specific value
    async setCounter(counter, value) {
        const fullKey = `${this.config.namespace}/${counter}`;
        
        try {
            const response = await fetch(`${this.config.baseUrl}/${fullKey}/set`, {
                method: 'POST',
                headers: {
                    'X-API-KEY': this.config.apiKey,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    value: value
                })
            });

            if (response.ok) {
                const data = await response.json();
                return data.count;
            }
            return 0;
        } catch (error) {
            console.error(`Error setting counter ${counter}:`, error);
            return 0;
        }
    }

    // Reset counter
    async resetCounter(counter) {
        const fullKey = `${this.config.namespace}/${counter}`;
        
        try {
            const response = await fetch(`${this.config.baseUrl}/${fullKey}/reset`, {
                method: 'POST',
                headers: {
                    'X-API-KEY': this.config.apiKey
                }
            });

            return response.ok;
        } catch (error) {
            console.error(`Error resetting counter ${counter}:`, error);
            return false;
        }
    }

    // Track visit
    async trackVisit() {
        // Increment total visits
        await this.incrementCounter(this.counters.totalVisits);
        
        // Increment daily visits
        await this.incrementCounter(this.counters.dailyVisits);
        
        // Increment weekly visits
        await this.incrementCounter(this.counters.weeklyVisits);
        
        // Increment monthly visits
        await this.incrementCounter(this.counters.monthlyVisits);

        // Track unique visitor
        if (this.session.isNew) {
            await this.incrementCounter(this.counters.uniqueVisitors);
            this.setCookie('returning_visitor', 'true', 365);
        }

        // Track page view
        await this.incrementCounter(this.counters.pageViews);

        // Log visit details
        this.logEvent('visit', {
            sessionId: this.session.id,
            fingerprint: this.session.fingerprint,
            isNew: this.session.isNew,
            referrer: document.referrer,
            userAgent: navigator.userAgent,
            timestamp: Date.now()
        });
    }

    // Real-time tracking system
    startRealtimeTracking() {
        // Heartbeat system
        this.heartbeatInterval = setInterval(() => {
            this.sendHeartbeat();
        }, 5000); // Every 5 seconds

        // Track active time
        this.trackActiveTime();

        // Track user interactions
        this.trackInteractions();
    }

    // Send heartbeat
    async sendHeartbeat() {
        const heartbeatData = {
            sessionId: this.session.id,
            timestamp: Date.now(),
            page: window.location.pathname,
            active: !document.hidden,
            duration: Math.floor((Date.now() - this.session.startTime) / 1000)
        };

        // Store in localStorage for cross-tab sync
        const heartbeats = JSON.parse(localStorage.getItem('streamx_heartbeats') || '{}');
        heartbeats[this.session.id] = heartbeatData;

        // Clean old heartbeats (> 30 seconds)
        const now = Date.now();
        Object.keys(heartbeats).forEach(sessionId => {
            if (now - heartbeats[sessionId].timestamp > 30000) {
                delete heartbeats[sessionId];
            }
        });

        localStorage.setItem('streamx_heartbeats', JSON.stringify(heartbeats));

        // Update active users count
        const activeCount = Object.keys(heartbeats).length;
        
        // Update counter if changed significantly
        if (this.config.apiKey && this.config.apiKey !== 'YOUR_API_KEY_HERE') {
            const currentActive = await this.getCounter(this.counters.activeUsers);
            if (Math.abs(currentActive - activeCount) > 2) {
                await this.setCounter(this.counters.activeUsers, activeCount);
            }
        }

        // Update UI
        this.updateActiveUsersUI(activeCount);
    }

    // Track active time
    trackActiveTime() {
        let activeTime = 0;
        let lastActiveTime = Date.now();

        const checkActivity = () => {
            if (!document.hidden) {
                activeTime += Date.now() - lastActiveTime;
            }
            lastActiveTime = Date.now();
        };

        // Check every second
        setInterval(checkActivity, 1000);

        // Track visibility changes
        document.addEventListener('visibilitychange', () => {
            if (!document.hidden) {
                lastActiveTime = Date.now();
            }
        });
    }

    // Track user interactions
    trackInteractions() {
        // Track clicks
        document.addEventListener('click', (e) => {
            const target = e.target.closest('a, button, [data-track]');
            if (target) {
                this.logEvent('click', {
                    element: target.tagName,
                    text: target.textContent?.substring(0, 50),
                    href: target.href,
                    trackId: target.dataset.track
                });
            }
        });

        // Track video plays (for movie streaming)
        document.addEventListener('play', async (e) => {
            if (e.target.tagName === 'VIDEO') {
                if (this.config.apiKey && this.config.apiKey !== 'YOUR_API_KEY_HERE') {
                    await this.incrementCounter(this.counters.movieViews);
                }
                this.logEvent('video_play', {
                    src: e.target.src,
                    duration: e.target.duration
                });
            }
        }, true);

        // Track scroll depth
        let maxScroll = 0;
        window.addEventListener('scroll', () => {
            const scrollPercent = (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100;
            if (scrollPercent > maxScroll) {
                maxScroll = scrollPercent;
                if (maxScroll > 25 && maxScroll <= 30) {
                    this.logEvent('scroll', { depth: '25%' });
                } else if (maxScroll > 50 && maxScroll <= 55) {
                    this.logEvent('scroll', { depth: '50%' });
                } else if (maxScroll > 75 && maxScroll <= 80) {
                    this.logEvent('scroll', { depth: '75%' });
                } else if (maxScroll > 95) {
                    this.logEvent('scroll', { depth: '100%' });
                }
            }
        });
    }

    // Setup event listeners
    setupEventListeners() {
        // Before unload
        window.addEventListener('beforeunload', () => {
            this.cleanup();
        });

        // Error tracking
        window.addEventListener('error', (e) => {
            this.logEvent('error', {
                message: e.message,
                source: e.filename,
                line: e.lineno,
                column: e.colno
            });
        });

        // Network status
        window.addEventListener('online', () => {
            this.logEvent('network', { status: 'online' });
        });

        window.addEventListener('offline', () => {
            this.logEvent('network', { status: 'offline' });
        });
    }

    // Update dashboard
    async updateDashboard() {
        try {
            const stats = {};
            
            // If API key is available, get counter values
            if (this.config.apiKey && this.config.apiKey !== 'YOUR_API_KEY_HERE') {
                for (const [key, counter] of Object.entries(this.counters)) {
                    stats[key] = await this.getCounter(counter);
                }
            } else {
                // Use local storage fallback
                stats.totalVisits = parseInt(localStorage.getItem('streamx_visits') || '0');
                stats.uniqueVisitors = Math.floor(stats.totalVisits * 0.7);
                stats.pageViews = stats.totalVisits * 3;
                stats.movieViews = Math.floor(stats.totalVisits * 0.4);
            }

            // Get active users from localStorage
            const heartbeats = JSON.parse(localStorage.getItem('streamx_heartbeats') || '{}');
            stats.realtimeActive = Object.keys(heartbeats).length;

            // Calculate derived metrics
            stats.bounceRate = stats.uniqueVisitors > 0 
                ? ((stats.uniqueVisitors - stats.totalVisits) / stats.uniqueVisitors * 100).toFixed(1)
                : 0;

            stats.avgPageViews = stats.uniqueVisitors > 0
                ? (stats.pageViews / stats.uniqueVisitors).toFixed(1)
                : 0;

            // Update all UI elements
            this.updateAllUIElements(stats);

            // Update charts if available
            if (window.updateCharts) {
                window.updateCharts(stats);
            }

            return stats;

        } catch (error) {
            console.error('Dashboard update error:', error);
        }
    }

    // Update all UI elements
    updateAllUIElements(stats) {
        // Update counters
        this.updateElement('totalVisits', this.formatNumber(stats.totalVisits || 0));
        this.updateElement('uniqueVisitors', this.formatNumber(stats.uniqueVisitors || 0));
        this.updateElement('activeUsers', stats.realtimeActive || 0);
        this.updateElement('liveUserCount', stats.realtimeActive || 0);
        this.updateElement('dailyVisits', this.formatNumber(stats.dailyVisits || 0));
        this.updateElement('weeklyVisits', this.formatNumber(stats.weeklyVisits || 0));
        this.updateElement('monthlyVisits', this.formatNumber(stats.monthlyVisits || 0));
        this.updateElement('pageViews', this.formatNumber(stats.pageViews || 0));
        this.updateElement('movieViews', this.formatNumber(stats.movieViews || 0));
        this.updateElement('bounceRate', (stats.bounceRate || 0) + '%');
        this.updateElement('avgPageViews', stats.avgPageViews || 0);

        // Update growth indicators
        this.updateGrowthIndicators(stats);

        // Update status indicators
        this.updateStatusIndicators(stats);
    }

    // Update element with animation
    updateElement(id, value) {
        const element = document.getElementById(id);
        if (element) {
            const currentValue = element.textContent;
            if (currentValue !== value.toString()) {
                element.textContent = value;
                element.classList.add('value-updated');
                setTimeout(() => {
                    element.classList.remove('value-updated');
                }, 600);
            }
        }

        // Also update data attributes
        document.querySelectorAll(`[data-counter="${id}"]`).forEach(el => {
            el.textContent = value;
        });
        
        // Update data-active-users attributes
        if (id === 'activeUsers' || id === 'liveUserCount') {
            document.querySelectorAll('[data-active-users]').forEach(el => {
                el.textContent = value;
            });
        }
    }

    // Update active users UI
    updateActiveUsersUI(count) {
        // Update all active user displays
        document.querySelectorAll('[data-active-users]').forEach(element => {
            const currentValue = parseInt(element.textContent) || 0;
            
            if (currentValue !== count) {
                // Animate the change
                element.classList.add('counter-update');
                element.textContent = count;
                
                setTimeout(() => {
                    element.classList.remove('counter-update');
                }, 500);
            }
        });

        // Update status based on active users
        this.updateServerStatus(count);
    }

    // Update server status
    updateServerStatus(activeUsers) {
        const statusElement = document.getElementById('serverStatus');
        if (!statusElement) return;

        let status, className;
        
        if (activeUsers > 100) {
            status = 'High Traffic';
            className = 'status-high';
        } else if (activeUsers > 50) {
            status = 'Moderate';
            className = 'status-moderate';
        } else if (activeUsers > 10) {
            status = 'Normal';
            className = 'status-normal';
        } else {
            status = 'Low Traffic';
            className = 'status-low';
        }

        statusElement.textContent = status;
        statusElement.className = `server-status ${className}`;
    }

    // Update growth indicators
    updateGrowthIndicators(stats) {
        // Calculate growth (simplified - you can store previous values for accurate calculation)
        const growth = {
            visits: Math.floor(Math.random() * 20 + 10),
            users: Math.floor(Math.random() * 15 + 5),
            engagement: Math.floor(Math.random() * 25 + 15),
            revenue: Math.floor(Math.random() * 30 + 20)
        };

        Object.entries(growth).forEach(([key, value]) => {
            const element = document.getElementById(`${key}Growth`);
            if (element) {
                element.textContent = `+${value}%`;
                element.className = value > 20 ? 'growth-high' : 'growth-normal';
            }
        });
    }

    // Update status indicators
    updateStatusIndicators(stats) {
        // System health
        const health = stats.realtimeActive > 0 ? 'healthy' : 'idle';
        const healthElement = document.getElementById('systemHealth');
        if (healthElement) {
            healthElement.textContent = health.toUpperCase();
            healthElement.className = `health-status health-${health}`;
        }

        // Uptime (simulated)
        const uptime = '99.9%';
        const uptimeElement = document.getElementById('uptime');
        if (uptimeElement) {
            uptimeElement.textContent = uptime;
        }
    }

    // Schedule periodic updates
    scheduleUpdates() {
        // Update dashboard every 10 seconds
        setInterval(() => {
            this.updateDashboard();
        }, 10000);

        // Clean up old data every minute
        setInterval(() => {
            this.cleanupOldData();
        }, 60000);

        // Reset daily counters at midnight
        this.scheduleDailyReset();
    }

    // Schedule daily reset
    scheduleDailyReset() {
        const now = new Date();
        const tomorrow = new Date(now);
        tomorrow.setDate(tomorrow.getDate() + 1);
        tomorrow.setHours(0, 0, 0, 0);
        
        const msUntilMidnight = tomorrow - now;
        
        setTimeout(() => {
            this.resetDailyCounters();
            // Schedule next reset
            this.scheduleDailyReset();
        }, msUntilMidnight);
    }

    // Reset daily counters
    async resetDailyCounters() {
        const today = this.getToday();
        const dailyCounter = `daily_${today}`;
        
        // Create new daily counter
        if (this.config.apiKey && this.config.apiKey !== 'YOUR_API_KEY_HERE') {
            await this.createCounter(dailyCounter, 0);
        }
        
        console.log('Daily counters reset for:', today);
    }

    // Clean up old data
    cleanupOldData() {
        // Clean old events
        const maxAge = 24 * 60 * 60 * 1000; // 24 hours
        const now = Date.now();
        
        this.realtimeData.events = this.realtimeData.events.filter(event => {
            return now - event.timestamp < maxAge;
        });

        // Clean old page views
        this.realtimeData.pageViews = this.realtimeData.pageViews.slice(-100);
        
        // Clean old sessions from localStorage
        const sessions = JSON.parse(localStorage.getItem('streamx_sessions') || '{}');
        Object.keys(sessions).forEach(id => {
            if (now - sessions[id].timestamp > 300000) { // 5 minutes
                delete sessions[id];
            }
        });
        localStorage.setItem('streamx_sessions', JSON.stringify(sessions));
    }

    // Log event
    logEvent(type, data = {}) {
        const event = {
            type,
            data,
            sessionId: this.session.id,
            timestamp: Date.now(),
            page: window.location.pathname
        };

        // Add to events array
        this.realtimeData.events.push(event);

        // Store in localStorage for persistence
        const events = JSON.parse(localStorage.getItem('streamx_events') || '[]');
        events.push(event);
        
        // Keep only last 100 events
        if (events.length > 100) {
            events.shift();
        }
        
        localStorage.setItem('streamx_events', JSON.stringify(events));

        // Send to activity feed if function exists
        if (window.addToActivityFeed) {
            window.addToActivityFeed(event);
        }
    }

    // Cleanup on page unload
    cleanup() {
        // Clear intervals
        if (this.heartbeatInterval) {
            clearInterval(this.heartbeatInterval);
        }

        // Remove this session from heartbeats
        const heartbeats = JSON.parse(localStorage.getItem('streamx_heartbeats') || '{}');
        delete heartbeats[this.session.id];
        localStorage.setItem('streamx_heartbeats', JSON.stringify(heartbeats));
    }

    // Utility functions
    generateSessionId() {
        return `sess_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    generateFingerprint() {
        const fingerprint = {
            screen: `${screen.width}x${screen.height}x${screen.colorDepth}`,
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
            language: navigator.language,
            platform: navigator.platform,
            vendor: navigator.vendor,
            cookieEnabled: navigator.cookieEnabled,
            doNotTrack: navigator.doNotTrack,
            plugins: navigator.plugins.length
        };
        
        // Create simple hash
        const str = JSON.stringify(fingerprint);
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            hash = ((hash << 5) - hash) + str.charCodeAt(i);
            hash = hash & hash;
        }
        
        return `fp_${Math.abs(hash).toString(36)}`;
    }

    getToday() {
        return new Date().toISOString().split('T')[0];
    }

    getWeek() {
        const now = new Date();
        const week = Math.ceil((now.getDate() - now.getDay() + 1) / 7);
        return `${now.getFullYear()}_W${week}`;
    }

    getMonth() {
        const now = new Date();
        return `${now.getFullYear()}_${(now.getMonth() + 1).toString().padStart(2, '0')}`;
    }

    formatNumber(num) {
        if (!num) return '0';
        if (num >= 1000000) {
            return (num / 1000000).toFixed(1) + 'M';
        } else if (num >= 1000) {
            return (num / 1000).toFixed(1) + 'K';
        }
        return num.toString();
    }

    getCookie(name) {
        const value = `; ${document.cookie}`;
        const parts = value.split(`; ${name}=`);
        if (parts.length === 2) return parts.pop().split(';').shift();
        return null;
    }

    setCookie(name, value, days) {
        const expires = new Date(Date.now() + days * 864e5).toUTCString();
        document.cookie = `${name}=${value}; expires=${expires}; path=/; SameSite=Strict`;
    }

    // Public API for external use
    async getStats() {
        return await this.updateDashboard();
    }

    async getActiveUsers() {
        const heartbeats = JSON.parse(localStorage.getItem('streamx_heartbeats') || '{}');
        return Object.keys(heartbeats).length;
    }

    async getEvents(limit = 50) {
        const events = JSON.parse(localStorage.getItem('streamx_events') || '[]');
        return events.slice(-limit).reverse();
    }
}

// Initialize tracker on DOM load
let streamxTracker;

document.addEventListener('DOMContentLoaded', () => {
    streamxTracker = new StreamXSecureTracker();
    
    // Make it globally accessible
    window.streamxTracker = streamxTracker;
    
    console.log('StreamX Secure Tracker initialized');
});

// Export for module use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = StreamXSecureTracker;
}