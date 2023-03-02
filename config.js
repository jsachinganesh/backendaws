"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MAX_CODE_RUN = exports.CLIENT_IP = exports.EMAIL_SEND_PASS = exports.SEND_GRID_KEY = exports.EMAIL_FROM = exports.EMAIL_PORT = exports.EMAIL_HOST = exports.EMAIL_PASSWORD = exports.EMAIL_USERNAME = exports.JWT_COOKIE_EXPIRES_IN = exports.JWT_EXPIRES_IN = exports.JWT_SECRET = exports.DB = exports.port = exports.environment = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config({ path: './config.env' });
exports.environment = process.env.NODE_ENV;
exports.port = process.env.PORT;
exports.DB = process.env.DATABASE || '';
exports.JWT_SECRET = process.env.JWT_SECRET || '';
exports.JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '';
exports.JWT_COOKIE_EXPIRES_IN = process.env.JWT_COOKIE_EXPIRES_IN || 0;
exports.EMAIL_USERNAME = process.env.EMAIL_USERNAME || '';
exports.EMAIL_PASSWORD = process.env.EMAIL_PASSWORD || '';
exports.EMAIL_HOST = process.env.EMAIL_HOST || '';
exports.EMAIL_PORT = process.env.EMAIL_PORT || 0;
exports.EMAIL_FROM = process.env.EMAIL_FROM || '';
exports.SEND_GRID_KEY = process.env.SEND_GRID_KEY || '';
exports.EMAIL_SEND_PASS = process.env.EMAIL_SEND_PASS || '';
exports.CLIENT_IP = process.env.CLIENT_IP || '';
exports.MAX_CODE_RUN = process.env.MAX_CODE_RUN || 9999;
