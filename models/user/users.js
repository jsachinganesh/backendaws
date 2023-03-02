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
const mongoose_1 = require("mongoose");
const validator_1 = __importDefault(require("validator"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const crypto_1 = __importDefault(require("crypto"));
const userSchema = new mongoose_1.Schema({
    name: {
        type: String,
        required: [true, 'A user must have a name'],
        trim: true
    },
    email: {
        type: String,
        required: [true, 'A user must have a email'],
        unique: true,
        lowercase: true,
        validotor: [validator_1.default.isEmail, 'Incorrect Email']
    },
    password: {
        type: String,
        required: [true, 'A user must have a password'],
        minlength: 4,
        select: false
    },
    passwordConfirm: {
        type: String,
        required: [true, 'A user must password confirm'],
        validate: {
            // validator works on create and save only
            validator: function (val) {
                const user = this;
                return user.password === val;
            },
            message: "Password Confirm can't match"
        }
    },
    role: {
        type: String,
        enum: ['user', 'guide', 'lead-guide', 'admin'],
        default: 'user'
    },
    passwordChangedAt: Date,
    passwordResetToken: String,
    passwordResetExpires: Date,
    active: {
        type: Boolean,
        default: true,
        select: false
    },
});
userSchema.statics.build = (userObj) => {
    return new userModal(userObj);
};
userSchema.pre('save', function (next) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!this.isModified('password'))
            return next();
        this.password = yield bcrypt_1.default.hash(this.password, 12);
        this.passwordConfirm = undefined;
        next();
    });
});
userSchema.pre('save', function (next) {
    if (!this.isModified('password') || this.isNew)
        return next();
    this.passwordChangedAt = new Date(Date.now() - 5000);
    next();
});
userSchema.pre(/^find/, function (next) {
    this.find({ active: { $ne: false } });
    next();
});
userSchema.methods.createPasswordResetToken = function () {
    const resetToken = crypto_1.default.randomBytes(32).toString('hex');
    this.passwordResetToken = crypto_1.default.createHash('sha256').update(resetToken).digest('hex');
    this.passwordResetExpires = Date.now() + 10 * 60 * 1000;
    console.log("ds");
    return resetToken;
};
userSchema.methods.correctPassword = function (candidatePassword, userPassword) {
    return __awaiter(this, void 0, void 0, function* () {
        return yield bcrypt_1.default.compare(candidatePassword, userPassword);
        ;
    });
};
userSchema.methods.changedPasswordAfter = function (JWTTimestamp) {
    if (this.passwordChangedAt) {
        const changedTimestamp = new Date(this.passwordChangedAt.getTime() / 1000);
        return JWTTimestamp < changedTimestamp;
    }
    // False means NOT changed
    return false;
};
userSchema.index({ email: 1 }, { unique: true });
const userModal = (0, mongoose_1.model)('User', userSchema);
exports.default = userModal;
