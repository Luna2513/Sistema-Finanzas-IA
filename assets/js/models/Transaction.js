/**
 * Transaction.js
 * Model representing a financial transaction (income or expense).
 */
export default class Transaction {
    constructor(id, amount, type, category, date, description) {
        this.id = id;
        this.amount = Number(amount);
        this.type = type; // 'income' or 'expense'
        this.category = category;
        this.date = date; // ISO string 
        this.description = description;
    }

    static fromData(data) {
        return new Transaction(
            data.id,
            data.amount,
            data.type,
            data.category,
            data.date,
            data.description
        );
    }
}
