"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const emailController_1 = __importDefault(require("../controllers/emailController"));
const express = require('express');
const router = express.Router();
router.post('/', emailController_1.default);
exports.default = router;
