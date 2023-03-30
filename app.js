"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const morgan_1 = __importDefault(require("morgan"));
const codeRouter_1 = __importDefault(require("./routes/codeRouter"));
const userRouter_1 = __importDefault(require("./routes/userRouter"));
const emailRouter_1 = __importDefault(require("./routes/emailRouter"));
const config_1 = require("./config");
const appError_1 = __importDefault(require("./utils/appError"));
const errorController_1 = require("./controllers/errorController");
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const helmet_1 = __importDefault(require("helmet"));
const express_mongo_sanitize_1 = __importDefault(require("express-mongo-sanitize"));
// @ts-ignore
const xss_clean_1 = __importDefault(require("xss-clean"));
const app = (0, express_1.default)();
app.use((0, cors_1.default)());
//middlewares
app.use((0, helmet_1.default)());
if (config_1.environment === 'development') {
    app.use((0, morgan_1.default)("dev"));
}
/**
* User can't make more than 100 request in 1hour
*/
const limitrate = (0, express_rate_limit_1.default)({
    max: 100,
    windowMs: 60 * 60 * 1000,
    message: 'Too many request from this IP, please try again in an hour'
});
app.use('/api', limitrate);
app.use((0, cookie_parser_1.default)());
app.use(express_1.default.json({ limit: '20kb' }));
app.use((0, express_mongo_sanitize_1.default)());
app.use((0, xss_clean_1.default)());
app.use(express_1.default.static(`${__dirname}/../public`));
/**
* to check health check
*/
app.get('/check', (req, res) => {
    res.send({
        status: 'running'
    });
});
app.use('/api/v1/email', emailRouter_1.default);
app.use('/api/v1/users', userRouter_1.default);
app.use('/api/v1/code', codeRouter_1.default);
app.all('*', (req, res, next) => {
    const err = new appError_1.default(`Can't find resource`, 404);
    next(err);
});
app.use(errorController_1.gobalErrorHandler);
exports.default = app;
