import Requests from "../../../database/Models/requests.js";
import User from "../../../database/Models/user.js";
import { AppError } from "../../utils/AppError.js";
import bcrypt from 'bcrypt';
import fs from 'fs/promises';
import path from 'path';
const addrequest = async (req, res, next) => {
    try {
        const { body, file } = req;

        if (!file) {
            throw new Error('Profile picture is required');
        }

        // Hash the password before saving
        const hashedPassword = await bcrypt.hash(body.password, 10); // Salt rounds = 10

        const request = new Requests({
            ...body,
            password: hashedPassword, // Store hashed password
            profilepicture: `/uploads/requests/${file.filename}`, // Save file path
        });

        await request.save();

        res.status(201).json({
            message: 'Request created successfully',
            request,
        });
    } catch (err) {
        next(new AppError(`Error: ${err.message}`, 500));
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

        // Find request by ID
        const request = await Requests.findByPk(id);
        if (!request) {
            return res.status(404).json({ message: 'Request not found' });
        }

        // Fix profile picture paths
        const oldPath = path.join(process.cwd(), request.profilepicture); // Absolute path to the file
        const newDir = path.join(process.cwd(), 'uploads', 'users'); // Ensure this folder exists
        const newPath = path.join(newDir, path.basename(request.profilepicture));

        // Ensure the new directory exists
        await fs.mkdir(newDir, { recursive: true });

        // Move the profile picture from "requests" to "users" folder
        await fs.rename(oldPath, newPath);

        // Create a new user with request data
        const user = await User.create({
            username: request.username,
            fullname: request.fullname,
            email: request.email,
            privatenumber: request.privatenumber,
            password: request.password,
            phonenumber: request.phonenumber,
            height: request.height,
            weight: request.weight,
            birthdate: request.birthdate,
            jobtitle: request.jobtitle,
            livesin: request.livesin,
            fathernumber: request.fathernumber || null,
            brothernumber: request.brothernumber || null,
            profilepicture: `/uploads/users/${path.basename(request.profilepicture)}`, // New image path
        });

        // Remove request after successful user creation
        await request.destroy();

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
export default { addrequest, getAllRequests, acceptUser, rejectUser , requestsCount };