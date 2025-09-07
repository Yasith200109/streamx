// Admin Credentials
const ADMIN_ACCOUNTS = [
    {
        username: 'admin',
        password: 'StreamX@2024',
        role: 'Super Admin'
    },
    {
        username: 'manager',
        password: 'Manager@123',
        role: 'Manager'
    },
    {
        username: 'demo',
        password: 'demo123',
        role: 'Demo User'
    }
];

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    setupLoginForm();
    checkRemembered();
});

// Setup Login Form
function setupLoginForm() {
    const form = document.getElementById('loginForm');
    const toggleBtn = document.getElementById('togglePassword');
    
    // Toggle password visibility
    toggleBtn?.addEventListener('click', () => {
        const passwordInput = document.getElementById('password');
        const icon = toggleBtn.querySelector('i');
        
        if (passwordInput.type === 'password') {
            passwordInput.type = 'text';
            icon.className = 'fas fa-eye-slash';
        } else {
            passwordInput.type = 'password';
            icon.className = 'fas fa-eye';
        }
    });
    
    // Form submission
    form?.addEventListener('submit', handleLogin);
}

// Handle Login
async function handleLogin(e) {
    e.preventDefault();
    
    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value;
    const remember = document.getElementById('remember').checked;
    const errorMsg = document.getElementById('errorMsg');
    const btnText = document.getElementById('btnText');
    const btnLoader = document.getElementById('btnLoader');
    const loginBtn = document.querySelector('.login-btn');
    
    // Reset error
    errorMsg.classList.remove('show');
    errorMsg.textContent = '';
    
    // Show loading
    btnText.style.display = 'none';
    btnLoader.style.display = 'inline-block';
    loginBtn.disabled = true;
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Validate credentials
    const user = ADMIN_ACCOUNTS.find(account => 
        account.username === username && account.password === password
    );
    
    if (user) {
        // Success
        if (remember) {
            localStorage.setItem('rememberedUser', username);
        } else {
            localStorage.removeItem('rememberedUser');
        }
        
        // Create session
        const session = {
            username: user.username,
            role: user.role,
            loginTime: Date.now(),
            expiresAt: Date.now() + (30 * 60 * 1000) // 30 minutes
        };
        
        sessionStorage.setItem('adminSession', btoa(JSON.stringify(session)));
        
        // Show success message
        errorMsg.textContent = 'Login successful! Redirecting...';
        errorMsg.style.background = 'rgba(16, 185, 129, 0.1)';
        errorMsg.style.borderColor = 'rgba(16, 185, 129, 0.3)';
        errorMsg.style.color = '#10b981';
        errorMsg.classList.add('show');
        
        // Redirect to admin dashboard
        setTimeout(() => {
            window.location.href = 'admin-dashboard.html';
        }, 1000);
    } else {
        // Error
        errorMsg.textContent = 'Invalid username or password!';
        errorMsg.classList.add('show');
        
        // Reset button
        btnText.style.display = 'inline';
        btnLoader.style.display = 'none';
        loginBtn.disabled = false;
    }
}

// Check Remembered User
function checkRemembered() {
    const remembered = localStorage.getItem('rememberedUser');
    if (remembered) {
        document.getElementById('username').value = remembered;
        document.getElementById('remember').checked = true;
    }
}