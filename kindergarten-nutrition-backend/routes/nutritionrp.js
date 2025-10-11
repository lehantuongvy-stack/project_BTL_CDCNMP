/**
 * NutritionRp Routes
 * Định nghĩa các routes cho nutrition reports
 */

const url = require('url');
const querystring = require('querystring');

class NutritionRpRoutes {
    constructor(db) {
        this.db = db;
        this.NutritionReportController = require("../controllers/NutritionrpController");
        this.controller = new this.NutritionReportController(db);
    }

    // Xử lý các nutrition report routes
    async handleNutritionRpRoutes(req, res, path, method) {
        try {
            // Parse request body cho POST/PUT requests
            if (['POST', 'PUT'].includes(method)) {
                req.body = await this.parseRequestBody(req);
            }

            // Route mapping
            switch (true) {
                case path === '' && method === 'GET':
                case path === '/' && method === 'GET':
                    await this.controller.getAllReports(req, res);
                    break;

                case path === '' && method === 'POST':
                case path === '/' && method === 'POST':
                    await this.controller.createReport(req, res);
                    break;

                case path === '/search' && method === 'GET':
                    await this.controller.searchReports(req, res);
                    break;

                case path.match(/^\/[^\/]+$/) && method === 'GET':
                    const getId = path.substring(1);
                    req.params = { id: getId };
                    await this.controller.getReportById(req, res);
                    break;

                case path.match(/^\/[^\/]+$/) && method === 'PUT':
                    const updateId = path.substring(1);
                    req.params = { id: updateId };
                    await this.controller.updateReport(req, res);
                    break;

                case path.match(/^\/[^\/]+$/) && method === 'DELETE':
                    const deleteId = path.substring(1);
                    req.params = { id: deleteId };
                    await this.controller.deleteReport(req, res);
                    break;

                default:
                    this.sendResponse(res, 404, {
                        success: false,
                        message: 'Nutrition report API route not found',
                        attempted_route: `${method} /api/nutritionrp${path}`
                    });
                    break;
            }
        } catch (error) {
            console.error('NutritionRp Routes Error:', error);
            this.sendResponse(res, 500, {
                success: false,
                message: 'Internal server error in nutrition reports',
                error: error.message
            });
        }
    }

    // Helper methods
    sendResponse(res, statusCode, data) {
        res.writeHead(statusCode, { 
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization'
        });
        res.end(JSON.stringify(data));
    }

    // Parse request body
    async parseRequestBody(req) {
        return new Promise((resolve, reject) => {
            let body = '';
            req.on('data', chunk => {
                body += chunk.toString();
            });
            req.on('end', () => {
                try {
                    resolve(body ? JSON.parse(body) : {});
                } catch (error) {
                    console.error('Body parsing error:', error);
                    resolve({});
                }
            });
            req.on('error', reject);
        });
    }
}

module.exports = NutritionRpRoutes;
