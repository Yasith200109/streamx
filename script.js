// Get Movies Data from Shared Storage (Auto-sync with Admin)
function getMoviesData() {
    try {
        // Get movies from shared localStorage (same as admin)
        const storedMovies = localStorage.getItem('streamxMovies');
        if (storedMovies) {
            return JSON.parse(storedMovies);
        }
    } catch (e) {
        console.log('Loading default movies');
    }
    
    // Return default movies if no stored data
    const defaultMovies = [
        {
            id: 1,
            title: "Quantum Universe",
            poster: "https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=400&q=80",
            backdrop: "https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=1920&q=80",
            year: 2024,
            rating: 9.5,
            quality: "4K HDR",
            category: "scifi",
            description: "A mind-bending journey through parallel dimensions where scientist Dr. Sarah Chen discovers a way to traverse between quantum realities.",
            videoUrl: "https://www.w3schools.com/html/mov_bbb.mp4",
            duration: "2h 28min",
            uploadDate: "2024-01-15",
            status: "active",
            views: 125430
        },
        {
            id: 2,
            title: "Dark Shadows",
            poster: "https://images.unsplash.com/photo-1594909122845-11baa439b7bf?w=400&q=80",
            backdrop: "https://images.unsplash.com/photo-1594909122845-11baa439b7bf?w=1920&q=80",
            year: 2024,
            rating: 8.8,
            quality: "HD",
            category: "horror",
            description: "When darkness falls, nightmares come alive in this terrifying tale of supernatural horror.",
            videoUrl: "https://www.w3schools.com/html/mov_bbb.mp4",
            duration: "1h 45min",
            uploadDate: "2024-01-14",
            status: "active",
            views: 89234
        },
        {
            id: 3,
            title: "Love in Tokyo",
            poster: "https://images.unsplash.com/photo-1542204165-65bf26472b9b?w=400&q=80",
            backdrop: "https://images.unsplash.com/photo-1542204165-65bf26472b9b?w=1920&q=80",
            year: 2024,
            rating: 7.9,
            quality: "4K",
            category: "romance",
            description: "A beautiful love story set in modern Tokyo, where two souls find each other in the bustling city.",
            videoUrl: "https://www.w3schools.com/html/mov_bbb.mp4",
            duration: "2h 5min",
            uploadDate: "2024-01-13",
            status: "active",
            views: 65123
        },
        {
            id: 4,
            title: "Action Force",
            poster: "https://images.unsplash.com/photo-1509347528160-9a9e33742cdb?w=400&q=80",
            backdrop: "https://images.unsplash.com/photo-1509347528160-9a9e33742cdb?w=1920&q=80",
            year: 2024,
            rating: 8.5,
            quality: "4K HDR",
            category: "action",
            description: "Elite special forces unit battles against a global terrorist threat in this explosive action thriller.",
            videoUrl: "https://www.w3schools.com/html/mov_bbb.mp4",
            duration: "2h 15min",
            uploadDate: "2024-01-12",
            status: "active",
            views: 210567
        }
    ];
    
    // Save default movies to localStorage
    localStorage.setItem('streamxMovies', JSON.stringify(defaultMovies));
    return defaultMovies;
}

// Global variables for carousel
let currentSlide = 0;
let slideInterval;

// Initialize App
document.addEventListener('DOMContentLoaded', () => {
    initTheme();
    initializeApp();
    hideLoadingScreen();
    setupAutoSync();
});

// Setup Auto-Sync with Admin Panel
function setupAutoSync() {
    // Listen for storage changes (auto-sync when admin adds/edits movies)
    window.addEventListener('storage', (e) => {
        if (e.key === 'streamxMovies' && e.newValue) {
            console.log('🔄 Movies updated from admin panel!');
            
            // Show sync notification
            showSyncNotification();
            
            // Reload all movie sections
            setTimeout(() => {
                loadHeroCarousel();
                loadMovies(getCurrentCategory());
                checkContinueWatching();
            }, 500);
        }
    });
    
    // Also listen for custom sync events
    window.addEventListener('moviesUpdated', () => {
        console.log('🔄 Manual sync triggered!');
        loadHeroCarousel();
        loadMovies(getCurrentCategory());
        checkContinueWatching();
    });
}

// Show Sync Notification
function showSyncNotification() {
    const notification = document.createElement('div');
    notification.className = 'sync-notification';
    notification.innerHTML = `
        <i class="fas fa-sync"></i>
        <span>Content updated from admin panel!</span>
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.classList.add('show');
    }, 100);
    
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => {
            notification.remove();
        }, 300);
    }, 3000);
}

// Get Current Category
function getCurrentCategory() {
    const activeCategory = document.querySelector('.category-item.active');
    return activeCategory ? activeCategory.dataset.category : 'all';
}

// Hide Loading Screen
function hideLoadingScreen() {
    setTimeout(() => {
        const loadingScreen = document.querySelector('.loading-screen');
        if (loadingScreen) {
            loadingScreen.classList.add('hide');
        }
    }, 1500);
}

// Theme Management
function initTheme() {
    const savedTheme = localStorage.getItem('theme') || 'dark';
    document.documentElement.setAttribute('data-theme', savedTheme);
}

// Theme Toggle
const themeToggle = document.getElementById('themeToggle');
if (themeToggle) {
    themeToggle.addEventListener('click', () => {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
    });
}

// Initialize Application
function initializeApp() {
    setupNavbar();
    setupMobileMenu();
    loadHeroCarousel();
    loadMovies('all');
    setupCategories();
    setupSearch();
    setupScrollTop();
    checkContinueWatching();
}

// Load Hero Carousel with Recent Movies
function loadHeroCarousel() {
    const heroSlider = document.getElementById('heroSlider');
    const heroNav = document.getElementById('heroNav');
    
    if (!heroSlider || !heroNav) return;
    
    // Get latest movies from storage
    const moviesData = getMoviesData();
    
    // Filter only active movies
    const activeMovies = moviesData.filter(movie => movie.status === 'active');
    
    // Sort movies by upload date and get latest 4
    const recentMovies = [...activeMovies]
        .sort((a, b) => new Date(b.uploadDate) - new Date(a.uploadDate))
        .slice(0, 4);
    
    // If no movies, show placeholder
    if (recentMovies.length === 0) {
        heroSlider.innerHTML = `
            <div class="hero-slide active">
                <div class="hero-bg">
                    <img src="https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=1920&q=80" alt="No movies">
                    <div class="hero-overlay"></div>
                </div>
                <div class="hero-content">
                    <h1 class="hero-title">NO MOVIES AVAILABLE</h1>
                    <p class="hero-description">Please add movies from the admin panel.</p>
                </div>
            </div>
        `;
        heroNav.innerHTML = '';
        return;
    }
    
    // Create slides
    heroSlider.innerHTML = recentMovies.map((movie, index) => `
        <div class="hero-slide ${index === 0 ? 'active' : ''}" data-slide="${index}">
            <div class="hero-bg">
                <img src="${movie.backdrop || movie.poster}" alt="${movie.title}">
                <div class="hero-overlay"></div>
            </div>
            <div class="hero-content">
                <span class="hero-tag">
                    <i class="fas fa-star"></i> ${movie.status === 'active' ? 'Now Streaming' : 'Coming Soon'}
                </span>
                <h1 class="hero-title">${movie.title.toUpperCase()}</h1>
                <div class="hero-info">
                    <span class="hero-rating">
                        <i class="fas fa-star"></i> ${movie.rating}
                    </span>
                    <span class="hero-year">${movie.year}</span>
                    <span class="hero-quality">${movie.quality}</span>
                    <span class="hero-audio">
                        <i class="fas fa-volume-up"></i> Dolby Atmos
                    </span>
                </div>
                <p class="hero-description">${movie.description}</p>
                <div class="hero-actions">
                    <button class="btn-play" onclick="playMovie(${movie.id})">
                        <i class="fas fa-play"></i>
                        <span>Play Now</span>
                    </button>
                    <button class="btn-info" onclick="showMovieInfo(${movie.id})">
                        <i class="fas fa-info-circle"></i>
                        <span>More Info</span>
                    </button>
                    <button class="btn-add" onclick="addToWatchlist(${movie.id})">
                        <i class="fas fa-plus"></i>
                    </button>
                </div>
            </div>
        </div>
    `).join('');
    
    // Create navigation dots
    heroNav.innerHTML = recentMovies.map((_, index) => `
        <button class="hero-nav-btn ${index === 0 ? 'active' : ''}" 
                onclick="goToSlide(${index})" data-slide="${index}"></button>
    `).join('');
    
    // Reset slide counter
    currentSlide = 0;
    
    // Restart carousel
    if (slideInterval) {
        clearInterval(slideInterval);
    }
    startCarousel();
}

// Carousel Functions
function startCarousel() {
    slideInterval = setInterval(() => {
        nextSlide();
    }, 5000); // Change slide every 5 seconds
}

function stopCarousel() {
    clearInterval(slideInterval);
}

function nextSlide() {
    const slides = document.querySelectorAll('.hero-slide');
    const totalSlides = slides.length;
    
    if (totalSlides === 0) return;
    
    // Hide current slide
    slides[currentSlide].classList.remove('active');
    const navBtns = document.querySelectorAll('.hero-nav-btn');
    if (navBtns[currentSlide]) {
        navBtns[currentSlide].classList.remove('active');
    }
    
    // Move to next slide
    currentSlide = (currentSlide + 1) % totalSlides;
    
    // Show new slide
    slides[currentSlide].classList.add('active');
    if (navBtns[currentSlide]) {
        navBtns[currentSlide].classList.add('active');
    }
}

function prevSlide() {
    const slides = document.querySelectorAll('.hero-slide');
    const totalSlides = slides.length;
    
    if (totalSlides === 0) return;
    
    // Hide current slide
    slides[currentSlide].classList.remove('active');
    const navBtns = document.querySelectorAll('.hero-nav-btn');
    if (navBtns[currentSlide]) {
        navBtns[currentSlide].classList.remove('active');
    }
    
    // Move to previous slide
    currentSlide = (currentSlide - 1 + totalSlides) % totalSlides;
    
    // Show new slide
    slides[currentSlide].classList.add('active');
    if (navBtns[currentSlide]) {
        navBtns[currentSlide].classList.add('active');
    }
    
    // Reset auto-play
    stopCarousel();
    startCarousel();
}

function goToSlide(slideIndex) {
    const slides = document.querySelectorAll('.hero-slide');
    const navBtns = document.querySelectorAll('.hero-nav-btn');
    
    // Hide current slide
    if (slides[currentSlide]) {
        slides[currentSlide].classList.remove('active');
    }
    if (navBtns[currentSlide]) {
        navBtns[currentSlide].classList.remove('active');
    }
    
    // Show selected slide
    currentSlide = slideIndex;
    if (slides[currentSlide]) {
        slides[currentSlide].classList.add('active');
    }
    if (navBtns[currentSlide]) {
        navBtns[currentSlide].classList.add('active');
    }
    
    // Reset auto-play
    stopCarousel();
    startCarousel();
}

// Show Movie Info
function showMovieInfo(movieId) {
    const moviesData = getMoviesData();
    const movie = moviesData.find(m => m.id === movieId);
    if (movie) {
        // Create a better modal instead of alert
        const modal = document.createElement('div');
        modal.className = 'movie-info-modal';
        modal.innerHTML = `
            <div class="modal-content">
                <button onclick="this.parentElement.parentElement.remove()" class="modal-close">
                    <i class="fas fa-times"></i>
                </button>
                <img src="${movie.backdrop || movie.poster}" alt="${movie.title}" class="modal-backdrop">
                <div class="modal-body">
                    <h2>${movie.title}</h2>
                    <div class="modal-meta">
                        <span>⭐ ${movie.rating}</span>
                        <span>${movie.year}</span>
                        <span>${movie.duration}</span>
                        <span>${movie.quality}</span>
                    </div>
                    <p>${movie.description}</p>
                    <div class="modal-actions">
                        <button onclick="playMovie(${movie.id}); this.parentElement.parentElement.parentElement.parentElement.remove();" class="btn-play">
                            <i class="fas fa-play"></i> Play Now
                        </button>
                        <button onclick="addToWatchlist(${movie.id})" class="btn-add-modal">
                            <i class="fas fa-plus"></i> Add to List
                        </button>
                    </div>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
        setTimeout(() => modal.classList.add('show'), 10);
    }
}

// Add to Watchlist
function addToWatchlist(movieId) {
    const moviesData = getMoviesData();
    const movie = moviesData.find(m => m.id === movieId);
    if (movie) {
        let watchlist = JSON.parse(localStorage.getItem('watchlist')) || [];
        if (!watchlist.find(m => m.id === movieId)) {
            watchlist.push(movie);
            localStorage.setItem('watchlist', JSON.stringify(watchlist));
            showNotification(`${movie.title} added to watchlist!`, 'success');
        } else {
            showNotification(`${movie.title} is already in your watchlist!`, 'info');
        }
    }
}

// Show Notification
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <i class="fas fa-${type === 'success' ? 'check-circle' : 'info-circle'}"></i>
        <span>${message}</span>
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.classList.add('show');
    }, 100);
    
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => {
            notification.remove();
        }, 300);
    }, 3000);
}

// Setup Navbar
function setupNavbar() {
    const navbar = document.getElementById('navbar');
    let lastScrollTop = 0;
    
    window.addEventListener('scroll', () => {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        
        if (scrollTop > 100) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
        
        lastScrollTop = scrollTop;
    });
    
    // Active nav link
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            navLinks.forEach(l => l.classList.remove('active'));
            this.classList.add('active');
        });
    });
}

// Setup Mobile Menu
function setupMobileMenu() {
    const mobileMenuBtn = document.getElementById('mobileMenuBtn');
    const mobileMenu = document.getElementById('mobileMenu');
    
    if (mobileMenuBtn && mobileMenu) {
        mobileMenuBtn.addEventListener('click', () => {
            mobileMenuBtn.classList.toggle('active');
            mobileMenu.classList.toggle('active');
        });
        
        const mobileLinks = mobileMenu.querySelectorAll('.mobile-menu-item');
        mobileLinks.forEach(link => {
            link.addEventListener('click', () => {
                mobileMenuBtn.classList.remove('active');
                mobileMenu.classList.remove('active');
            });
        });
    }
}

// Load Movies
function loadMovies(category = 'all') {
    const trendingContainer = document.getElementById('trendingMovies');
    const newReleasesContainer = document.getElementById('newReleases');
    
    // Get latest movies from storage
    const moviesData = getMoviesData();
    
    // Filter only active movies
    let activeMovies = moviesData.filter(movie => movie.status === 'active');
    
    // Filter by category
    let filteredMovies = category === 'all' 
        ? activeMovies 
        : activeMovies.filter(movie => movie.category === category);
    
    // Sort by different criteria for different sections
    const trendingMovies = [...filteredMovies].sort((a, b) => (b.views || 0) - (a.views || 0));
    const newReleases = [...filteredMovies].sort((a, b) => new Date(b.uploadDate) - new Date(a.uploadDate));
    
    // Load trending movies (sorted by views)
    if (trendingContainer) {
        trendingContainer.innerHTML = '';
        
        if (trendingMovies.length === 0) {
            trendingContainer.innerHTML = `
                <div style="grid-column: 1/-1; text-align: center; padding: 40px;">
                    <i class="fas fa-film" style="font-size: 48px; color: var(--text-tertiary); margin-bottom: 20px;"></i>
                    <p style="color: var(--text-secondary);">No movies available in this category</p>
                </div>
            `;
        } else {
            trendingMovies.slice(0, 6).forEach(movie => {
                trendingContainer.appendChild(createMovieCard(movie));
            });
        }
    }
    
    // Load new releases (sorted by upload date)
    if (newReleasesContainer) {
        newReleasesContainer.innerHTML = '';
        
        if (newReleases.length === 0) {
            newReleasesContainer.innerHTML = `
                <div style="grid-column: 1/-1; text-align: center; padding: 40px;">
                    <i class="fas fa-film" style="font-size: 48px; color: var(--text-tertiary); margin-bottom: 20px;"></i>
                    <p style="color: var(--text-secondary);">No new releases</p>
                </div>
            `;
        } else {
            newReleases.slice(0, 6).forEach(movie => {
                newReleasesContainer.appendChild(createMovieCard(movie));
            });
        }
    }
}

// Create Movie Card
function createMovieCard(movie) {
    const card = document.createElement('div');
    card.className = 'movie-card';
    card.innerHTML = `
        <div class="movie-poster">
            <img src="${movie.poster}" alt="${movie.title}" loading="lazy">
            <div class="movie-overlay">
                <button class="play-icon" onclick="playMovie(${movie.id})">
                    <i class="fas fa-play"></i>
                </button>
            </div>
            <span class="movie-badge">${movie.quality}</span>
        </div>
        <div class="movie-info">
            <h3 class="movie-title">${movie.title}</h3>
            <div class="movie-meta">
                <span class="movie-rating">
                    <i class="fas fa-star"></i> ${movie.rating}
                </span>
                <span>${movie.year}</span>
                <span>${movie.duration}</span>
            </div>
        </div>
    `;
    
    return card;
}

// Setup Categories
function setupCategories() {
    const categoryItems = document.querySelectorAll('.category-item');
    
    categoryItems.forEach(item => {
        item.addEventListener('click', function() {
            categoryItems.forEach(cat => cat.classList.remove('active'));
            this.classList.add('active');
            
            const category = this.dataset.category;
            loadMovies(category);
        });
    });
}

// Setup Search
function setupSearch() {
    const searchInput = document.getElementById('searchInput');
    
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            const searchTerm = e.target.value.toLowerCase();
            
            if (searchTerm.length < 2) {
                loadMovies('all');
                return;
            }
            
            // Get latest movies from storage
            const moviesData = getMoviesData();
            const activeMovies = moviesData.filter(movie => movie.status === 'active');
            
            const searchResults = activeMovies.filter(movie => 
                movie.title.toLowerCase().includes(searchTerm) ||
                movie.description.toLowerCase().includes(searchTerm) ||
                movie.category.toLowerCase().includes(searchTerm)
            );
            
            const trendingContainer = document.getElementById('trendingMovies');
            if (trendingContainer) {
                trendingContainer.innerHTML = '';
                
                if (searchResults.length === 0) {
                    trendingContainer.innerHTML = `
                        <div style="grid-column: 1/-1; text-align: center; padding: 40px;">
                            <i class="fas fa-search" style="font-size: 48px; color: var(--text-tertiary); margin-bottom: 20px;"></i>
                            <p style="color: var(--text-secondary);">No results found for "${e.target.value}"</p>
                        </div>
                    `;
                } else {
                    searchResults.forEach(movie => {
                        trendingContainer.appendChild(createMovieCard(movie));
                    });
                }
            }
        });
    }
}

// Play Movie
function playMovie(movieId) {
    const moviesData = getMoviesData();
    const movie = moviesData.find(m => m.id === movieId);
    if (!movie) return;
    
    const modal = document.getElementById('playerModal');
    const videoPlayer = document.getElementById('videoPlayer');
    const videoTitle = document.getElementById('videoTitle');
    const videoDescription = document.getElementById('videoDescription');
    
    if (modal && videoPlayer) {
        if (videoTitle) videoTitle.textContent = movie.title;
        if (videoDescription) videoDescription.textContent = movie.description;
        
        videoPlayer.src = movie.videoUrl;
        
        modal.classList.add('active');
        
        // Update view count
        updateMovieViews(movieId);
        
        // Save to watch history
        saveToWatchHistory(movie);
    }
}

// Update Movie Views
function updateMovieViews(movieId) {
    const moviesData = getMoviesData();
    const movieIndex = moviesData.findIndex(m => m.id === movieId);
    
    if (movieIndex !== -1) {
        moviesData[movieIndex].views = (moviesData[movieIndex].views || 0) + 1;
        localStorage.setItem('streamxMovies', JSON.stringify(moviesData));
    }
}

// Close Player
function closePlayer() {
    const modal = document.getElementById('playerModal');
    const videoPlayer = document.getElementById('videoPlayer');
    
    if (modal && videoPlayer) {
        videoPlayer.pause();
        modal.classList.remove('active');
    }
}

// Save to Watch History
function saveToWatchHistory(movie) {
    let watchHistory = JSON.parse(localStorage.getItem('watchHistory')) || [];
    
    watchHistory = watchHistory.filter(item => item.id !== movie.id);
    
    watchHistory.unshift({
        ...movie,
        watchedAt: Date.now(),
        progress: 0
    });
    
    watchHistory = watchHistory.slice(0, 10);
    
    localStorage.setItem('watchHistory', JSON.stringify(watchHistory));
    checkContinueWatching();
}

// Check Continue Watching
function checkContinueWatching() {
    const watchHistory = JSON.parse(localStorage.getItem('watchHistory')) || [];
    const continueSection = document.getElementById('continueSection');
    const continueContainer = document.getElementById('continueWatching');
    
    if (watchHistory.length > 0 && continueSection && continueContainer) {
        continueSection.style.display = 'block';
        continueContainer.innerHTML = '';
        
        watchHistory.forEach(movie => {
            continueContainer.appendChild(createMovieCard(movie));
        });
    }
}

// Setup Scroll to Top
function setupScrollTop() {
    const scrollTopBtn = document.getElementById('scrollTop');
    
    if (scrollTopBtn) {
        window.addEventListener('scroll', () => {
            if (window.pageYOffset > 300) {
                scrollTopBtn.classList.add('active');
            } else {
                scrollTopBtn.classList.remove('active');
            }
        });
        
        scrollTopBtn.addEventListener('click', () => {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    }
}

// Add notification and modal styles
const additionalStyles = `
<style>
/* Notification Styles */
.notification {
    position: fixed;
    top: 100px;
    right: 20px;
    padding: 15px 20px;
    background: white;
    border-radius: 10px;
    box-shadow: 0 5px 20px rgba(0,0,0,0.2);
    display: flex;
    align-items: center;
    gap: 10px;
    transform: translateX(400px);
    transition: transform 0.3s ease;
    z-index: 1000;
}

.notification.show {
    transform: translateX(0);
}

.notification-success {
    background: linear-gradient(135deg, #10b981, #059669);
    color: white;
}

.notification-info {
    background: linear-gradient(135deg, #3b82f6, #2563eb);
    color: white;
}

.notification-error {
    background: linear-gradient(135deg, #ef4444, #dc2626);
    color: white;
}

/* Sync Notification */
.sync-notification {
    position: fixed;
    top: 20px;
    left: 50%;
    transform: translateX(-50%) translateY(-100px);
    padding: 12px 24px;
    background: linear-gradient(135deg, #8b5cf6, #7c3aed);
    color: white;
    border-radius: 30px;
    box-shadow: 0 10px 30px rgba(139, 92, 246, 0.3);
    display: flex;
    align-items: center;
    gap: 10px;
    transition: transform 0.3s ease;
    z-index: 1001;
    font-weight: 500;
}

.sync-notification.show {
    transform: translateX(-50%) translateY(0);
}

.sync-notification i {
    animation: spin 1s linear infinite;
}

/* Movie Info Modal */
.movie-info-modal {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.9);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 10000;
    opacity: 0;
    transition: opacity 0.3s ease;
}

.movie-info-modal.show {
    opacity: 1;
}

.movie-info-modal .modal-content {
    position: relative;
    width: 90%;
    max-width: 800px;
    background: var(--bg-secondary);
    border-radius: 15px;
    overflow: hidden;
    transform: scale(0.9);
    transition: transform 0.3s ease;
}

.movie-info-modal.show .modal-content {
    transform: scale(1);
}

.modal-close {
    position: absolute;
    top: 20px;
    right: 20px;
    width: 40px;
    height: 40px;
    background: rgba(0, 0, 0, 0.5);
    border: none;
    border-radius: 50%;
    color: white;
    font-size: 20px;
    cursor: pointer;
    z-index: 1;
    transition: all 0.3s ease;
}

.modal-close:hover {
    background: rgba(0, 0, 0, 0.8);
    transform: rotate(90deg);
}

.modal-backdrop {
    width: 100%;
    height: 300px;
    object-fit: cover;
}

.modal-body {
    padding: 30px;
}

.modal-body h2 {
    font-size: 32px;
    margin-bottom: 15px;
}

.modal-meta {
    display: flex;
    gap: 20px;
    margin-bottom: 20px;
    font-size: 14px;
    color: var(--text-secondary);
}

.modal-meta span {
    display: flex;
    align-items: center;
    gap: 5px;
}

.modal-actions {
    display: flex;
    gap: 15px;
    margin-top: 30px;
}

.modal-actions .btn-play {
    padding: 12px 30px;
    background: linear-gradient(135deg, #3b82f6, #2563eb);
    color: white;
    border: none;
    border-radius: 25px;
    font-size: 16px;
    font-weight: 600;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 10px;
    transition: all 0.3s ease;
}

.modal-actions .btn-play:hover {
    transform: translateY(-2px);
    box-shadow: 0 10px 20px rgba(59, 130, 246, 0.3);
}

.btn-add-modal {
    padding: 12px 30px;
    background: transparent;
    color: var(--text-primary);
    border: 2px solid var(--border-color);
    border-radius: 25px;
    font-size: 16px;
    font-weight: 600;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 10px;
    transition: all 0.3s ease;
}

.btn-add-modal:hover {
    background: var(--bg-tertiary);
    transform: translateY(-2px);
}

@keyframes spin {
    to { transform: rotate(360deg); }
}
</style>
`;

document.head.insertAdjacentHTML('beforeend', additionalStyles);