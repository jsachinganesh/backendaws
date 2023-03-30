"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.redisCount = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const config_1 = require("./config");
/**
* Uncaught Exception occurs when an exception is not caught by a programming construct or by the programmer.
*  It is for handling uncaught Exception. It should init first. So, that we have caught the error from start of the server.
*/
process.on('uncaughtException', err => {
    console.log(err);
    process.exit(1);
});
const app_1 = __importDefault(require("./app"));
const redis_1 = __importDefault(require("./utils/redis"));
exports.redisCount = new redis_1.default();
/**
* Connecting to mongoDB database.
*/
mongoose_1.default
    .connect(config_1.DB)
    .then(() => console.log('DB connection successful!')).catch(err => {
    console.log('💣 NOT CONNETED');
    console.log(err);
});
const port = config_1.port || 8001;
const server = app_1.default.listen(port, () => {
    console.log(config_1.environment);
    console.log(`Server Started on ${port}`);
});
/**
* It is for to handle unhandled rejections like promises
*/
process.on('unhandledRejection', (err) => {
    console.log('unhandledRejection', err);
    server.close(() => {
        process.exit(1);
    });
});
