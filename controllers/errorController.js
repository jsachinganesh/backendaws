"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleValidtionErrorDB = exports.handleDuplicateFieldsDB = exports.handleCastErrorDB = exports.handleJWTError = exports.handleJWTExpiredError = exports.gobalErrorHandler = void 0;
const lodash_1 = require("lodash");
const config_1 = require("../config");
const appError_1 = __importDefault(require("../utils/appError"));
const gobalErrorHandler = (err, req, res, next) => {
    err.statusCode = err.statusCode || 500;
    err.status = err.status || 'error';
    console.log(err);
    if (config_1.environment === 'development') {
        return sendErrorDev(err, res);
    }
    let error = (0, lodash_1.cloneDeep)(err).prototype = err;
    if (error.name === 'CastError') {
        error = (0, exports.handleCastErrorDB)(error);
    }
    else if (error.name === 'ValidationError') {
        error = (0, exports.handleValidtionErrorDB)(error);
    }
    else if (error.name === 'JsonWebTokenError') {
        error = (0, exports.handleJWTError)(error);
    }
    else if (error.name === 'TokenExpiredError') {
        error = (0, exports.handleJWTExpiredError)(error);
    }
    if (error.code === 11000)
        error = (0, exports.handleDuplicateFieldsDB)(error);
    return sendErrorProd(error, res);
};
exports.gobalErrorHandler = gobalErrorHandler;
const handleJWTExpiredError = (err) => new appError_1.default('Your token as been expired. Please log in again!', 401);
exports.handleJWTExpiredError = handleJWTExpiredError;
const handleJWTError = (err) => new appError_1.default('Invalid token. Please log in again!', 401);
exports.handleJWTError = handleJWTError;
const handleCastErrorDB = (err) => {
    const message = `Invalid ${err.path}: ${err.value}`;
    return new appError_1.default(message, 400);
};
exports.handleCastErrorDB = handleCastErrorDB;
const handleDuplicateFieldsDB = (err) => {
    const value = err.errmsg.match(/(["'])(\\?.)*?\1/)[0];
    const message = `Duplicate field value ${value}: Please use another value`;
    return new appError_1.default(message, 400);
};
exports.handleDuplicateFieldsDB = handleDuplicateFieldsDB;
const handleValidtionErrorDB = (err) => {
    const errors = Object.values(err.errors).map(el => el.message);
    const message = `Invalid input data. ${errors.join('. ')}`;
    return new appError_1.default(message, 400);
};
exports.handleValidtionErrorDB = handleValidtionErrorDB;
const sendErrorDev = (err, res) => {
    res.status(err.statusCode).json({
        status: err.status,
        message: err.message,
        error: err,
        stack: err.stack
    });
};
const sendErrorProd = (err, res) => {
    if (err.isOperational) {
        return res.status(err.statusCode).json({
            status: err.status,
            message: err.message,
        });
    }
    console.log('Error 💣', err);
    return res.status(500).json({
        status: 'fail',
        message: 'Something went wrong!'
    });
};
