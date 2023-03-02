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
exports.deleteCode = exports.getAllUserCode = exports.getUserCode = exports.createCodeDoc = exports.runCode = exports.saveToDb = void 0;
const util_1 = __importDefault(require("util"));
const { promisify } = require("util");
const child_process_1 = __importDefault(require("child_process"));
const uuid_1 = require("uuid");
const fs_1 = __importDefault(require("fs"));
const catchAsync_1 = __importDefault(require("../../utils/catchAsync"));
const codeModel_1 = __importDefault(require("../../models/code/codeModel"));
const base_64_1 = require("base-64");
const codeHelpers_1 = require("./codeHelpers");
const userTController_1 = require("../userTController");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const __1 = require("../..");
const exec = util_1.default.promisify(child_process_1.default.exec);
// const redisClient = createClient();
// redisClient.connect().then(()=>{
//   console.log('connted redis');
// }).catch((err)=>{
//   console.log(err);
// })
// export const RUN_CODE_MEMEBERS = "2";
exports.saveToDb = (0, catchAsync_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
    }
    else if (req.cookies.jwt) {
        token = req.cookies.jwt;
    }
    if (token) {
        const decoded = yield promisify(jsonwebtoken_1.default.verify)(token, process.env.JWT_SECRET);
        const currentUser = yield (0, userTController_1.userFindById)(decoded.id);
        if (!currentUser) {
            return next();
        }
        if (currentUser.changedPasswordAfter(decoded.iat)) {
            return next();
        }
        ;
    }
    if (req.body.codeId) {
        const codeDoc = yield codeModel_1.default.findOne({ _id: `${req.body.codeId}` });
        if (!codeDoc) {
            return res.json({
                err: true
            });
        }
        codeDoc.code = req.body.code;
        yield codeDoc.save();
    }
    next();
}));
exports.runCode = (0, catchAsync_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    let rsData = yield __1.redisCount.getCurrentRedisCount();
    if (rsData == null || Number(rsData) < 2) {
        let { lang, code, inputs } = req.body;
        code = (0, base_64_1.decode)(code);
        console.log(code);
        const dockerCmdToExecuteCode = (0, codeHelpers_1.getExecCMD)(lang);
        const runContainer = (0, codeHelpers_1.dockerRunCMD)(lang);
        let sendToClient;
        const extention = `.${lang}`;
        const codeFile = `${(0, uuid_1.v1)()}${extention}`;
        const inputFile = `${(0, uuid_1.v4)()}.txt`;
        try {
            yield fs_1.default.promises.writeFile(codeFile, code);
            yield fs_1.default.promises.writeFile(inputFile, inputs);
        }
        catch (error) {
            return res.send({
                status: "success",
                data: [],
                error: {
                    message: JSON.stringify(error),
                    code: 402,
                    err: error,
                },
            });
        }
        if (!rsData || Number(rsData) <= 0) {
            yield __1.redisCount.setCountRedis(1);
        }
        else if (Number(rsData) == 1) {
            yield __1.redisCount.setCountRedis(2);
        }
        let resp;
        try {
            resp = yield exec(runContainer);
        }
        catch (error) {
            fileUnliker(codeFile);
            fileUnliker(inputFile);
            yield __1.redisCount.setCountRedis(Number(rsData) - 1);
            return res.send({
                status: "success",
                data: JSON.stringify(error),
                error: {
                    message: "",
                    code: 0,
                    err: error,
                },
            });
        }
        const id = resp === null || resp === void 0 ? void 0 : resp.stdout.substring(0, 12);
        const cmd = `docker cp ${codeFile} ${id}:/usr/src/app/codeFile${extention} && docker cp ${inputFile} ${id}:/usr/src/app/testcases.txt && docker exec ${id} bash -c ${dockerCmdToExecuteCode}`;
        try {
            debugger;
            sendToClient = (yield exec(cmd, { timeout: 20000, maxBuffer: 50000 })).stdout;
            fileUnliker(codeFile);
            fileUnliker(inputFile);
            yield exec(`docker rm -f ${id}`);
            console.log("Container Stopped");
            yield __1.redisCount.setCountRedis(Number(rsData) - 1);
            res.send({
                status: "success",
                data: sendToClient,
                error: {
                    message: "",
                    code: 0,
                    err: null,
                },
            });
        }
        catch (err) {
            debugger;
            let tempErrorString = err.toString();
            let len = tempErrorString.length;
            let returnString = tempErrorString.substring(len - cmd.length, len);
            fileUnliker(codeFile);
            fileUnliker(inputFile);
            console.log("hello");
            yield exec(`docker rm -f ${id}`);
            console.log("Container Stopped");
            yield __1.redisCount.setCountRedis(Number(rsData) - 1);
            res.send({
                status: "success",
                data: returnString,
                error: {
                    message: "",
                    code: 0,
                    err: err,
                },
            });
        }
    }
    else {
        res.send("TWo many people"); // Your First C++ Program
    }
}));
// export const runCode = catchAsync(async (req: Request, res: Response, next: NextFunction)=>{
//     let {lang,code} =  req.body;
//     code = base64_decode(code);
//     console.log(code);
//     let dockerCmdToExecuteCode = getExecCMD(lang);
//     let runContainer = dockerRunCMD(lang);
//     let sendToClient;
//     let extention = `.${lang}`;
//     let codeFile = uuidv1() + extention
//     let inputFile = uuidv4() + ".txt";
//     fs.writeFile(codeFile, code, (err) => {
//         if (err) {
//             res.status(200).json({
//                 status: 'success',
//                 data: [],
//                 error: {
//                     message: 'Something went wrong',
//                     code: 1
//                 }
//             })
//         } else {
//             fs.writeFile(inputFile, '1', (err) => {
//                 if (err) {
//                     res.status(200).json({
//                         status: 'success',
//                         data: [],
//                         error: {
//                             message: 'Something went wrong',
//                             code: 1
//                         }
//                     })
//                 } else {
//                     exec(runContainer).then((resp) => {
//                         var id = resp.stdout.substring(0, 12);
//                         var cmd = `docker cp ${codeFile} ${id}:/usr/src/app/codeFile${extention} && docker cp ${inputFile} ${id}:/usr/src/app/inputFile.txt && docker exec ${id} bash -c ${dockerCmdToExecuteCode}`;
//                         exec(cmd, { timeout: 20000, maxBuffer: 50000 }).then((respo) => {                  
//                             sendToClient = respo.stdout;   
//                             fileUnliker(codeFile);
//                             fileUnliker(inputFile);
//                             exec(`docker kill ${id}`).then(() =>
//       console.log("Container Stopped")
//     );
//                             res.send({
//                                 status: 'success',
//                                 data: sendToClient,
//                                 error: {
//                                     message: '',
//                                     code: 0,
//                                     err:err
//                                 }
//                             })
//                         }).catch((err)=>{
//                             var tempErrorString=err.toString();
//                             var len=tempErrorString.length
//                             var returnString=tempErrorString.substring(len-cmd.length,len)
//                             fileUnliker(codeFile);
//                             fileUnliker(inputFile);
//                             exec(`docker kill ${id}`).then(() =>
//       console.log("Container Stopped")
//     );
//     res.send({
//         status: 'success',
//         data: returnString,
//         error: {
//             message: '',
//             code: 0,
//             err:err
//         }
//     })
//                         })
//                     }).catch((err)=>{
//                         res.status(200).json({
//                             status: 'success',
//                             data: [],
//                             error: {
//                                 message: 'Something went wrong',
//                                 code: 1,
//                                 err:err
//                             }
//                         })
//                     })
//                 }
//             })
//         }
//     })
//     // res.json({lang,code})
// });
exports.createCodeDoc = (0, catchAsync_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { lang, name, des } = req.body;
    const user = req.user;
    let codeDoc = yield codeModel_1.default.create({ lang, name, des, user: user === null || user === void 0 ? void 0 : user._id });
    res.json({
        codeDoc
    });
}));
exports.getUserCode = (0, catchAsync_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const id = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
    const docId = req.params.id;
    const codes = yield codeModel_1.default.find({ 'user': id }).where({ '_id': docId });
    res.json({
        status: 'success',
        length: codes.length,
        data: codes,
    });
}));
exports.getAllUserCode = (0, catchAsync_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _b;
    const id = (_b = req.user) === null || _b === void 0 ? void 0 : _b.id;
    debugger;
    const codes = yield codeModel_1.default.find({ 'user': id });
    res.json({
        status: 'success',
        length: codes.length,
        data: codes,
    });
}));
exports.deleteCode = (0, catchAsync_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _c;
    const userId = (_c = req.user) === null || _c === void 0 ? void 0 : _c.id;
    const codeId = req.params.id;
    debugger;
    const codes = yield codeModel_1.default.findByIdAndDelete({ '_id': codeId }).where({ 'user': userId });
    res.json({
        status: 'success',
        data: codes
    });
}));
const fileUnliker = (file) => {
    if (file) {
        fs_1.default.unlink(file, (err) => {
            if (err)
                console.error(err);
        });
    }
};
exports.default = exports.runCode;
