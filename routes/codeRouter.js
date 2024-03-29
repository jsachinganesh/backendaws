"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const authController_1 = require("../controllers/authController/authController");
const codeController_1 = require("../controllers/codeController/codeController");
const express = require('express');
const router = express.Router();
// router.post('/',codeController);
router.post('/create', authController_1.protect, codeController_1.createCodeDoc);
router.post('/run', codeController_1.saveToDb, codeController_1.runCode);
router.get('/', authController_1.protect, codeController_1.getAllUserCode);
router.route('/:id').get(authController_1.protect, codeController_1.getUserCode).delete(authController_1.protect, codeController_1.deleteCode);
exports.default = router;
