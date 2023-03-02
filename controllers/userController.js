"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteUser = exports.updateUser = exports.createUser = exports.getUser = exports.getAllUsers = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const config_1 = require("../config");
const signToken = (id) => {
    return jsonwebtoken_1.default.sign({ id }, config_1.JWT_SECRET, {
        expiresIn: config_1.JWT_EXPIRES_IN
    });
};
function getAllUsers(req, res) {
    res.status(500).json({
        status: 'error',
        message: 'This route is not yet defined!'
    });
}
exports.getAllUsers = getAllUsers;
function getUser(req, res) {
    res.status(500).json({
        status: 'error',
        message: 'This route is not yet defined!'
    });
}
exports.getUser = getUser;
function createUser(req, res) {
    res.status(500).json({
        status: 'error',
        message: 'This route is not yet defined!'
    });
}
exports.createUser = createUser;
function updateUser(req, res) {
    res.status(500).json({
        status: 'error',
        message: 'This route is not yet defined!'
    });
}
exports.updateUser = updateUser;
function deleteUser(req, res) {
    res.status(500).json({
        status: 'error',
        message: 'This route is not yet defined!'
    });
}
exports.deleteUser = deleteUser;
