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
exports.getMonthlyPlan = exports.getTourStats = exports.aliasTopTour = exports.deleteTour = exports.createTour = exports.updateTour = exports.getTour = exports.getAllTours = void 0;
const tourModel_1 = __importDefault(require("../models/tour/tourModel"));
const apiFeature_1 = __importDefault(require("../utils/apiFeature"));
const appError_1 = __importDefault(require("../utils/appError"));
const catchAsync_1 = __importDefault(require("../utils/catchAsync"));
exports.getAllTours = (0, catchAsync_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    // const queryObj = {...req.query};
    //flitering
    // const excludedFields = ['page','sort','limit','fields'];
    // excludedFields.forEach(el => delete queryObj[el]);
    // let queryStr = JSON.stringify(queryObj);
    // queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g,match => `$${match}`);
    // let query =  Tour.find(JSON.parse(queryStr));
    // //sorting
    // if(req.query.sort){
    //     let strQy = (req.query.sort as string);
    //     let sortBy = strQy.split(',').join(' ');
    //     query = query.sort(strQy);
    // }else{
    //     query = query.sort('-createdAt');
    // }
    // //Field limiting
    // if(req.query.fields){
    //     let fieldsQ = req.query.fields as string;
    //     const fields = fieldsQ.split(',').join(' ');
    //     query = query.select(fields)
    // }else{
    //     query = query.select('-__v');
    // }
    // //pagination
    // const page = Number((req.query.page as string))||1;
    // const limit = Number((req.query.limit as string))||100;
    // const skip = (page-1) * limit;
    // query = query.skip(skip).limit(limit);
    console.log(tourModel_1.default.find());
    const features = new apiFeature_1.default(tourModel_1.default.find(), req.query).filter().sort().limitFields().paginate();
    const tours = yield features.query;
    res.status(200).json({
        status: 'success',
        results: tours.length,
        data: {
            tours
        }
    });
}));
exports.getTour = (0, catchAsync_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const tour = yield tourModel_1.default.findById(req.params.id);
    if (!tour) {
        return next(new appError_1.default('No tour found with that ID', 404));
    }
    res.status(200).json({
        status: 'success',
        data: {
            tour
        }
    });
}));
exports.updateTour = (0, catchAsync_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    debugger;
    const tour = yield tourModel_1.default.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true,
        lean: true
    });
    if (!tour) {
        return next(new appError_1.default('No tour found with that ID', 404));
    }
    res.status(200).json({
        status: 'success',
        data: {
            tour
        }
    });
}));
exports.createTour = (0, catchAsync_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { data } = req.body;
    const resData = yield tourModel_1.default.build(data);
    res.status(200).json({
        status: 'success',
        results: [resData]
    });
}));
exports.deleteTour = (0, catchAsync_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.body;
    const tour = yield tourModel_1.default.findByIdAndDelete(id);
    if (!tour) {
        return next(new appError_1.default('No tour found with that ID', 404));
    }
    res.status(200).json({
        status: 'success',
        results: [tour]
    });
}));
const aliasTopTour = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    req.query.limit = '5';
    req.query.sort = '-ratingAverage,price';
    req.query.fields = "name,price,ratingAverage,summary,difficulty";
    next();
});
exports.aliasTopTour = aliasTopTour;
exports.getTourStats = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    let stats = tourModel_1.default.aggregate([
        {
            $match: { ratingsAverage: { $gte: 4.5 } }
        },
        {
            $group: {
                _id: { $toUpper: '$difficulty' },
                numTours: { $sum: 1 },
                numRatings: { $sum: '$ratingsQuantity' },
                avgRating: { $avg: '$ratingsAverage' },
                avgPrice: { $avg: '$price' },
                minPrice: { $min: '$price' },
                maxPrice: { $max: '$price' }
            }
        },
        {
            $sort: { avgPrice: 1 }
        }
        // {
        //   $match: { _id: { $ne: 'EASY' } }
        // }
    ]);
    let newstats = yield stats;
    res.status(200).json({
        status: 'success',
        data: {
            newstats
        }
    });
}));
exports.getMonthlyPlan = (0, catchAsync_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const year = Number(req.params.year); // 2021
    const plan = yield tourModel_1.default.aggregate([
        {
            $unwind: '$startDates'
        },
        {
            $match: {
                startDates: {
                    $gte: new Date(`${year}-01-01`),
                    $lte: new Date(`${year}-12-31`)
                }
            }
        },
        {
            $group: {
                _id: { $month: '$startDates' },
                numTourStarts: { $sum: 1 },
                tours: { $push: '$name' }
            }
        },
        {
            $addFields: { month: '$_id' }
        },
        {
            $project: {
                _id: 0
            }
        },
        {
            $sort: { numTourStarts: -1 }
        },
        {
            $limit: 12
        }
    ]);
    res.status(200).json({
        status: 'success',
        data: {
            plan
        }
    });
}));
