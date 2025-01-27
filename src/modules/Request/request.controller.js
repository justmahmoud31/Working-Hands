import Requests from "../../../database/Models/requests.js";
import { AppError } from "../../utils/AppError.js";

const addrequest = async (req, res, next) => {
    try {
        const { body, file } = req;

        if (!file) {
            throw new Error('Profile picture is required');
        }

        const request = new Requests({
            ...body,
            profilepicture: `/uploads/${file.filename}`, // Save file path
        });

        await request.save();

        res.status(201).json({
            message: 'Request created successfully',
            request,
        });
    } catch (err) {
        next(new AppError(`Error : ${err.message}`, 500));
    }
};
const getAllRequests = async (req, res, next) => {
    try {
        const { page = 1, limit = 10 } = req.query;
        const offset = (page - 1) * limit;

        const { count, rows: requests } = await Requests.findAndCountAll({
            limit: parseInt(limit, 10),
            offset: parseInt(offset, 10),
        });

        res.status(200).json({
            totalUsers: count,
            totalPages: Math.ceil(count / limit),
            currentPage: parseInt(page, 10),
            requests,
        });
    } catch (err) {
        next(new AppError(`Error : ${err.message}`, 500));
    }
}
export default { addrequest, getAllRequests };