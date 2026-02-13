import auth from '../core/Auth.js';
import storage from '../core/Storage.js';
import Transaction from '../models/Transaction.js';
import User from '../models/User.js';

/**
 * DashboardController.js
 * Manages the main application logic for both Users and Admins.
 */
class DashboardController {
    constructor() {
        this.user = null;
        this.charts = {}; // Store chart instances to destroy/update
        this.init();
    }

    init() {
        // 1. Auth Check
        if (!auth.isAuthenticated()) {
            window.location.href = 'index.html';
            return;
        }

        this.user = auth.currentUser;

        // 2. Setup UI
        this.setupUserInfo();
        this.setupNavigation();
        this.setupEventListeners();

        // 3. Render View based on Role
        this.renderView();
    }

    setupUserInfo() {
        document.getElementById('userName').textContent = this.user.name;
        document.getElementById('userEmail').textContent = this.user.email;
        document.getElementById('userInitial').textContent = this.user.name.charAt(0).toUpperCase();

        const welcomeName = document.getElementById('welcomeName');
        if (welcomeName) welcomeName.textContent = this.user.name;

        // Show Admin Nav if applicable
        if (auth.isAdmin()) {
            document.getElementById('nav-users').classList.remove('hidden');
            document.getElementById('nav-users').classList.add('flex');
        }
    }

    setupNavigation() {
        // Simple View Switcher
        const navDashboard = document.getElementById('nav-dashboard');
        const navTransactions = document.getElementById('nav-transactions');
        const navUsers = document.getElementById('nav-users');

        navDashboard.addEventListener('click', (e) => {
            e.preventDefault();
            this.switchView('dashboard');
        });

        navTransactions.addEventListener('click', (e) => {
            e.preventDefault();
            // detailed transaction view is simplified into dashboard for this prototype
            this.switchView('dashboard');
        });

        if (navUsers) {
            navUsers.addEventListener('click', (e) => {
                e.preventDefault();
                this.switchView('admin');
            });
        }
    }

    switchView(viewName) {
        const dashboardView = document.getElementById('view-dashboard');
        const adminView = document.getElementById('view-admin');

        if (viewName === 'dashboard') {
            dashboardView.classList.remove('hidden');
            adminView.classList.add('hidden');
            this.loadUserDashboard();
        } else if (viewName === 'admin') {
            if (!auth.isAdmin()) return; // Protection
            dashboardView.classList.add('hidden');
            adminView.classList.remove('hidden');
            this.loadAdminDashboard();
        }
    }

    renderView() {
        const urlParams = new URLSearchParams(window.location.search);
        const view = urlParams.get('view');

        if (view === 'admin' && auth.isAdmin()) {
            this.switchView('admin');
        } else {
            this.switchView('dashboard');
        }
    }

    setupEventListeners() {
        // Logout
        document.getElementById('logoutBtn').addEventListener('click', () => {
            auth.logout();
        });

        // Modals
        this.setupModal('transactionModal', 'addTransactionBtn', 'closeModalBtn');
        this.setupModal('budgetModal', 'setBudgetBtn', 'closeBudgetModalBtn'); // Assuming you add a budget button later or reuse logic

        // Budget Button trigger (Manual binding since ID might be dynamic or hidden)
        const checkBudgetBtn = document.getElementById('setBudgetBtn');
        if (checkBudgetBtn) {
            checkBudgetBtn.addEventListener('click', () => {
                document.getElementById('budgetModal').classList.remove('hidden');
                document.getElementById('budgetInput').value = this.user.budget || 0;
            });
        }

        // Forms
        document.getElementById('transactionForm').addEventListener('submit', (e) => this.handleTransactionSubmit(e));
        document.getElementById('budgetForm').addEventListener('submit', (e) => this.handleBudgetSubmit(e));
    }

    setupModal(modalId, openBtnId, closeBtnId) {
        const modal = document.getElementById(modalId);
        const openBtn = document.getElementById(openBtnId);
        const closeBtn = document.getElementById(closeBtnId);

        if (openBtn) {
            openBtn.addEventListener('click', () => {
                modal.classList.remove('hidden');
            });
        }

        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                modal.classList.add('hidden');
            });
        }

        // Close on click outside
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.classList.add('hidden');
            }
        });
    }

    // --- Logic: User Dashboard ---

    loadUserDashboard() {
        // Refresh User Data (in case it changed elsewhere) (simulated since it's same session)
        const balance = this.user.getBalance();

        // Calculate Totals
        const income = this.user.transactions
            .filter(t => t.type === 'income')
            .reduce((acc, t) => acc + t.amount, 0);

        const expense = this.user.transactions
            .filter(t => t.type === 'expense')
            .reduce((acc, t) => acc + t.amount, 0);

        // Update Stats
        this.animateValue('totalBalance', balance);
        this.animateValue('totalIncome', income);
        this.animateValue('totalExpense', expense);

        // Update Budget UI
        this.updateBudgetUI(expense);

        // Render Table
        this.renderTransactionTable();
    }

    animateValue(elementId, value) {
        const el = document.getElementById(elementId);
        if (!el) return;
        el.textContent = `$${value.toFixed(2)}`;
        // Simple animation could be added here
    }

    updateBudgetUI(totalExpense) {
        const budgetDisplay = document.getElementById('budgetDisplay');
        const currentExpenseDisplay = document.getElementById('currentExpenseDisplay');
        const progressBar = document.getElementById('budgetProgressBar');
        const statusText = document.getElementById('budgetStatus');

        if (!budgetDisplay) return;

        const budget = this.user.budget || 0;
        budgetDisplay.textContent = `$${budget.toFixed(2)}`;
        currentExpenseDisplay.textContent = `$${totalExpense.toFixed(2)}`;

        if (budget > 0) {
            const percentage = Math.min((totalExpense / budget) * 100, 100);
            progressBar.style.width = `${percentage}%`;

            if (percentage >= 100) {
                progressBar.classList.remove('bg-indigo-600', 'bg-yellow-400');
                progressBar.classList.add('bg-red-600');
                statusText.textContent = '¡Has excedido tu presupuesto mensual!';
                statusText.classList.add('text-red-600', 'font-bold');
            } else if (percentage >= 80) {
                progressBar.classList.remove('bg-indigo-600', 'bg-red-600');
                progressBar.classList.add('bg-yellow-400');
                statusText.textContent = `Has gastado el ${percentage.toFixed(0)}% de tu presupuesto.`;
                statusText.classList.remove('text-red-600', 'font-bold');
            } else {
                progressBar.classList.remove('bg-red-600', 'bg-yellow-400');
                progressBar.classList.add('bg-indigo-600');
                statusText.textContent = `Has gastado el ${percentage.toFixed(0)}% de tu presupuesto.`;
                statusText.classList.remove('text-red-600', 'font-bold');
            }
        } else {
            progressBar.style.width = '0%';
            statusText.textContent = 'Define un presupuesto para monitorear tus gastos.';
        }
    }

    renderTransactionTable() {
        const tbody = document.getElementById('recentTransactionsTable');
        if (!tbody) return;

        tbody.innerHTML = '';

        // Sort by date desc
        const sortedTransactions = [...this.user.transactions].sort((a, b) => new Date(b.date) - new Date(a.date));

        if (sortedTransactions.length === 0) {
            tbody.innerHTML = '<tr><td colspan="4" class="px-6 py-4 text-center text-gray-400">No hay transacciones recientes.</td></tr>';
            return;
        }

        sortedTransactions.forEach(t => {
            const tr = document.createElement('tr');
            tr.className = 'hover:bg-gray-50 transition';

            const isIncome = t.type === 'income';
            const colorClass = isIncome ? 'text-green-600' : 'text-red-600';
            const sign = isIncome ? '+' : '-';

            tr.innerHTML = `
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">${t.description}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${isIncome ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}">
                        ${t.category}
                    </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${new Date(t.date).toLocaleDateString()}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm font-bold text-right ${colorClass}">
                    ${sign}$${t.amount.toFixed(2)}
                </td>
            `;
            tbody.appendChild(tr);
        });
    }

    handleTransactionSubmit(e) {
        e.preventDefault();
        const formData = new FormData(e.target);

        const transaction = new Transaction(
            Date.now(),
            parseFloat(formData.get('amount')),
            formData.get('type'),
            formData.get('category'),
            formData.get('date'),
            formData.get('description')
        );

        this.user.addTransaction(transaction);
        auth.updateUser(this.user); // Persist

        // Reset and close
        e.target.reset();
        document.getElementById('transactionModal').classList.add('hidden');

        this.loadUserDashboard(); // Refresh UI
    }

    handleBudgetSubmit(e) {
        e.preventDefault();
        const input = document.getElementById('budgetInput');
        const amount = parseFloat(input.value);

        if (!isNaN(amount) && amount >= 0) {
            this.user.setBudget(amount);
            auth.updateUser(this.user);

            document.getElementById('budgetModal').classList.add('hidden');
            this.loadUserDashboard();
        }
    }

    // --- Logic: Admin Dashboard ---

    loadAdminDashboard() {
        const tbody = document.getElementById('usersTable');
        if (!tbody) return;
        tbody.innerHTML = '';

        // Get all users from storage (re-read to ensure fresh data)
        const allUsersData = storage.get(auth.usersKey) || [];

        // Stats Variables
        let totalSystemBalance = 0;
        let budgetAlertsCount = 0;

        allUsersData.forEach(userData => {
            const u = User.fromData(userData);
            const balance = u.getBalance();

            // Stats Accumulation
            totalSystemBalance += balance;

            const tr = document.createElement('tr');
            tr.className = 'hover:bg-gray-50';

            const balanceColor = balance >= 0 ? 'text-green-600' : 'text-red-600';

            let statusBadge = '<span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">Activo</span>';

            // Check over-budget
            if (u.role === 'user' && u.budget > 0) {
                const expense = u.transactions.filter(t => t.type === 'expense').reduce((acc, t) => acc + t.amount, 0);
                if (expense > u.budget) {
                    budgetAlertsCount++; // Stats
                    statusBadge = '<span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">Sobrepresupuesto</span>';
                }
            }

            tr.innerHTML = `
                <td class="px-6 py-4 whitespace-nowrap">
                    <div class="flex items-center">
                        <div class="flex-shrink-0 h-10 w-10">
                            <div class="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold">
                                ${u.name.charAt(0).toUpperCase()}
                            </div>
                        </div>
                        <div class="ml-4">
                            <div class="text-sm font-medium text-gray-900">${u.name} ${u.role === 'admin' ? '(Admin)' : ''}</div>
                        </div>
                    </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${u.email}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm font-bold ${balanceColor}">$${balance.toFixed(2)}</td>
                <td class="px-6 py-4 whitespace-nowrap">
                    ${statusBadge}
                </td>
            `;
            tbody.appendChild(tr);
        });

        // Update Stats UI
        const adminTotalUsers = document.getElementById('adminTotalUsers');
        if (adminTotalUsers) adminTotalUsers.textContent = allUsersData.length;

        const adminSystemBalance = document.getElementById('adminSystemBalance');
        if (adminSystemBalance) adminSystemBalance.textContent = `$${totalSystemBalance.toFixed(2)}`;

        const adminBudgetAlerts = document.getElementById('adminBudgetAlerts');
        if (adminBudgetAlerts) adminBudgetAlerts.textContent = budgetAlertsCount;
    }
}

// Initialize
new DashboardController();
