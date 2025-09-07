// Check Authentication
function checkAuth() {
    try {
        const session = sessionStorage.getItem('adminSession');
        if (!session) {
            window.location.href = 'login.html';
            return null;
        }
        
        const sessionData = JSON.parse(atob(session));
        if (sessionData.expiresAt < Date.now()) {
            sessionStorage.removeItem('adminSession');
            window.location.href = 'login.html';
            return null;
        }
        
        return sessionData;
    } catch (e) {
        window.location.href = 'login.html';
        return null;
    }
}

// Shared Movies Data Management (Used by both admin and main site)
function getStoredMovies() {
    try {
        const movies = localStorage.getItem('streamxMovies');
        if (movies) {
            return JSON.parse(movies);
        }
    } catch (e) {
        console.log('Loading default movies');
    }
    
    // Default movies - same data for both admin and website
    const defaultMovies = [
        {
            id: 1,
            title: 'Quantum Universe',
            poster: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=400&q=80',
            backdrop: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=1920&q=80',
            category: 'scifi',
            rating: 9.5,
            views: 125430,
            status: 'active',
            uploadDate: '2024-01-15',
            duration: '2h 28min',
            quality: '4K HDR',
            year: 2024,
            videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4',
            description: 'A mind-bending journey through parallel dimensions where scientist Dr. Sarah Chen discovers a way to traverse between quantum realities.'
        },
        {
            id: 2,
            title: 'Dark Shadows',
            poster: 'https://images.unsplash.com/photo-1594909122845-11baa439b7bf?w=400&q=80',
            backdrop: 'https://images.unsplash.com/photo-1594909122845-11baa439b7bf?w=1920&q=80',
            category: 'horror',
            rating: 8.8,
            views: 89234,
            status: 'active',
            uploadDate: '2024-01-14',
            duration: '1h 45min',
            quality: 'HD',
            year: 2024,
            videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4',
            description: 'When darkness falls, nightmares come alive in this terrifying tale of supernatural horror.'
        },
        {
            id: 3,
            title: 'Love in Tokyo',
            poster: 'https://images.unsplash.com/photo-1542204165-65bf26472b9b?w=400&q=80',
            backdrop: 'https://images.unsplash.com/photo-1542204165-65bf26472b9b?w=1920&q=80',
            category: 'romance',
            rating: 7.9,
            views: 65123,
            status: 'active',
            uploadDate: '2024-01-13',
            duration: '2h 5min',
            quality: '4K',
            year: 2024,
            videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4',
            description: 'A beautiful love story set in modern Tokyo, where two souls find each other in the bustling city.'
        },
        {
            id: 4,
            title: 'Action Force',
            poster: 'https://images.unsplash.com/photo-1509347528160-9a9e33742cdb?w=400&q=80',
            backdrop: 'https://images.unsplash.com/photo-1509347528160-9a9e33742cdb?w=1920&q=80',
            category: 'action',
            rating: 8.5,
            views: 210567,
            status: 'active',
            uploadDate: '2024-01-12',
            duration: '2h 15min',
            quality: '4K HDR',
            year: 2024,
            videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4',
            description: 'Elite special forces unit battles against a global terrorist threat in this explosive action thriller.'
        },
        {
            id: 5,
            title: 'The Last Kingdom',
            poster: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=400&q=80',
            backdrop: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=1920&q=80',
            category: 'drama',
            rating: 9.2,
            views: 156789,
            status: 'active',
            uploadDate: '2024-01-11',
            duration: '2h 45min',
            quality: '4K HDR',
            year: 2024,
            videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4',
            description: 'An epic tale of kingdoms, betrayal, and the fight for survival in medieval times.'
        },
        {
            id: 6,
            title: 'Comedy Central',
            poster: 'https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?w=400&q=80',
            backdrop: 'https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?w=1920&q=80',
            category: 'comedy',
            rating: 8.1,
            views: 98456,
            status: 'active',
            uploadDate: '2024-01-10',
            duration: '1h 35min',
            quality: 'HD',
            year: 2024,
            videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4',
            description: 'A hilarious comedy that will keep you laughing from start to finish.'
        }
    ];
    
    // Save to localStorage (shared storage)
    localStorage.setItem('streamxMovies', JSON.stringify(defaultMovies));
    return defaultMovies;
}

// Initialize Dashboard
document.addEventListener('DOMContentLoaded', function() {
    // Check authentication
    const session = checkAuth();
    if (!session) return;
    
    // Set user info
    const userNameEl = document.getElementById('userName');
    const userRoleEl = document.getElementById('userRole');
    
    if (userNameEl) userNameEl.textContent = session.username || 'Admin';
    if (userRoleEl) userRoleEl.textContent = session.role || 'Administrator';
    
    // Initialize features
    initializeTheme();
    initializeSidebar();
    
    // Load data
    setTimeout(() => {
        updateAllStats();
        loadRecentMoviesTable(); // Load only recent 5 movies
        loadActivityFeed();
        setupLiveUpdates();
    }, 100);
    
    // Setup handlers
    setTimeout(() => {
        setupFormHandlers();
    }, 200);
    
    // Hide loading screen
    setTimeout(() => {
        const loadingScreen = document.getElementById('loadingScreen');
        if (loadingScreen) {
            loadingScreen.classList.add('hide');
            setTimeout(() => {
                loadingScreen.style.display = 'none';
            }, 500);
        }
    }, 500);
});

// Update All Statistics
function updateAllStats() {
    try {
        const movies = getStoredMovies();
        
        // Calculate stats
        const totalMovies = movies.length;
        const activeMovies = movies.filter(m => m.status === 'active').length;
        const totalViews = movies.reduce((sum, movie) => sum + (movie.views || 0), 0);
        
        // Update stats elements
        updateElement('totalMovies', totalMovies);
        updateElement('totalViews', formatNumber(totalViews));
        
        // Update sidebar counter
        updateElement('movieCount', totalMovies);
        
        // Update growth percentages (simulated)
        updateElement('movieGrowth', Math.floor(Math.random() * 20 + 10));
        updateElement('viewGrowth', Math.floor(Math.random() * 30 + 20));
        
    } catch (error) {
        console.error('Error updating stats:', error);
    }
}

// Setup Live Updates
function setupLiveUpdates() {
    // Check if tracker is available
    if (window.streamxTracker) {
        // Update every 5 seconds
        setInterval(async () => {
            const activeUsers = await window.streamxTracker.getActiveUsers();
            updateLiveUserCount(activeUsers);
        }, 5000);
    }
}

// Update Live User Count
function updateLiveUserCount(count) {
    const elements = document.querySelectorAll('[data-active-users]');
    elements.forEach(element => {
        const currentValue = parseInt(element.textContent) || 0;
        
        if (currentValue !== count) {
            element.textContent = count;
            element.classList.add('counter-update');
            
            setTimeout(() => {
                element.classList.remove('counter-update');
            }, 500);
        }
    });
}

// Helper function to update element
function updateElement(id, value) {
    const element = document.getElementById(id);
    if (element) {
        element.textContent = value;
    }
}

// Format number for display
function formatNumber(num) {
    if (!num) return '0';
    if (num >= 1000000) {
        return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
        return (num / 1000).toFixed(0) + 'K';
    }
    return num.toString();
}

// Load Recent Movies Table (Dashboard - Only 5)
function loadRecentMoviesTable() {
    try {
        const movies = getStoredMovies();
        const tbody = document.getElementById('recentMoviesTableBody');
        
        if (!tbody) return;
        
        // Get only recent 5 movies
        const recentMovies = movies
            .sort((a, b) => new Date(b.uploadDate) - new Date(a.uploadDate))
            .slice(0, 5);
        
        const tableHTML = recentMovies.map(movie => `
            <tr>
                <td>
                    <div class="movie-cell">
                        <img src="${movie.poster}" alt="${movie.title}">
                        <div>
                            <strong>${movie.title}</strong>
                            <div style="font-size: 12px; color: var(--text-secondary);">ID: #${movie.id}</div>
                        </div>
                    </div>
                </td>
                <td>${movie.category}</td>
                <td>⭐ ${movie.rating}</td>
                <td>${formatNumber(movie.views)}</td>
                <td>${new Date(movie.uploadDate).toLocaleDateString()}</td>
                <td>
                    <span class="status-badge ${movie.status}">${movie.status}</span>
                </td>
                <td>
                    <div class="action-buttons">
                        <button onclick="editMovie(${movie.id})" title="Edit">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button onclick="deleteMovie(${movie.id})" title="Delete">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `).join('');
        
        tbody.innerHTML = tableHTML;
        
    } catch (error) {
        console.error('Error loading recent movies:', error);
    }
}

// Load All Movies Table (Movies Page)
function loadAllMoviesTable(movies = null) {
    try {
        if (!movies) {
            movies = getStoredMovies();
        }
        
        const tbody = document.getElementById('allMoviesTableBody');
        
        if (!tbody) return;
        
        if (movies.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="11" style="text-align: center; padding: 40px;">
                        No movies found
                    </td>
                </tr>
            `;
            return;
        }
        
        const tableHTML = movies.map((movie, index) => `
            <tr>
                <td>#${movie.id}</td>
                <td>
                    <div class="movie-cell">
                        <img src="${movie.poster}" alt="${movie.title}">
                        <strong>${movie.title}</strong>
                    </div>
                </td>
                <td>${movie.category}</td>
                <td>${movie.year}</td>
                <td>⭐ ${movie.rating}</td>
                <td>${formatNumber(movie.views)}</td>
                <td>${movie.duration}</td>
                <td><span class="quality-badge">${movie.quality}</span></td>
                <td>${new Date(movie.uploadDate).toLocaleDateString()}</td>
                <td>
                    <span class="status-badge ${movie.status}">${movie.status}</span>
                </td>
                <td>
                    <div class="action-buttons">
                        <button onclick="editMovie(${movie.id})" title="Edit">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button onclick="deleteMovie(${movie.id})" title="Delete">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `).join('');
        
        tbody.innerHTML = tableHTML;
        
        // Update stats
        updateMoviesStats(movies);
        
    } catch (error) {
        console.error('Error loading all movies:', error);
    }
}

// Search Movies
function searchMovies() {
    const searchInput = document.getElementById('movieSearchInput');
    const searchTerm = searchInput.value.toLowerCase().trim();
    
    const movies = getStoredMovies();
    
    if (searchTerm === '') {
        loadAllMoviesTable(movies);
        document.getElementById('searchResultsCount').textContent = '-';
        document.getElementById('noResultsMessage').style.display = 'none';
        document.getElementById('allMoviesTableBody').parentElement.style.display = 'table';
        return;
    }
    
    const filteredMovies = movies.filter(movie => 
        movie.title.toLowerCase().includes(searchTerm) ||
        movie.category.toLowerCase().includes(searchTerm) ||
        movie.year.toString().includes(searchTerm) ||
        movie.description.toLowerCase().includes(searchTerm) ||
        movie.quality.toLowerCase().includes(searchTerm)
    );
    
    if (filteredMovies.length === 0) {
        document.getElementById('allMoviesTableBody').parentElement.style.display = 'none';
        document.getElementById('noResultsMessage').style.display = 'block';
        document.getElementById('searchResultsCount').textContent = '0';
    } else {
        document.getElementById('allMoviesTableBody').parentElement.style.display = 'table';
        document.getElementById('noResultsMessage').style.display = 'none';
        loadAllMoviesTable(filteredMovies);
        document.getElementById('searchResultsCount').textContent = filteredMovies.length;
    }
}

// Filter Movies by Category
function filterMoviesByCategory() {
    const categoryFilter = document.getElementById('categoryFilter');
    const selectedCategory = categoryFilter.value;
    
    const movies = getStoredMovies();
    
    if (selectedCategory === 'all') {
        loadAllMoviesTable(movies);
    } else {
        const filteredMovies = movies.filter(movie => 
            movie.category === selectedCategory
        );
        loadAllMoviesTable(filteredMovies);
    }
    
    // Clear search when filtering
    document.getElementById('movieSearchInput').value = '';
    document.getElementById('searchResultsCount').textContent = '-';
}

// Sort Movies
function sortMovies() {
    const sortFilter = document.getElementById('sortFilter');
    const sortBy = sortFilter.value;
    
    let movies = getStoredMovies();
    
    switch(sortBy) {
        case 'newest':
            movies.sort((a, b) => new Date(b.uploadDate) - new Date(a.uploadDate));
            break;
        case 'oldest':
            movies.sort((a, b) => new Date(a.uploadDate) - new Date(b.uploadDate));
            break;
        case 'rating':
            movies.sort((a, b) => b.rating - a.rating);
            break;
        case 'views':
            movies.sort((a, b) => (b.views || 0) - (a.views || 0));
            break;
        case 'title':
            movies.sort((a, b) => a.title.localeCompare(b.title));
            break;
    }
    
    loadAllMoviesTable(movies);
}

// Update Movies Stats
function updateMoviesStats(movies) {
    const totalMovies = movies.length;
    const activeMovies = movies.filter(m => m.status === 'active').length;
    const pendingMovies = movies.filter(m => m.status === 'pending').length;
    
    updateElement('totalMoviesCount', totalMovies);
    updateElement('activeMoviesCount', activeMovies);
    updateElement('pendingMoviesCount', pendingMovies);
}

// Load Activity Feed
function loadActivityFeed() {
    try {
        const activityList = document.getElementById('activityList');
        if (!activityList) return;
        
        // Get recent activities from localStorage
        const activities = JSON.parse(localStorage.getItem('adminActivities') || '[]');
        
        if (activities.length === 0) {
            // Default activities
            activities.push(
                { icon: 'plus', color: 'bg-green', action: 'System started', detail: 'Admin panel ready', time: 'Just now' }
            );
        }
        
        const activityHTML = activities.slice(0, 5).map(activity => `
            <div class="activity-item">
                <div class="activity-icon ${activity.color}">
                    <i class="fas fa-${activity.icon}"></i>
                </div>
                <div class="activity-details">
                    <p><strong>${activity.action}:</strong> ${activity.detail}</p>
                    <span class="time">${activity.time}</span>
                </div>
            </div>
        `).join('');
        
        activityList.innerHTML = activityHTML;
        
    } catch (error) {
        console.error('Error loading activity feed:', error);
    }
}

// Initialize Theme
function initializeTheme() {
    try {
        const savedTheme = localStorage.getItem('adminTheme') || 'dark';
        document.documentElement.setAttribute('data-theme', savedTheme);
        
        const themeIcon = document.getElementById('themeIcon');
        if (themeIcon) {
            themeIcon.className = savedTheme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
        }
    } catch (error) {
        console.error('Theme error:', error);
    }
}

// Initialize Sidebar
function initializeSidebar() {
    try {
        const sidebar = document.getElementById('sidebar');
        const sidebarToggle = document.getElementById('sidebarToggle');
        const navItems = document.querySelectorAll('.nav-item');
        
        // Toggle sidebar on mobile
        if (sidebarToggle && sidebar) {
            sidebarToggle.addEventListener('click', () => {
                sidebar.classList.toggle('active');
            });
        }
        
        // Handle nav item clicks
        navItems.forEach(item => {
            item.addEventListener('click', function(e) {
                e.preventDefault();
                navItems.forEach(nav => nav.classList.remove('active'));
                this.classList.add('active');
            });
        });
    } catch (error) {
        console.error('Sidebar error:', error);
    }
}

// Setup Form Handlers
function setupFormHandlers() {
    try {
        const movieForm = document.getElementById('movieForm');
        if (movieForm) {
            movieForm.addEventListener('submit', handleMovieSubmit);
        }
    } catch (error) {
        console.error('Form setup error:', error);
    }
}

// Handle Movie Submit (Auto-syncs with website)
let editingMovieId = null;

function handleMovieSubmit(e) {
    e.preventDefault();
    
    try {
        const formData = new FormData(e.target);
        const movies = getStoredMovies();
        
        if (editingMovieId) {
            // Edit existing movie
            const movieIndex = movies.findIndex(m => m.id === editingMovieId);
            if (movieIndex !== -1) {
                movies[movieIndex] = {
                    ...movies[movieIndex],
                    title: formData.get('title'),
                    category: formData.get('category'),
                    rating: parseFloat(formData.get('rating')) || 0,
                    year: parseInt(formData.get('year')),
                    duration: formData.get('duration'),
                    quality: formData.get('quality'),
                    poster: formData.get('poster'),
                    backdrop: formData.get('backdrop') || formData.get('poster'),
                    videoUrl: formData.get('videoUrl'),
                    description: formData.get('description')
                };
            }
            editingMovieId = null;
        } else {
            // Add new movie
            const newMovie = {
                id: Date.now(),
                title: formData.get('title'),
                poster: formData.get('poster'),
                backdrop: formData.get('backdrop') || formData.get('poster'),
                category: formData.get('category'),
                rating: parseFloat(formData.get('rating')) || 0,
                views: 0,
                status: 'active',
                uploadDate: new Date().toISOString(),
                year: parseInt(formData.get('year')),
                duration: formData.get('duration'),
                quality: formData.get('quality'),
                videoUrl: formData.get('videoUrl'),
                description: formData.get('description')
            };
            
            movies.push(newMovie);
        }
        
        // Save to shared localStorage (automatically syncs with website)
        localStorage.setItem('streamxMovies', JSON.stringify(movies));
        
        // Trigger storage event for immediate sync
        window.dispatchEvent(new StorageEvent('storage', {
            key: 'streamxMovies',
            newValue: JSON.stringify(movies),
            url: window.location.href
        }));
        
        closeModal();
        
        // Reload appropriate table based on current page
        const moviesContent = document.getElementById('moviesContent');
        if (moviesContent && moviesContent.style.display !== 'none') {
            loadAllMoviesTable();
        } else {
            loadRecentMoviesTable();
        }
        
        updateAllStats();
        
        // Add to activity feed
        addActivity('Movie ' + (editingMovieId ? 'updated' : 'added'), formData.get('title'));
        
        showNotification('Movie saved successfully! Website updated automatically.', 'success');
    } catch (error) {
        console.error('Error saving movie:', error);
        showNotification('Failed to save movie.', 'error');
    }
}

// Add Activity to Feed
function addActivity(action, detail) {
    try {
        let activities = JSON.parse(localStorage.getItem('adminActivities') || '[]');
        
        // Add new activity
        activities.unshift({
            icon: action.includes('added') ? 'plus' : action.includes('deleted') ? 'trash' : 'edit',
            color: action.includes('deleted') ? 'bg-red' : 'bg-green',
            action: action,
            detail: detail,
            time: 'Just now'
        });
        
        // Keep only last 10 activities
        activities = activities.slice(0, 10);
        
        // Save to localStorage
        localStorage.setItem('adminActivities', JSON.stringify(activities));
        
        // Update UI
        loadActivityFeed();
    } catch (error) {
        console.error('Error adding activity:', error);
    }
}

// Page Navigation (Updated)
function loadPage(page) {
    const pageTitle = document.getElementById('pageTitle');
    const breadcrumbCurrent = document.getElementById('breadcrumbCurrent');
    const dashboardContent = document.getElementById('dashboardContent');
    const moviesContent = document.getElementById('moviesContent');
    
    // Update title
    if (pageTitle) pageTitle.textContent = page.charAt(0).toUpperCase() + page.slice(1);
    if (breadcrumbCurrent) breadcrumbCurrent.textContent = page.charAt(0).toUpperCase() + page.slice(1);
    
    // Update nav items
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.remove('active');
        if (item.getAttribute('href') === `#${page}`) {
            item.classList.add('active');
        }
    });
    
    // Show/hide content based on page
    if (page === 'dashboard') {
        if (dashboardContent) dashboardContent.style.display = 'block';
        if (moviesContent) moviesContent.style.display = 'none';
        loadRecentMoviesTable(); // Load recent 5 movies
        updateAllStats();
        loadActivityFeed();
    } else if (page === 'movies') {
        if (dashboardContent) dashboardContent.style.display = 'none';
        if (moviesContent) moviesContent.style.display = 'block';
        loadAllMoviesTable(); // Load all movies
        updateMoviesStats(getStoredMovies());
    } else {
        showNotification(`${page} page - Coming soon!`, 'info');
    }
}

// Show Notification
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
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

// Toggle Theme
function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('adminTheme', newTheme);
    
    const themeIcon = document.getElementById('themeIcon');
    if (themeIcon) {
        themeIcon.className = newTheme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
    }
}

// Modal Functions
function showAddModal() {
    const modal = document.getElementById('addModal');
    const modalTitle = document.getElementById('modalTitle');
    const form = document.getElementById('movieForm');
    
    if (modal && modalTitle && form) {
        modalTitle.textContent = 'Add New Movie';
        form.reset();
        editingMovieId = null;
        modal.style.display = 'flex';
        modal.classList.add('active');
    }
}

function closeModal() {
    const modal = document.getElementById('addModal');
    if (modal) {
        modal.style.display = 'none';
        modal.classList.remove('active');
    }
}

// Edit Movie
function editMovie(id) {
    const movies = getStoredMovies();
    const movie = movies.find(m => m.id === id);
    
    if (!movie) return;
    
    const modal = document.getElementById('addModal');
    const modalTitle = document.getElementById('modalTitle');
    const form = document.getElementById('movieForm');
    
    if (modal && modalTitle && form) {
        modalTitle.textContent = 'Edit Movie';
        editingMovieId = id;
        
        // Fill form with movie data
        form.elements['title'].value = movie.title;
        form.elements['category'].value = movie.category;
        form.elements['rating'].value = movie.rating;
        form.elements['year'].value = movie.year || '2024';
        form.elements['duration'].value = movie.duration || '';
        form.elements['quality'].value = movie.quality || 'HD';
        form.elements['poster'].value = movie.poster || '';
        form.elements['backdrop'].value = movie.backdrop || '';
        form.elements['videoUrl'].value = movie.videoUrl || '';
        form.elements['description'].value = movie.description || '';
        
        modal.style.display = 'flex';
        modal.classList.add('active');
    }
}

// Delete Movie
let deleteMovieId = null;

function deleteMovie(id) {
    deleteMovieId = id;
    const modal = document.getElementById('deleteModal');
    if (modal) {
        modal.style.display = 'flex';
        modal.classList.add('active');
    }
}

function closeDeleteModal() {
    const modal = document.getElementById('deleteModal');
    if (modal) {
        modal.style.display = 'none';
        modal.classList.remove('active');
    }
    deleteMovieId = null;
}

function confirmDelete() {
    if (deleteMovieId) {
        try {
            let movies = getStoredMovies();
            const deletedMovie = movies.find(m => m.id === deleteMovieId);
            movies = movies.filter(m => m.id !== deleteMovieId);
            
            // Save to shared localStorage (auto-syncs with website)
            localStorage.setItem('streamxMovies', JSON.stringify(movies));
            
            // Trigger storage event for immediate sync
            window.dispatchEvent(new StorageEvent('storage', {
                key: 'streamxMovies',
                newValue: JSON.stringify(movies),
                url: window.location.href
            }));
            
            closeDeleteModal();
            
            // Reload appropriate table based on current page
            const moviesContent = document.getElementById('moviesContent');
            if (moviesContent && moviesContent.style.display !== 'none') {
                loadAllMoviesTable();
            } else {
                loadRecentMoviesTable();
            }
            
            updateAllStats();
            
            if (deletedMovie) {
                addActivity('Movie deleted', deletedMovie.title);
            }
            
            showNotification('Movie deleted successfully! Website updated.', 'success');
        } catch (error) {
            showNotification('Failed to delete movie.', 'error');
        }
    }
}

// Refresh Data
function refreshData() {
    updateAllStats();
    
    // Check which page is active and reload appropriate data
    const moviesContent = document.getElementById('moviesContent');
    if (moviesContent && moviesContent.style.display !== 'none') {
        loadAllMoviesTable();
    } else {
        loadRecentMoviesTable();
    }
    
    loadActivityFeed();
    showNotification('Data refreshed!', 'success');
    
    // Rotate refresh icon
    const refreshBtn = document.querySelector('.action-btn i.fa-sync-alt');
    if (refreshBtn) {
        refreshBtn.style.animation = 'spin 0.5s linear';
        setTimeout(() => {
            refreshBtn.style.animation = '';
        }, 500);
    }
}

// Logout
function logout() {
    if (confirm('Are you sure you want to logout?')) {
        sessionStorage.removeItem('adminSession');
        window.location.href = 'login.html';
    }
}

// Add notification and additional styles
const additionalStyles = `
<style>
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
    z-index: 2000;
}

.notification.show {
    transform: translateX(0);
}

.notification-success {
    background: linear-gradient(135deg, #10b981, #059669);
    color: white;
}

.notification-error {
    background: linear-gradient(135deg, #ef4444, #dc2626);
    color: white;
}

.notification-info {
    background: linear-gradient(135deg, #3b82f6, #2563eb);
    color: white;
}

.bg-red { 
    background: linear-gradient(135deg, #ef4444, #dc2626); 
}

.bg-green {
    background: linear-gradient(135deg, #10b981, #059669);
}

.quality-badge {
    padding: 3px 8px;
    background: linear-gradient(135deg, #3b82f6, #8b5cf6);
    color: white;
    border-radius: 12px;
    font-size: 11px;
    font-weight: 600;
}

@keyframes spin {
    to { transform: rotate(360deg); }
}
</style>
`;

document.head.insertAdjacentHTML('beforeend', additionalStyles);