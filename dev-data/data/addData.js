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
exports.importData = void 0;
const fs_1 = __importDefault(require("fs"));
const tourModel_1 = __importDefault(require("../../models/tour/tourModel"));
const tours = JSON.parse(fs_1.default.readFileSync(`${__dirname}/tours-simple.json`, 'utf-8'));
const importData = () => __awaiter(void 0, void 0, void 0, function* () {
    return new Promise(function (reslove, reject) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                yield tourModel_1.default.create(tours);
                reslove("done");
            }
            catch (err) {
                console.log(err);
                reslove(err);
            }
        });
    });
});
exports.importData = importData;
