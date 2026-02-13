import storage from './Storage.js';
import User from '../models/User.js';

/**
 * Auth.js
 * Manages user authentication and session state.
 */
class Auth {
    constructor() {
        this.currentUser = null;
        this.usersKey = 'finanzas_users';
        this.sessionKey = 'finanzas_session';
        this.initialize();
    }

    initialize() {
        // Load users from storage or create default admin
        let usersData = storage.get(this.usersKey);
        if (!usersData) {
            // Seed Admin
            const admin = new User(1, 'Admin', 'admin@finanzas.com', 'admin123', 'admin');
            this.users = [admin];
            this.saveUsers();
        } else {
            this.users = usersData.map(u => User.fromData(u));
        }

        // Check for active session
        const sessionUser = storage.get(this.sessionKey);
        if (sessionUser) {
            this.currentUser = User.fromData(sessionUser);
        }
    }

    saveUsers() {
        storage.save(this.usersKey, this.users);
    }

    /**
     * Register a new user
     * @param {string} name 
     * @param {string} email 
     * @param {string} password 
     * @returns {boolean} success
     */
    register(name, email, password) {
        if (this.users.some(u => u.email === email)) {
            return { success: false, message: 'El correo ya está registrado.' };
        }

        const newUser = new User(
            Date.now(), // Simple ID generation
            name,
            email,
            password
        );
        this.users.push(newUser);
        this.saveUsers();
        return { success: true, message: 'Registro exitoso.' };
    }

    /**
     * Login user
     * @param {string} email 
     * @param {string} password 
     * @returns {Object} result
     */
    login(email, password) {
        const user = this.users.find(u => u.email === email && u.password === password);
        if (user) {
            this.currentUser = user;
            storage.save(this.sessionKey, user);
            return { success: true, user: user };
        }
        return { success: false, message: 'Credenciales inválidas.' };
    }

    /**
     * Logout user
     */
    logout() {
        this.currentUser = null;
        storage.remove(this.sessionKey);
        window.location.href = 'index.html';
    }

    /**
     * Update current user data (e.g. after adding transaction)
     * @param {User} user 
     */
    updateUser(user) {
        const index = this.users.findIndex(u => u.id === user.id);
        if (index !== -1) {
            this.users[index] = user;
            this.saveUsers();

            // Update session if it's the current user
            if (this.currentUser && this.currentUser.id === user.id) {
                this.currentUser = user;
                storage.save(this.sessionKey, user);
            }
        }
    }

    isAuthenticated() {
        return !!this.currentUser;
    }

    isAdmin() {
        return this.currentUser && this.currentUser.role === 'admin';
    }
}

const auth = new Auth();
export default auth;
