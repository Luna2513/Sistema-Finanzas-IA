import Transaction from './Transaction.js';

/**
 * User.js
 * Model representing a user in the system.
 */
export default class User {
    constructor(id, name, email, password, role = 'user', budget = 0, transactions = [], categories = []) {
        this.id = id;
        this.name = name;
        this.email = email;
        this.password = password; // In a real app, this should be hashed.
        this.role = role; // 'user' or 'admin'
        this.budget = budget;
        this.transactions = transactions;
        this.categories = categories.length > 0 ? categories : [
            'Salario', 'Alimentación', 'Transporte', 'Servicios', 'Entretenimiento', 'Otros'
        ];
    }

    /**
     * Calculates the current balance from transactions.
     * @returns {number}
     */
    getBalance() {
        return this.transactions.reduce((acc, output) => {
            return output.type === 'income' ? acc + output.amount : acc - output.amount;
        }, 0);
    }

    /**
     * Adds a transaction to the user's history.
     * @param {Transaction} transaction 
     */
    addTransaction(transaction) {
        this.transactions.push(transaction);
    }

    /**
     * Adds a custom category.
     * @param {string} category 
     */
    addCategory(category) {
        if (!this.categories.includes(category)) {
            this.categories.push(category);
        }
    }

    /**
     * Sets the monthly budget.
     * @param {number} amount 
     */
    setBudget(amount) {
        this.budget = amount;
    }

    /**
     * Create a User instance from a plain object.
     * @param {Object} data 
     * @returns {User}
     */
    static fromData(data) {
        // Fix: Rehydrate transactions properly
        // Converting plain objects back to Transaction instances ensuring amounts are numbers
        const transactions = (data.transactions || []).map(t => {
            // If it's already an instance (rare but possible in some flows), return it.
            // Otherwise, hydrate it.
            return new Transaction(
                t.id,
                t.amount,
                t.type,
                t.category,
                t.date,
                t.description
            );
        });

        return new User(
            data.id,
            data.name,
            data.email,
            data.password,
            data.role,
            data.budget,
            transactions,
            data.categories // Rehydrate categories
        );
    }
}
