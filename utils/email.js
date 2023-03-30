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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Email = void 0;
const nodemailer_1 = __importDefault(require("nodemailer"));
const config_1 = require("../config");
class Email {
    constructor(user, url) {
        this.to = user.isEmail;
        this.firstName = user.name.split(' ')[0];
        this.url = url;
        this.from = `${config_1.EMAIL_FROM}`;
    }
    send(message) {
        return __awaiter(this, void 0, void 0, function* () {
            const mailOptions = {
                to: this.to,
                from: this.from,
                subject: "forgot password",
                text: message,
                // html:'<div><h1><a herf="google.com">hello from code exe</a></h1></div>',
            };
            return yield this.newcreateTransport().sendMail(mailOptions);
        });
    }
    newcreateTransport() {
        const transport = nodemailer_1.default.createTransport({
            service: 'gmail',
            auth: {
                user: config_1.EMAIL_CONFIG,
                pass: config_1.EMAIL_SEND_PASS
            }
        });
        ;
        return transport;
    }
}
exports.Email = Email;
