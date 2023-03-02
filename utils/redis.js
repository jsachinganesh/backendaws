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
exports.RUN_CODE_MEMEBERS = void 0;
const redis_1 = require("redis");
exports.RUN_CODE_MEMEBERS = "2";
class RedisCount {
    constructor() {
        this.redisClient = (0, redis_1.createClient)();
        this.redisClient.connect().then(() => {
            console.log('connted redis');
            this.resetCountRedis();
        }).catch((err) => {
            console.log(err);
        });
    }
    resetCountRedis() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.redisClient.set(exports.RUN_CODE_MEMEBERS, "0");
        });
    }
    setCountRedis(count) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.redisClient.set(exports.RUN_CODE_MEMEBERS, `${count}`);
        });
    }
    getCurrentRedisCount() {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.redisClient.get(exports.RUN_CODE_MEMEBERS);
        });
    }
}
exports.default = RedisCount;
