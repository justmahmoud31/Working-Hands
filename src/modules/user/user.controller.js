import User from '../../../database/Models/user.js'; // Import your User model
import { AppError } from '../../utils/AppError.js';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { Op } from "sequelize";
import Requests from '../../../database/Models/requests.js';
import sendEmail from "../../utils/sendEmail.js";
import QRCode from 'qrcode';
import sharp from 'sharp';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
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
      role: "subadmin",
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
    const admins = await User.findAll({
      where: {
        role: {
          [Op.or]: ["admin", "subadmin"]
        }
      }
    });
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

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export const generateQRCode = async (req, res) => {
  try {
    const userId = req.user.id;

    // Fetch user to ensure they exist
    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Generate a JWT token for the user
    const token = jwt.sign({ id: userId }, process.env.JWT_SECRET);

    // Generate QR code as a buffer
    const qrCodeBuffer = await QRCode.toBuffer(token, {
      type: 'png',
      errorCorrectionLevel: 'H',
      width: 300,
    });

    // Path to the logo
    const logoPath = path.join(__dirname, '../public/logo.jpg');

    // Resize the logo to fit into the QR code
    const logoBuffer = await sharp(logoPath)
      .resize(60, 60)
      .toBuffer();

    // Composite the logo onto the center of the QR code
    const finalImage = await sharp(qrCodeBuffer)
      .composite([
        { input: logoBuffer, gravity: 'center' } // Centering the logo
      ])
      .png()
      .toBuffer();

    // Send the final image
    res.set('Content-Type', 'image/png');
    res.send(finalImage);

  } catch (error) {
    console.error("Error generating QR code:", error);
    res.status(500).json({ message: "Server error" });
  }
};
const getUserByQRCode = async (req, res) => {
  try {
    const { token } = req.params;

    // Verify the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findByPk(decoded.id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({
      user
    });
  } catch (error) {


    res.status(401).json({ message: "Invalid or expired QR code", error });
  }
};
const deleteAdmin = async (req, res, next) => {
  try {
    const { id } = req.params;
    const admin = await User.findByPk(id);
    await admin.destroy();
    res.status(201).json({
      "Message": "Deleted"
    })
  } catch (err) {
    next(new AppError(`Error: ${err.message}`, 500));
  }
}
const deleteUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    const user = await User.findByPk(id);
    await user.destroy();
    res.status(201).json({
      "Message": "Deleted"
    })
  } catch (err) {
    next(new AppError(`Error: ${err.message}`, 500));
  }
}
const checkUserEmailUsername = async (req, res, next) => {
  try {
    const { email, username } = req.body;

    if (!email && !username) {
      return res.status(400).json({ message: 'Email or username is required' });
    }

    // Check if email exists in User or Request table
    if (email) {
      const emailExistsInUser = await User.findOne({ where: { email } });
      const emailExistsInRequest = await Requests.findOne({ where: { email } });

      if (emailExistsInUser || emailExistsInRequest) {
        return res.status(400).json({ exists: true, message: 'Email already exists' });
      }
    }

    // Check if username exists in User or Request table
    if (username) {
      const usernameExistsInUser = await User.findOne({ where: { username } });
      const usernameExistsInRequest = await Requests.findOne({ where: { username } });

      if (usernameExistsInUser || usernameExistsInRequest) {
        return res.status(400).json({ exists: true, message: 'Username already exists' });
      }
    }

    return res.status(200).json({ exists: false, message: 'Email and username are available' });
  } catch (error) {
    console.error('Error checking email/username:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

// Check if private number or phone number exists
const checkPhonePrivateNumbers = async (req, res, next) => {
  try {
    const { privatenumber, phonenumber } = req.body;

    if (!privatenumber && !phonenumber) {
      return res.status(400).json({ message: 'Private number or phone number is required' });
    }

    // Check if phone number exists in User or Request table
    if (phonenumber) {
      const phoneExistsInUser = await User.findOne({ where: { phonenumber } });
      const phoneExistsInRequest = await Requests.findOne({ where: { phonenumber } });

      if (phoneExistsInUser || phoneExistsInRequest) {
        return res.status(400).json({ exists: true, message: 'Phone number already exists' });
      }
    }

    // Check if private number exists in User or Request table
    if (privatenumber) {
      const privateNumberExistsInUser = await User.findOne({ where: { privatenumber } });
      const privateNumberExistsInRequest = await Requests.findOne({ where: { privatenumber } });

      if (privateNumberExistsInUser || privateNumberExistsInRequest) {
        return res.status(400).json({ exists: true, message: 'Private number already exists' });
      }
    }

    return res.status(200).json({ exists: false, message: 'Phone number and private number are available' });
  } catch (error) {
    console.error('Error checking private/phone number:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};
export default {
  addUser,
  getAllAdmins,
  forgotPassword,
  resetPassword,
  getAllUsers,
  loginUser,
  getOneUser,
  getUsersData,
  getUsersCount,
  searchOnUser,
  logoutUser,
  addAdmin,
  generateQRCode,
  getUserByQRCode,
  deleteAdmin,
  checkUserEmailUsername,
  checkPhonePrivateNumbers,
  deleteUser
};