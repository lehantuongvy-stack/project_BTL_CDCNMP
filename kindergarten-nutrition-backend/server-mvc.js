/**
 * Kindergarten Nutrition Management Server - MVC Architecture
 * Pure Node.js với Database Schema và XAMPP MySQL
 */

const http = require('http');
const url = require('url');
const path = require('path');
const fs = require('fs');

// Database Manager
const DatabaseManager = require('./database/DatabaseManager');

// Controllers
const AuthController = require('./controllers/authController');
const UserController = require('./controllers/UserController');
const ChildController = require('./controllers/childController');
const IngredientController = require('./controllers/IngredientController');
const MealController = require('./controllers/mealController');
const NutritionController = require('./controllers/nutritionController');
const ReportController = require('./controllers/ReportController'); //  Thêm ReportControlle

// Routes
const AuthRoutes = require('./routes/auth');
const UserRoutes = require('./routes/users');
const ChildrenRoutes = require('./routes/children');
const IngredientRoutes = require('./routes/ingredients');
const MealsRoutes = require('./routes/meals');
const NutritionRoutes = require('./routes/nutrition');
const DishRoutes = require('./routes/dishes'); 
const ReportRoutes = require('./routes/report');

// Services (for backward compatibility)
const ReportingService = require('./services/ReportingService');
const MenuService = require('./services/MenuService');
const HealthService = require('./services/HealthService');

// Load environment variables
require('dotenv').config();

const PORT = process.env.PORT || 3002;
const HOST = process.env.HOST || 'localhost';

class KindergartenServer {
    constructor() {
        this.server = null;
        this.db = new DatabaseManager();
        
        // Initialize Controllers
        this.authController = new AuthController(this.db);
        this.userController = new UserController(this.db);
        this.childController = new ChildController(this.db);
        this.ingredientController = new IngredientController(this.db);
        this.mealController = new MealController(this.db);
        this.nutritionController = new NutritionController(this.db);
        
        // Initialize Routes
        this.authRoutes = new AuthRoutes(this.authController);
        this.userRoutes = new UserRoutes(this.userController, this.authController);
        this.childrenRoutes = new ChildrenRoutes(this.childController, this.authController);
        this.ingredientRoutes = new IngredientRoutes(this.ingredientController, this.authController);
        this.dishRoutes = new DishRoutes(this.authController); // ✅ Truyền authController
        this.mealsRoutes = new MealsRoutes(this.mealController, this.authController);
        this.nutritionRoutes = new NutritionRoutes(this.nutritionController, this.authController);
        
        // Initialize Services (for complex business logic)
        this.reportingService = new ReportingService(this.db);
        this.menuService = new MenuService(this.db);
        this.healthService = new HealthService(this.db);
    }

    // Set CORS headers
    setCorsHeaders(res) {
        res.setHeader('Access-Control-Allow-Origin', '*'); // Allow all origins for development
        res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
        res.setHeader('Access-Control-Allow-Credentials', 'true');
        res.setHeader('Access-Control-Max-Age', '3600');
    }

    // Send JSON response
    sendResponse(res, statusCode, data) {
        this.setCorsHeaders(res);
        res.writeHead(statusCode, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(data));
    }

    // Serve static files
    async serveStaticFile(req, res, filePath) {
        try {
            const fullPath = path.join(__dirname, 'public', filePath);
            
            // Check if file exists
            if (!fs.existsSync(fullPath)) {
                this.sendResponse(res, 404, {
                    success: false,
                    message: 'File not found'
                });
                return;
            }

            const ext = path.extname(fullPath).toLowerCase();
            const mimeTypes = {
                '.html': 'text/html',
                '.css': 'text/css',
                '.js': 'application/javascript',
                '.json': 'application/json',
                '.png': 'image/png',
                '.jpg': 'image/jpeg',
                '.gif': 'image/gif',
                '.svg': 'image/svg+xml'
            };

            const contentType = mimeTypes[ext] || 'text/plain';
            const content = fs.readFileSync(fullPath);

            this.setCorsHeaders(res);
            res.writeHead(200, { 'Content-Type': contentType });
            res.end(content);

        } catch (error) {
            console.error('Error serving static file:', error);
            this.sendResponse(res, 500, {
                success: false,
                message: 'Error serving file'
            });
        }
    }

    // Khởi tạo server
    async start() {
        try {
            console.log('Starting Kindergarten Nutrition Management Server...');
            
            // Kết nối database
            await this.db.initialize();
            
            // Test database
            const dbTest = await this.db.testDatabase();
            if (!dbTest) {
                throw new Error('Database test failed');
            }

            // Tạo HTTP server
            this.server = http.createServer((req, res) => {
                this.handleRequest(req, res);
            });

            // Lắng nghe trên port
            this.server.listen(PORT, HOST, () => {
                console.log(`Server is running on http://${HOST}:${PORT}`);
                console.log(`Health check: http://${HOST}:${PORT}/api/health`);
                console.log('MVC API endpoints available:');
                console.log('GET  /api/health');
                console.log('POST /api/auth/login');
                console.log('GET  /api/auth/me');
                console.log('GET  /api/users');
                console.log('POST /api/users (Admin)');
                console.log('GET  /api/children');
                console.log('POST /api/children');
                console.log('GET  /api/ingredients');
                console.log('POST /api/ingredients');
                console.log('GET  /api/meals');
                console.log('POST /api/meals');
                console.log('GET  /api/nutrition/records');
                console.log('POST /api/nutrition/records');
                console.log('GET  /api/reports');
                console.log('Static files: /public/*');
            });

        } catch (error) {
            console.error('Failed to start server:', error);
            process.exit(1);
        }
    }

    // Xử lý các request
    async handleRequest(req, res) {
        try {
            // Set CORS headers
            this.setCorsHeaders(res);

            // Handle preflight requests
            if (req.method === 'OPTIONS') {
                res.writeHead(200);
                res.end();
                return;
            }

            const parsedUrl = url.parse(req.url, true);
            const pathname = parsedUrl.pathname;
            const method = req.method;
            const query = parsedUrl.query;

            // Add query to request object
            req.query = query;

            console.log(`${method} ${pathname}`);

            // Route handling
            if (pathname === '/') {
                await this.handleHome(req, res);
            } else if (pathname === '/api/health') {
                await this.handleHealth(req, res);
            } else if (pathname.startsWith('/api/auth')) {
                await this.authRoutes.handleAuthRoutes(req, res, pathname.replace('/api/auth', ''), method);
            } else if (pathname.startsWith('/api/users')) {
                await this.userRoutes.handleUserRoutes(req, res, pathname.replace('/api/users', ''), method);
            } else if (pathname.startsWith('/api/children')) {
                await this.childrenRoutes.handleChildrenRoutes(req, res, pathname.replace('/api/children', ''), method);
            } else if (pathname.startsWith('/api/ingredients')) {
                await this.ingredientRoutes.handleIngredientRoutes(req, res, pathname.replace('/api/ingredients', ''), method);
            } else if (pathname.startsWith('/api/dishes')) {
                await this.dishRoutes.handleDishRoutes(req, res, pathname.replace('/api/dishes', ''), method);
            } else if (pathname.startsWith('/api/meals')) {
                await this.mealsRoutes.handleMealsRoutes(req, res, pathname.replace('/api/meals', ''), method);
            } else if (pathname === '/api/foods' && method === 'GET') {
                await this.handleFoodsLibrary(req, res);
            } else if (pathname.startsWith('/api/nutrition')) {
                await this.nutritionRoutes.handleNutritionRoutes(req, res);
            } else if (pathname.startsWith('/api/reports')) {
                await this.handleReports(req, res, pathname.replace('/api/reports', ''), method, query);
            } else if (pathname.startsWith('/public/') || pathname.startsWith('/api/docs')) {
                // Serve static files
                const filePath = pathname.startsWith('/public/') 
                    ? pathname.replace('/public/', '') 
                    : pathname.replace('/api/docs', 'docs');
                await this.serveStaticFile(req, res, filePath);
            } else {
                this.sendResponse(res, 404, {
                    success: false,
                    message: 'API endpoint not found',
                    available_endpoints: {
                        auth: [
                            'POST /api/auth/login',
                            'POST /api/auth/register',
                            'GET /api/auth/me'
                        ],
                        users: [
                            'GET /api/users',
                            'GET /api/users/:id',
                            'PUT /api/users/:id',
                            'DELETE /api/users/:id'
                        ],
                        children: [
                            'GET /api/children',
                            'POST /api/children',
                            'GET /api/children/:id',
                            'PUT /api/children/:id'
                        ],
                        ingredients: [
                            'GET /api/ingredients',
                            'POST /api/ingredients',
                            'GET /api/ingredients/:id',
                            'PUT /api/ingredients/:id'
                        ],
                        reports: [
                            'GET /api/reports/health',
                            'GET /api/reports/nutrition',
                            'GET /api/reports/inventory'
                        ]
                    }
                });
            }

        } catch (error) {
            console.error('Request handling error:', error);
            this.sendResponse(res, 500, {
                success: false,
                message: 'Internal server error',
                error: error.message
            });
        }
    }

    // Xử lý trang chủ API
    async handleHome(req, res) {
        const home = {
            message: "Kindergarten Nutrition Management API",
            version: "3.0.0 - MVC Architecture",
            status: "running",
            timestamp: new Date().toISOString(),
            architecture: "Model-View-Controller (MVC)",
            database: "MySQL Schema with XAMPP",
            features: [
                "Pure Node.js Server",
                "MVC Architecture", 
                "Role-based Authorization",
                "RESTful API Design",
                "Comprehensive Models",
                "Structured Controllers",
                "Clean Route Organization",
                "Ingredient Management",
                "Menu Planning",
                "Health Assessment",
                "Reporting System"
            ],
            api_structure: {
                models: "Database models with ORM-like functionality",
                controllers: "Business logic and request handling",
                routes: "URL routing and middleware",
                services: "Complex business operations"
            },
            endpoints: {
                auth: {
                    login: "POST /api/auth/login",
                    register: "POST /api/auth/register (Admin)",
                    profile: "GET /api/auth/me"
                },
                users: {
                    list: "GET /api/users",
                    create: "POST /api/users (Admin)",
                    detail: "GET /api/users/:id",
                    update: "PUT /api/users/:id",
                    delete: "DELETE /api/users/:id"
                },
                children: {
                    list: "GET /api/children",
                    create: "POST /api/children",
                    detail: "GET /api/children/:id",
                    update: "PUT /api/children/:id"
                },
                ingredients: {
                    list: "GET /api/ingredients",
                    create: "POST /api/ingredients",
                    detail: "GET /api/ingredients/:id",
                    update: "PUT /api/ingredients/:id"
                },
                dishes: {
                    list: "GET /api/dishes",
                    create: "POST /api/dishes",
                    detail: "GET /api/dishes/:id",
                    update: "PUT /api/dishes/:id",
                    delete: "DELETE /api/dishes/:id",
                    search: "GET /api/dishes/search/:keyword",
                    add_ingredient: "POST /api/dishes/:id/ingredients",
                    nutrition_stats: "GET /api/dishes/stats/nutrition"
                },
                meals: {
                    list: "GET /api/meals",
                    create: "POST /api/meals",
                    daily: "GET /api/meals/daily",
                    weekly: "GET /api/meals/weekly",
                    create_weekly: "POST /api/meals/weekly",
                    nutrition_summary: "GET /api/meals/nutrition-summary"
                },
                nutrition: {
                    records: "GET /api/nutrition/records",
                    create_record: "POST /api/nutrition/records",
                    child_records: "GET /api/nutrition/child/:id/records",
                    latest_record: "GET /api/nutrition/child/:id/latest",
                    growth_chart: "GET /api/nutrition/child/:id/growth-chart",
                    class_stats: "GET /api/nutrition/stats/class",
                    attention_list: "GET /api/nutrition/stats/attention",
                    calculate_bmi: "POST /api/nutrition/calculate-bmi"
                }
            }
        };

        this.sendResponse(res, 200, home);
    }

    // Xử lý health check
    async handleHealth(req, res) {
        const dbHealthy = await this.db.isHealthy();
        
        const health = {
            status: dbHealthy ? 'OK' : 'ERROR',
            message: 'Kindergarten Nutrition API',
            timestamp: new Date().toISOString(),
            uptime: process.uptime(),
            version: '3.0.0 - MVC Architecture',
            database: {
                type: 'MySQL with XAMPP',
                connected: dbHealthy,
                host: process.env.DB_HOST || 'localhost',
                port: process.env.DB_PORT || 3306,
                name: process.env.DB_NAME || 'kindergarten_nutrition'
            },
            features: {
                ingredients: true,
                menus: true,
                health_assessments: true,
                inventory_management: true,
                reporting: true,
                mvc_architecture: true
            }
        };

        this.sendResponse(res, dbHealthy ? 200 : 503, health);
    }

    // Xử lý Foods Library API
    async handleFoodsLibrary(req, res) {
        try {
            // Apply authentication
            const authHeader = req.headers.authorization;
            if (!authHeader || !authHeader.startsWith('Bearer ')) {
                this.sendResponse(res, 401, {
                    success: false,
                    message: 'Token không hợp lệ'
                });
                return;
            }

            // Verify token
            const token = authHeader.split(' ')[1];
            try {
                const decoded = await this.authController.verifyToken(token);
                req.user = decoded;
            } catch (error) {
                this.sendResponse(res, 401, {
                    success: false,
                    message: 'Token không hợp lệ'
                });
                return;
            }

            // Get query parameters
            const urlObj = new URL(req.url, `http://${req.headers.host}`);
            req.query = Object.fromEntries(urlObj.searchParams);

            // Call meal controller
            await this.mealController.getFoodLibrary(req, res);

        } catch (error) {
            console.error('Error in handleFoodsLibrary:', error);
            this.sendResponse(res, 500, {
                success: false,
                message: 'Lỗi server',
                error: error.message
            });
        }
    }

    // Xử lý reports (backward compatibility với Services)
    async handleReports(req, res, path, method, query) {
        try {
            // Apply authentication
            const authHeader = req.headers.authorization;
            if (!authHeader || !authHeader.startsWith('Bearer ')) {
                this.sendResponse(res, 401, {
                    success: false,
                    message: 'Access token is required'
                });
                return;
            }

            const token = authHeader.substring(7);
            const user = await this.authController.verifyToken(token);
            if (!user) {
                this.sendResponse(res, 401, {
                    success: false,
                    message: 'Invalid or expired token'
                });
                return;
            }

            req.user = user;

            if (method === 'GET') {
                if (path === '/health') {
                    const { class_id, start_date, end_date } = query;
                    if (!class_id) {
                        this.sendResponse(res, 400, {
                            success: false,
                            message: 'class_id parameter is required'
                        });
                        return;
                    }
                    
                    const result = await this.reportingService.generateHealthReport({
                        class_id: parseInt(class_id),
                        start_date,
                        end_date
                    });
                    this.sendResponse(res, 200, result);
                    return;
                }

                if (path === '' || path === '/') {
                    this.sendResponse(res, 200, {
                        success: true,
                        message: 'Reporting API endpoints',
                        available_reports: [
                            'GET /api/reports/health?class_id=1&start_date=2024-01-01&end_date=2024-01-31',
                            'GET /api/reports/nutrition?week_start=2024-01-01',
                            'GET /api/reports/inventory?category=thit'
                        ]
                    });
                    return;
                }
            }

            this.sendResponse(res, 404, { 
                success: false,
                message: 'Report endpoint not found' 
            });

        } catch (error) {
            console.error('Error in handleReports:', error);
            this.sendResponse(res, 500, {
                success: false,
                message: 'Lỗi khi tạo báo cáo',
                error: error.message
            });
        }
    }
    // Graceful shutdown
    async stop() {
        if (this.server) {
            this.server.close();
            console.log('Server stopped');
        }
        
        if (this.db) {
            await this.db.close();
        }
    }
}

// Start server
const server = new KindergartenServer();

// Handle process termination
process.on('SIGTERM', async () => {
    console.log('SIGTERM received');
    await server.stop();
    process.exit(0);
});

process.on('SIGINT', async () => {
    console.log('SIGINT received');
    await server.stop();
    process.exit(0);
});

// Start the server
server.start().catch(error => {
    console.error('Failed to start server:', error);
    process.exit(1);
});

module.exports = KindergartenServer;
