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
exports.findUserController = exports.userFindById = exports.findUser = void 0;
const users_1 = __importDefault(require("../models/user/users"));
function findUser(query, options) {
    return __awaiter(this, void 0, void 0, function* () {
        return users_1.default.findOne(query, null, options);
    });
}
exports.findUser = findUser;
const userFindById = (id) => {
    return users_1.default.findById(id);
};
exports.userFindById = userFindById;
const findUserController = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const details = yield findUser(req.body, { lean: false });
    res.json({ details });
});
exports.findUserController = findUserController;
const userCreate = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let userData = users_1.default.build(req.body);
        userData = yield users_1.default.create(userData);
        res.json({
            userData: userData
        });
    }
    catch (error) {
        res.json({
            userData: [error]
        });
    }
});
exports.default = userCreate;
