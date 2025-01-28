import User from '../../../database/Models/user.js'; // Import your User model
import { AppError } from '../../utils/AppError.js';

// Add User
const addUser = async (req, res, next) => {
  try {
    const { body, file } = req;

    if (!file) {
      throw new Error('Profile picture is required');
    }

    // Create a new user with the profile picture path
    const user = new User({
      ...body,
      profilepicture: file.path.replace(/\\/g, '/'), // Save the file path
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

// Get All Users
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