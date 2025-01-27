import User from '../../../database/Models/user.js';
import { AppError } from './../../utils/AppError.js';
const addUser = async (req, res, next) => {
    try {
        const { body, file } = req;

        if (!file) {
            throw new Error('Profile picture is required');
        }

        const user = new User({
            ...body,
            profilepicture: `/uploads/${file.filename}`, // Save file path
        });

        await user.save();

        res.status(201).json({
            message: 'User created successfully',
            user,
        });
    } catch (err) {
        next(new AppError(`Error: ${err.message}`, 500));
    }
};
const getAllUsers = async (req, res, next) => {
    try {
        const { page = 1, limit = 10 } = req.query;
        const offset = (page - 1) * limit;

        const { count, rows: users } = await User.findAndCountAll({
            limit: parseInt(limit, 10),
            offset: parseInt(offset, 10),
        });

        res.status(200).json({
            totalUsers: count,
            totalPages: Math.ceil(count / limit),
            currentPage: parseInt(page, 10),
            users,
        });
    } catch (err) {
        next(new AppError(`Error: ${err.message}`, 500));
    }
};

export default { addUser, getAllUsers };