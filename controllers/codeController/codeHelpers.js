"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.fileUnliker = exports.dockerKill = exports.dockerRunCMD = exports.getExecCMD = void 0;
const fs_1 = __importDefault(require("fs"));
const util_1 = __importDefault(require("util"));
const child_process_1 = __importDefault(require("child_process"));
const exec = util_1.default.promisify(child_process_1.default.exec);
function getExecCMD(lang) {
    let obj = {
        py: `"python3 codeFile.py<testcases.txt"`,
        cpp: '"g++ codeFile.cpp && ./a.out<testcases.txt"',
        js: '"node codeFile.js<testcases.txt"'
    };
    return obj[lang];
}
exports.getExecCMD = getExecCMD;
function dockerRunCMD(lang) {
    let obj = {
        py: "docker run -d -it python:v1 /bin/bash",
        cpp: "docker run -d -it cpp:v1 /bin/bash",
        js: "docker run -d -it node:v1 /bin/bash"
    };
    return obj[lang];
}
exports.dockerRunCMD = dockerRunCMD;
function dockerKill(file1, file2, id) {
    fileUnliker(file1);
    fileUnliker(file2);
    exec(`docker kill ${id}`).then(() => console.log("Container Stopped"));
}
exports.dockerKill = dockerKill;
function fileUnliker(file = null) {
    if (file) {
        fs_1.default.unlink(file, (err) => {
            if (err)
                console.error(err);
        });
    }
}
exports.fileUnliker = fileUnliker;
;
