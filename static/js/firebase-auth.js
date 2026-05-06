/**
 * Electionant - Firebase Authentication Integration
 * Handles Sign In, Register, and Google Auth.
 */

// Firebase Configuration (Placeholder - User must replace with their own)
const firebaseConfig = {
    apiKey: "AIzaSyDV-5sqapxGITYYnfbPo5ilJsBVBR-scOU",
    authDomain: "electionant.firebaseapp.com",
    projectId: "electionant",
    storageBucket: "electionant.firebasestorage.app",
    messagingSenderId: "186840309640",
    appId: "1:186840309640:web:211407f01c5639aeb0a43d",
    measurementId: "G-2FSXHBSTJ9"
};

// Initialize Firebase
if (firebaseConfig.apiKey !== "YOUR_API_KEY") {
    try {
        firebase.initializeApp(firebaseConfig);
    } catch (e) {
        console.error("Firebase Init Error:", e);
    }
}

let auth;

document.addEventListener('DOMContentLoaded', () => {
    console.log("🗳️ Electionant Auth: Initializing...");
    
    try {
        auth = firebase.auth();
    } catch (e) {
        console.error("Firebase Auth initialization failed:", e);
        return;
    }

    // State management
    const state = {
        authenticated: false,
        user: null
    };

    const authModal = document.getElementById('auth-modal');
    const authBtn = document.getElementById('auth-btn');
    const closeAuthBtn = document.getElementById('close-auth-modal');
    const authForm = document.getElementById('auth-form');
    const tabLogin = document.getElementById('tab-login');
    const tabRegister = document.getElementById('tab-register');
    const nameGroup = document.getElementById('name-group');
    const authTitle = document.getElementById('auth-title');
    const authSubtitle = document.getElementById('auth-subtitle');
    const authSubmitBtn = document.getElementById('auth-submit-btn');
    const googleBtn = document.getElementById('google-signin-btn');

    let isLogin = true;

    // --- Modal Control Functions ---
    window.openAuthModal = (mode = 'login') => {
        if (!authModal) return;
        authModal.classList.add('active');
        if (mode === 'register') {
            switchToRegister();
        } else {
            switchToLogin();
        }
    };

    window.closeAuthModal = () => {
        if (authModal) authModal.classList.remove('active');
    };

    // Toggle Modal via Main Button
    if (authBtn) {
        authBtn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation(); // Prevent other scripts from interfering
            
            // Check if already logged in by checking state or button text
            if (state.authenticated || authBtn.textContent.includes('Logout')) {
                handleLogout();
            } else {
                window.openAuthModal('login');
            }
        });
    }

    if (closeAuthBtn) {
        closeAuthBtn.onclick = (e) => {
            e.preventDefault();
            window.closeAuthModal();
        };
    }

    window.onclick = (event) => {
        if (event.target == authModal) authModal.classList.remove('active');
    };

    // Toggle Tabs Logic
    function switchToLogin() {
        isLogin = true;
        tabLogin.classList.add('active');
        tabRegister.classList.remove('active');
        nameGroup.style.display = 'none';
        authTitle.textContent = 'Welcome Back';
        authSubtitle.textContent = 'Sign in to access personalized election insights';
        authSubmitBtn.textContent = 'Sign In';
    }

    function switchToRegister() {
        isLogin = false;
        tabRegister.classList.add('active');
        tabLogin.classList.remove('active');
        nameGroup.style.display = 'block';
        authTitle.textContent = 'Create Account';
        authSubtitle.textContent = 'Join Electionant to stay informed and engaged';
        authSubmitBtn.textContent = 'Register Now';
    }

    tabLogin.onclick = (e) => { e.preventDefault(); switchToLogin(); };
    tabRegister.onclick = (e) => { e.preventDefault(); switchToRegister(); };

    // Handle Form Submit
    authForm.onsubmit = async (e) => {
        e.preventDefault();
        const email = document.getElementById('auth-email').value;
        const password = document.getElementById('auth-password').value;
        const name = document.getElementById('auth-name').value;

        if (firebaseConfig.apiKey === "YOUR_API_KEY") {
            window.showToast("Firebase API Key is missing. Please configure it.", "error");
            return;
        }

        try {
            authSubmitBtn.disabled = true;
            authSubmitBtn.innerHTML = '<span class="loader-spinner-sm"></span> Processing...';

            let userCredential;
            if (isLogin) {
                userCredential = await auth.signInWithEmailAndPassword(email, password);
                window.showToast("Successfully signed in!", "success");
            } else {
                userCredential = await auth.createUserWithEmailAndPassword(email, password);
                if (name) {
                    await userCredential.user.updateProfile({ displayName: name });
                }
                window.showToast("Account created successfully!", "success");
            }

            const token = await userCredential.user.getIdToken();
            await syncWithBackend(token);
            authModal.classList.remove('active');
            location.reload(); // Refresh to update UI state
        } catch (error) {
            console.error("Auth Error:", error);
            window.showToast(error.message, "error");
        } finally {
            authSubmitBtn.disabled = false;
            authSubmitBtn.textContent = isLogin ? 'Sign In' : 'Register Now';
        }
    };

    // Google Sign In
    if (googleBtn) {
        googleBtn.onclick = async () => {
            if (firebaseConfig.apiKey === "YOUR_API_KEY") {
                window.showToast("Firebase API Key is missing. Please configure it.", "error");
                return;
            }

            const provider = new firebase.auth.GoogleAuthProvider();
            try {
                const result = await auth.signInWithPopup(provider);
                const token = await result.user.getIdToken();
                await syncWithBackend(token);
                window.showToast("Signed in with Google!", "success");
                authModal.classList.remove('active');
                location.reload();
            } catch (error) {
                console.error("Google Auth Error:", error);
                window.showToast(error.message, "error");
            }
        };
    }

    // Sync Token with Flask Backend
    async function syncWithBackend(token) {
        try {
            const csrfMeta = document.querySelector('meta[name="csrf-token"]');
            const csrfToken = csrfMeta ? csrfMeta.content : '';
            
            const response = await fetch('/api/auth/firebase', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': csrfToken
                },
                body: JSON.stringify({ token })
            });
            return await response.json();
        } catch (error) {
            console.error("Backend Sync Error:", error);
        }
    }

    // Handle Logout
    async function handleLogout() {
        try {
            await auth.signOut();
            window.location.href = '/auth/logout';
        } catch (error) {
            console.error("Logout Error:", error);
        }
    }

    // --- NEW: UI Update and Initial Check ---

    function updateAuthUI(isAuthenticated) {
        if (!authBtn) return;
        
        if (isAuthenticated && state.user) {
            authBtn.innerHTML = `<img src="${state.user.picture}" alt="" class="user-pic" style="width:24px; height:24px; border-radius:50%; margin-right:8px; vertical-align:middle;"> Logout`;
        } else {
            authBtn.innerHTML = `<i data-lucide="log-in" style="width:16px; height:16px; margin-right:8px;"></i> Sign In`;
        }
        if (window.lucide) lucide.createIcons();
    }

    async function checkAuthStatus() {
        try {
            const response = await fetch('/auth/status');
            const data = await response.json();
            
            if (data.authenticated) {
                state.authenticated = true;
                state.user = data.user;
                updateAuthUI(true);
            } else {
                state.authenticated = false;
                state.user = null;
                updateAuthUI(false);
            }
        } catch (error) {
            console.error('Auth check failed:', error);
        }
    }

    // Listen for Firebase Auth changes
    if (auth) {
        auth.onAuthStateChanged(async (firebaseUser) => {
            if (firebaseUser) {
                const token = await firebaseUser.getIdToken();
                await syncWithBackend(token);
            }
        });
    }

    // Run initial check
    checkAuthStatus();
    console.log("✅ Electionant Auth: Ready");
});
