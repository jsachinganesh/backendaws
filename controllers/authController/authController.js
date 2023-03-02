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
exports.updatePassword = exports.resetPassword = exports.forgotPassword = exports.restrictTo = exports.protect = exports.login = exports.signup = exports.logout = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const config_1 = require("../../config");
const users_1 = __importDefault(require("../../models/user/users"));
const appError_1 = __importDefault(require("../../utils/appError"));
const catchAsync_1 = __importDefault(require("../../utils/catchAsync"));
const email_1 = require("../../utils/email");
const userTController_1 = require("../userTController");
const { promisify } = require("util");
const crypto_1 = __importDefault(require("crypto"));
const signToken = (id) => {
    return jsonwebtoken_1.default.sign({ id }, config_1.JWT_SECRET, {
        expiresIn: config_1.JWT_EXPIRES_IN
    });
};
const createSendToken = (user, statusCode, res) => {
    const token = signToken(user._id);
    const cookieOptions = {
        expires: new Date(Date.now() + parseInt(`${config_1.JWT_COOKIE_EXPIRES_IN}`) * 24 * 60 * 60 * 1000),
        httpOnly: true
    };
    if (config_1.environment === 'production')
        cookieOptions.secure = true;
    res.cookie('jwt', token, cookieOptions);
    // Remove password from output
    user.password = undefined;
    res.status(statusCode).json({
        status: 'success',
        token,
        data: {
            user
        }
    });
};
const logout = (req, res) => {
    const cookieOptions = {
        expires: new Date(Date.now() + 10 * 1000),
        httpOnly: true
    };
    res.cookie('jwt', 'loggedout', cookieOptions);
    res.status(200).json({ status: 'success' });
};
exports.logout = logout;
exports.signup = (0, catchAsync_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { name, email, password, passwordConfirm, role } = req.body;
    debugger;
    let newUser = users_1.default.build({
        name,
        email,
        password,
        passwordConfirm,
    });
    newUser = yield users_1.default.create(newUser);
    const url = `${req.protocol}://${req.get('host')}/me`;
    // await new Email(newUser,url).sendWelcome();
    createSendToken(newUser, 200, res);
}));
exports.login = (0, catchAsync_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, password } = req.body;
    if (!email || !password) {
        return next(new appError_1.default('User must provide both email and password', 401));
    }
    const user = yield users_1.default.findOne({ email }).select('+password');
    if (!user || !(yield user.correctPassword(password, user.password))) {
        return next(new appError_1.default('Incorrect email or password', 401));
    }
    createSendToken(user, 200, res);
}));
exports.protect = (0, catchAsync_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
    }
    else if (req.cookies.jwt) {
        token = req.cookies.jwt;
    }
    if (!token) {
        return next(new appError_1.default('Your not login. Please login to get access', 401));
    }
    const decoded = yield promisify(jsonwebtoken_1.default.verify)(token, process.env.JWT_SECRET);
    const currentUser = yield (0, userTController_1.userFindById)(decoded.id);
    if (!currentUser) {
        return next(new appError_1.default('The user belonging to this token does no longer exist.', 401));
    }
    if (currentUser.changedPasswordAfter(decoded.iat)) {
        return next(new appError_1.default('User recently changed password! Please log in again.', 401));
    }
    ;
    req.user = currentUser;
    res.locals.user = currentUser;
    next();
}));
const restrictTo = (...roles) => {
    return (0, catchAsync_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
        let user = req.user;
        let userRole = user.role;
        if (!roles.includes(userRole)) {
            return next(new appError_1.default('You do not have permission to perform this action', 403));
        }
        next();
    }));
};
exports.restrictTo = restrictTo;
exports.forgotPassword = (0, catchAsync_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const user = yield users_1.default.findOne({ email: req.body.email });
    if (!user) {
        return next(new appError_1.default('There is no user with email address', 404));
    }
    const resetToken = user.createPasswordResetToken();
    yield user.save({ validateBeforeSave: false });
    const resetURL = `${req.protocol}://${config_1.CLIENT_IP}/api/v1/users/resetPassword/${resetToken}`;
    const message = `Forgot your passwoord? Submit a PATCH request with new password and passwordConfirm to:${resetURL}`;
    try {
        const data = new email_1.Email({
            isEmail: req.body.email,
            name: 'Coder'
        }, resetURL);
        yield data.send(message);
        res.status(200).json({
            status: 'success',
            message: 'Token send to your email'
        });
    }
    catch (error) {
        user.passwordResetToken = undefined;
        user.passwordResetExpires = undefined;
        yield user.save({ validateBeforeSave: false });
        res.status(200).json({
            status: 'success',
            message: 'Token send to your email'
        });
    }
}));
exports.resetPassword = (0, catchAsync_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const hashedToken = crypto_1.default
        .createHash('sha256')
        .update(req.params.token)
        .digest('hex');
    const user = yield users_1.default.findOne({
        passwordResetToken: hashedToken,
        passwordResetExpires: { $gt: Date.now() }
    });
    // 2) If token has not expired, and there is user, set the new password
    if (!user) {
        return next(new appError_1.default('Token is invalid or has expired', 400));
    }
    user.password = req.body.password;
    user.passwordConfirm = req.body.passwordConfirm;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    yield user.save();
    // 3) Update changedPasswordAt property for the user
    // 4) Log the user in, send JWT
    createSendToken(user, 200, res);
}));
exports.updatePassword = (0, catchAsync_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    // 1) Get user from collection
    const localUser = req.user;
    const user = yield users_1.default.findById(localUser.id).select('+password');
    if (!user) {
        return next(new appError_1.default('No user with that id', 400));
    }
    // 2) Check if POSTed current password is correct
    if (!(yield user.correctPassword(req.body.passwordCurrent, user.password))) {
        return next(new appError_1.default('Your current password is wrong.', 401));
    }
    // 3) If so, update password
    user.password = req.body.password;
    user.passwordConfirm = req.body.passwordConfirm;
    yield user.save();
    // User.findByIdAndUpdate will NOT work as intended!
    // 4) Log user in, send JWT
    createSendToken(user, 200, res);
}));
