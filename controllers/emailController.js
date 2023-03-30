"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const config_1 = require("../config");
const email_1 = require("../utils/email");
function sendEmailHandler(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        const data = new email_1.Email({
            isEmail: config_1.EMAIL_CONFIG,
            name: 'sachin'
        }, 'test');
        try {
            const emailRes = yield data.send();
            res.json({
                'done': emailRes
            });
        }
        catch (error) {
            res.json({
                'done': error
            });
        }
    });
}
exports.default = sendEmailHandler;
