import { Op } from "sequelize";
import Requests from "../../../database/Models/requests.js";
import User from "../../../database/Models/user.js";
import { AppError } from "../../utils/AppError.js";
import bcrypt from 'bcrypt';
import fs from 'fs/promises';
import path from 'path';
import sendEmail from "../../utils/sendEmail.js";
const addrequest = async (req, res, next) => {
    try {
        const { body, file } = req;

        if (!file) {
            throw new Error('Profile picture is required');
        }

        // Check if email, username, phonenumber, or privatenumber already exists
        const existingUser = await User.findOne({
            where: {
                [Op.or]: [
                    { email: body.email },
                    { username: body.username },
                    { phonenumber: body.phonenumber },
                    { privatenumber: body.privatenumber }
                ]
            }
        });

        const existingRequest = await Requests.findOne({
            where: {
                [Op.or]: [
                    { email: body.email },
                    { username: body.username },
                    { phonenumber: body.phonenumber },
                    { privatenumber: body.privatenumber }
                ]
            }
        });

        if (existingUser || existingRequest) {
            throw new Error('Email, username, phone number, or private number already exists');
        }

        // Hash the password before saving
        const hashedPassword = await bcrypt.hash(body.password, 10); // Salt rounds = 10

        const request = await Requests.create({
            ...body,
            password: hashedPassword, // Store hashed password
            profilepicture: `/uploads/requests/${file.filename}`, // Save file path
        });

        res.status(201).json({
            message: 'Request created successfully',
            request,
        });
    } catch (err) {
        next(new AppError(`Error: ${err.message}`, 400)); // Change status code to 400 for validation errors
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
const acceptUser = async (req, res, next) => {
    try {
        const { id } = req.params;

        // 1️⃣ **Find the request by ID**
        const request = await Requests.findByPk(id);
        if (!request) {
            return res.status(404).json({ message: 'Request not found' });
        }

        // 2️⃣ **Check if the user already exists**
        const existingUser = await User.findOne({
            where: {
                [Op.or]: [
                    { email: request.email },
                    { username: request.username },
                    { privatenumber: request.privatenumber }
                ]
            }
        });

        if (existingUser) {
            return res.status(400).json({ message: 'User with this email, username, or private number already exists' });
        }

        // 3️⃣ **Move Profile Picture (If Exists)**
        let newProfilePath = ''; // Default empty value

        if (request.profilepicture) {
            const oldPath = path.join(process.cwd(), 'uploads', 'requests', path.basename(request.profilepicture)); // Ensure correct path
            const newDir = path.join(process.cwd(), 'uploads', 'users');
            const newPath = path.join(newDir, path.basename(request.profilepicture));

            try {
                // Ensure `users` directory exists
                await fs.mkdir(newDir, { recursive: true });

                // Move the file
                await fs.rename(oldPath, newPath);

                // Update new profile picture path
                newProfilePath = `/uploads/users/${path.basename(request.profilepicture)}`;
            } catch (error) {
                console.error('🚨 Error moving file:', error);
                return res.status(500).json({ message: 'Error moving profile picture, but user was created' });
            }
        }
        // 4️⃣ **Create the new user**
        const user = await User.create({
            username: request.username,
            fullname: request.fullname,
            email: request.email,
            privatenumber: request.privatenumber,
            password: request.password,
            phonenumber: request.phonenumber,
            height: request.height || null,
            weight: request.weight || null,
            birthdate: request.birthdate,
            jobtitle: request.jobtitle,
            livesin: request.livesin,
            fathernumber: request.fathernumber || null,
            brothernumber: request.brothernumber || null,
            profilepicture: newProfilePath, // Assign new profile picture path
            role: 'user'
        });

        // 5️⃣ **Delete the request only if everything is successful**
        await request.destroy();
        await sendEmail(
            user.email,
            `عزيزي المستخدم,
        
        يسرّنا الترحيب بك في نظام الرصد الذكي.
        شكرًا لانضمامك إلينا، نحن سعداء بأن تكون جزءًا من مجتمعنا.
        
        لقد أتممت تسجيلك بنجاح، 
        والآن يمكنك بدء استخدام النظام والاستفادة من ميزاته بكل سهولة.
        
        إذا احتجت إلى أي مساعدة، 
        لا تتردد في التواصل معنا عبر الواتساب الخاص بالنظام، فنحن هنا لدعمك دائمًا.
        
        نتمنى لك تجربة رائعة ومثمرة مع نظام الرصد الذكي.
        
        مع أطيب التحيات،  
        فريق الدعم`
        );
        res.status(201).json({
            message: 'User accepted successfully',
            user,
        });

    } catch (err) {
        next(new AppError(`Error: ${err.message}`, 500));
    }
};


const rejectUser = async (req, res, next) => {
    try {
        const { id } = req.params;

        // Find request by ID
        const request = await Requests.findByPk(id);
        if (!request) {
            return res.status(404).json({ message: 'Request not found' });
        }

        // Define the profile picture path
        const imagePath = path.join(process.cwd(), request.profilepicture);

        // Try deleting the image if it exists
        try {
            await fs.unlink(imagePath); // Remove the image file
        } catch (fileErr) {
            console.warn(`Warning: Could not delete file ${imagePath} - ${fileErr.message}`);
        }

        // Delete the request from the database
        await request.destroy();

        res.status(200).json({
            message: 'User request rejected and deleted successfully',
        });

    } catch (err) {
        next(new AppError(`Error: ${err.message}`, 500));
    }
};
const requestsCount = async (req, res, next) => {
    try {
        const requests = await Requests.findAll();
        const count = requests.length
        res.status(200).json({
            "Message": "Success",
            count
        })
    } catch (err) {
        next(new AppError(`Error: ${err.message}`, 500));
    }
}
export default { addrequest, getAllRequests, acceptUser, rejectUser, requestsCount };