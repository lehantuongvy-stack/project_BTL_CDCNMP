const Food = require('../models/Food');
const DatabaseManager = require('../database/DatabaseManager');

class DishController {
    constructor(db = null) {
        this.db = db || new DatabaseManager();
        this.foodModel = new Food(this.db);
    }

    sendResponse(res, statusCode, data) {
        res.writeHead(statusCode, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(data));
    }

}

module.exports = DishController;
