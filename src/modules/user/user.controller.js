import User from '../../../database/Models/user.js'; // Import your User model
import { AppError } from '../../utils/AppError.js';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
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
const getUsersCount = async (req,res,next)=>{
  try {
    const users = await User.findAll();
    const count = users.length;
    res.status(200).json({
      "Message" : "Success",
      usersCount : count,
    })
  } catch (err) {
    next(new AppError(`Error: ${err.message}`, 500));
  }
}
const getOneUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({ message: 'User Not Found' });
    }
    res.status(200).json({
      "Message": "Succes",
      user
    })
  } catch (err) {
    next(new AppError(`Error: ${err.message}`, 500));
  }
}
const getUsersData = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const user = await User.findOne({ where: { id: userId } });

    if (!user) {
      return next(new AppError('User not found', 404)); // Return 404 if the user doesn't exist
    }

    // Return the user data (excluding sensitive information)
    res.status(200).json({
      message: 'User data retrieved successfully',
      user
    });
  } catch (err) {
    next(new AppError(`Error: ${err.message}`, 500));
  }
}
const loginUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Check if email and password are provided
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    // Find user by email
    const user = await User.findOne({ where: { email } });

    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }
    // Compare hashed password with user input
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid password' });
    }
    const payload = { id: user.id, role: user.role };
    console.log('JWT Payload:', payload);
    // Generate JWT token
    const token = jwt.sign(
      { id: user.id, role: user.role }, // Include user role
      process.env.JWT_SECRET, // Secret key from .env
      { expiresIn: '7d' } // Token expires in 7 days
    );
    res.status(200).json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role, // Send role in response
      }
    });

  } catch (err) {
    next(new AppError(`Error: ${err.message}`, 500));
  }
};
export default { addUser, getAllUsers, loginUser, getOneUser ,getUsersData,getUsersCount};