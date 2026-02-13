/**
 * User.js
 * Model representing a user in the system.
 */
export default class User {
    constructor(id, name, email, password, role = 'user', budget = 0, transactions = []) {
        this.id = id;
        this.name = name;
        this.email = email;
        this.password = password; // In a real app, this should be hashed.
        this.role = role; // 'user' or 'admin'
        this.budget = budget;
        this.transactions = transactions;
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
        return new User(
            data.id,
            data.name,
            data.email,
            data.password,
            data.role,
            data.budget,
            data.transactions
        );
    }
}
