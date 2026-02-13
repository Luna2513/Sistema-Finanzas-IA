import auth from '../core/Auth.js';

/**
 * LoginController.js
 * Handles login and registration interactions.
 */
class LoginController {
    constructor() {
        this.isLoginMode = true;

        // DOM Elements
        this.form = document.getElementById('authForm');
        this.nameGroup = document.getElementById('nameGroup');
        this.nameInput = document.getElementById('name');
        this.emailInput = document.getElementById('email');
        this.passwordInput = document.getElementById('password'); // Fixed bug: referenced name instead of password
        this.formTitle = document.getElementById('formTitle');
        this.formSubtitle = document.getElementById('formSubtitle');
        this.submitBtnText = document.getElementById('submitBtnText');
        this.toggleText = document.getElementById('toggleText');
        this.toggleBtn = document.getElementById('toggleAuthMode');
        this.feedback = document.getElementById('feedback');

        this.init();
    }

    init() {
        // Redirect if already logged in
        if (auth.isAuthenticated()) {
            this.redirectUser();
        }

        this.form.addEventListener('submit', (e) => this.handleSubmit(e));
        this.toggleBtn.addEventListener('click', () => this.toggleMode());
    }

    toggleMode() {
        this.isLoginMode = !this.isLoginMode;
        this.feedback.classList.add('hidden');

        if (this.isLoginMode) {
            this.nameGroup.classList.add('hidden');
            this.nameInput.removeAttribute('required');
            this.formTitle.textContent = 'Bienvenido de nuevo';
            this.formSubtitle.textContent = 'Ingresa tus credenciales para acceder a tu cuenta.';
            this.submitBtnText.textContent = 'Iniciar Sesión';
            this.toggleText.textContent = '¿No tienes una cuenta?';
            this.toggleBtn.textContent = 'Regístrate aquí';
        } else {
            this.nameGroup.classList.remove('hidden');
            this.nameInput.setAttribute('required', 'true');
            this.formTitle.textContent = 'Crear cuenta';
            this.formSubtitle.textContent = 'Registra tus datos para comenzar.';
            this.submitBtnText.textContent = 'Registrarme';
            this.toggleText.textContent = '¿Ya tienes una cuenta?';
            this.toggleBtn.textContent = 'Inicia Sesión';
        }
    }

    handleSubmit(e) {
        e.preventDefault();
        this.feedback.classList.add('hidden');

        const email = this.emailInput.value;
        const password = this.passwordInput.value;

        if (this.isLoginMode) {
            const result = auth.login(email, password);
            if (result.success) {
                this.redirectUser();
            } else {
                this.showError(result.message);
            }
        } else {
            const name = this.nameInput.value;
            const result = auth.register(name, email, password);
            if (result.success) {
                alert('Registro exitoso. Por favor inicia sesión.');
                this.toggleMode();
            } else {
                this.showError(result.message);
            }
        }
    }

    showError(message) {
        this.feedback.textContent = message;
        this.feedback.classList.remove('hidden');
    }

    redirectUser() {
        if (auth.isAdmin()) {
            window.location.href = 'dashboard.html?view=admin';
        } else {
            window.location.href = 'dashboard.html';
        }
    }
}

// Initialize controller
new LoginController();
