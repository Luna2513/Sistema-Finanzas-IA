/**
 * Storage.js
 * Encapsulates localStorage operations to provide clean data access.
 */
class Storage {
    constructor() {
        if (!window.localStorage) {
            console.error('LocalStorage is not supported by your browser.');
            return;
        }
    }

    /**
     * Save data to localStorage
     * @param {string} key 
     * @param {any} data 
     */
    save(key, data) {
        try {
            const serializedData = JSON.stringify(data);
            localStorage.setItem(key, serializedData);
        } catch (error) {
            console.error('Error saving to localStorage', error);
        }
    }

    /**
     * Retrieve data from localStorage
     * @param {string} key 
     * @returns {any} stored data
     */
    get(key) {
        try {
            const serializedData = localStorage.getItem(key);
            if (!serializedData) return null;
            return JSON.parse(serializedData);
        } catch (error) {
            console.error('Error reading from localStorage', error);
            return null;
        }
    }

    /**
     * Remove item from localStorage
     * @param {string} key 
     */
    remove(key) {
        localStorage.removeItem(key);
    }

    /**
     * Clear all localStorage
     */
    clear() {
        localStorage.clear();
    }
}

// Export a singleton instance
const storage = new Storage();
export default storage;
