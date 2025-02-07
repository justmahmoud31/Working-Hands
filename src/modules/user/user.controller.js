import User from '../../../database/Models/user.js'; // Import your User model
import { AppError } from '../../utils/AppError.js';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { Op } from "sequelize";
import Requests from '../../../database/Models/requests.js';
import sendEmail from "../../utils/sendEmail.js";
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
      where: { role: "user" }
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
const getUsersCount = async (req, res, next) => {
  try {
    const users = await User.findAll({ where: { role: "user" } });
    const count = users.length;
    res.status(200).json({
      "Message": "Success",
      usersCount: count,
    })
  } catch (err) {
    next(new AppError(`Error: ${err.message}`, 500));
  }
}
export const addAdmin = async (req, res) => {
  try {
    const {
      username,
      email,
      password,
      fullname,
      privatenumber,
      phonenumber,
      height,
      weight,
      birthdate,
      jobtitle,
      livesin,
      fathernumber,
      brothernumber,
    } = req.body;

    // Validate required fields
    if (
      !username ||
      !email ||
      !password ||
      !fullname ||
      !privatenumber ||
      !phonenumber ||
      !height ||
      !birthdate ||
      !jobtitle ||
      !livesin
    ) {
      return res.status(400).json({ error: "All required fields must be provided." });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create the new admin
    const newAdmin = await User.create({
      username,
      email,
      password: hashedPassword,
      fullname,
      privatenumber,
      phonenumber,
      height,
      weight: weight || null, // Allow null
      birthdate,
      jobtitle,
      livesin,
      fathernumber: fathernumber || null, // Allow null
      brothernumber: brothernumber || null, // Allow null
      role: "admin",
      modestatus: "offline",
    });

    res.json({ message: "Admin added successfully", admin: newAdmin });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

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

    // Check if the user exists in the Requests table
    const pendingRequest = await Requests.findOne({ where: { email } });
    if (pendingRequest) {
      return res.status(403).json({
        message: 'Your request is under review. Please wait 24-48 hours for approval.'
      });
    }
    // Find user by email in the Users table
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(401).json({ message: 'البريد الالكتروني او الرمز غير صحيح' });
    }
    // Compare hashed password with user input
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'البريد الالكتروني او الرمز غير صحيح' });
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );
    await user.update({ statusmode: "online" });
    res.status(200).json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
      }
    });

  } catch (err) {
    next(new AppError(`Error: ${err.message}`, 500));
  }
};
export const logoutUser = async (req, res) => {
  const userId = req.user.id;
  try {
    const user = await User.findByPk(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    // Update status to offline
    await user.update({ statusmode: "offline" });

    res.json({ message: "Logout successful" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const searchOnUser = async (req, res, next) => {
  try {
    const { privatenumber } = req.body;
    const user = await User.findOne({ where: { privatenumber } });
    if (!user) {
      next(new AppError("User Not Found", 404));
    }
    res.status(200).json({
      "Message": "User Found Successfully",
      user
    })
  } catch (err) {
    next(new AppError(`Error: ${err.message}`, 500));
  }
}
export const getAllAdmins = async (req, res) => {
  try {
    const admins = await User.findAll({ where: { role: "admin" } });
    res.status(200).json({
      "Message": "Success",
      admins
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();

// 🟢 1️⃣ Request Password Reset
export const forgotPassword = async (req, res) => {
  const { identifier } = req.body; // Can be email, username, or private number

  try {
    const user = await User.findOne({
      where: {
        [Op.or]: [{ email: identifier }, { username: identifier }, { privatenumber: identifier }],
      },
    });

    if (!user) return res.status(404).json({ message: "User not found" });

    // Generate OTP and expiration time (10 minutes)
    const otp = generateOTP();
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000);

    // Save OTP in the database
    user.otp = otp;
    user.otpExpires = otpExpires;
    await user.save();

    // Send OTP via email
    await sendEmail(
      user.email,
      "إعادة تعيين كلمة المرور - كود التحقق",
      `عزيزي ${user.username},
    
    لقد تلقينا طلبًا لإعادة تعيين كلمة المرور لحسابك. 
    يرجى استخدام رمز التحقق التالي لإكمال عملية إعادة التعيين:
    
    🔹 **رمز التحقق (OTP):** ${otp}
    
    يُرجى إدخال هذا الرمز خلال **10 دقائق**، وإلا فسيكون غير صالح.
    
    إذا لم تطلب إعادة تعيين كلمة المرور، يمكنك تجاهل هذا البريد الإلكتروني.
    
    مع تحياتنا،  
    فريق الدعم`
    );


    res.json({ message: "OTP sent to your email" });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// 🟢 2️⃣ Verify OTP and Reset Password
export const resetPassword = async (req, res) => {
  const { otp, newPassword } = req.body;

  try {
    const user = await User.findOne({ where: { otp } });

    if (!user || new Date() > new Date(user.otpExpires)) {
      return res.status(400).json({ message: "Invalid or expired OTP" });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password and clear OTP
    user.password = hashedPassword;
    user.otp = null;
    user.otpExpires = null;
    await user.save();

    res.json({ message: "Password reset successful" });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};
export default { addUser, getAllAdmins, forgotPassword, resetPassword, getAllUsers, loginUser, getOneUser, getUsersData, getUsersCount, searchOnUser, logoutUser, addAdmin };