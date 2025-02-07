import { Op } from "sequelize";
import fs from "fs/promises";
import path from "path";
import Codes from "../../../database/Models/Codes.js";
import Requests from "../../../database/Models/requests.js";
import User from "../../../database/Models/user.js";
import { AppError } from "../../utils/AppError.js";
import sequelize from "../../../database/dbconnection.js";

// ✅ Add New Code
const addCode = async (req, res, next) => {
    try {
        const { code } = await Codes.create(req.body);
        res.status(201).json({ message: "Success", code });
    } catch (err) {
        next(new AppError(`Error: ${err.message}`, 500));
    }
};

// ✅ Get All Codes
const getAllCodes = async (req, res, next) => {
    try {
        const allcodes = await Codes.findAll();
        res.status(200).json({ message: "Success", allcodes });
    } catch (err) {
        next(new AppError(`Error: ${err.message}`, 500));
    }
};

// ✅ Edit Number of Codes (Stock)
const editNumberOfCodes = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { newStock } = req.body;

        const code = await Codes.findByPk(id);
        if (!code) {
            return next(new AppError("Code Not Found", 404));
        }

        code.stock = newStock;
        code.used = 0;
        await code.save();

        res.status(200).json({ message: "Success", updatedCode: code });
    } catch (err) {
        next(new AppError(`Error: ${err.message}`, 500));
    }
};

// ✅ Delete Code
const deleteCode = async (req, res, next) => {
    try {
        const { id } = req.params;
        const code = await Codes.findByPk(id);

        if (!code) {
            return next(new AppError("Code Not Found", 404));
        }

        await code.destroy();
        res.status(204).json({ message: "Code Deleted Successfully" });
    } catch (err) {
        next(new AppError(`Error: ${err.message}`, 500));
    }
};

// ✅ Accept User by Code
const acceptUserByCode = async (req, res, next) => {
    const transaction = await sequelize.transaction(); // Start transaction
    try {
        const { id } = req.params;
        const { code } = req.body;

        // ✅ Find Request
        const request = await Requests.findByPk(id, { transaction });
        if (!request) {
            await transaction.rollback();
            return next(new AppError("Request Not Found", 404));
        }

        // ✅ Find Code
        const existingCode = await Codes.findOne({ where: { code }, transaction });
        if (!existingCode) {
            await transaction.rollback();
            return next(new AppError("Code Not Found", 404));
        }

        // ✅ Check Code Stock
        if (existingCode.stock <= 0) {
            await transaction.rollback();
            return next(new AppError("Code Stock Insufficient", 400));
        }

        // ✅ Check If User Already Exists
        const existingUser = await User.findOne({
            where: {
                [Op.or]: [
                    { email: request.email },
                    { username: request.username },
                    { privatenumber: request.privatenumber },
                ],
            },
            transaction,
        });

        if (existingUser) {
            await transaction.rollback();
            return res.status(400).json({ message: "User already exists with this email, username, or private number" });
        }

        // ✅ Move Profile Picture (If Exists)
        let newProfilePath = "";
        if (request.profilepicture) {
            const oldPath = path.join(process.cwd(), "uploads", "requests", path.basename(request.profilepicture));
            const newDir = path.join(process.cwd(), "uploads", "users");
            const newPath = path.join(newDir, path.basename(request.profilepicture));

            try {
                await fs.mkdir(newDir, { recursive: true });
                await fs.rename(oldPath, newPath);
                newProfilePath = `/uploads/users/${path.basename(request.profilepicture)}`;
            } catch (error) {
                console.error("🚨 Error moving file:", error);
                await transaction.rollback();
                return res.status(500).json({ message: "Error moving profile picture, but user was created" });
            }
        }

        // ✅ Create User
        const user = await User.create(
            {
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
                profilepicture: newProfilePath,
                role: "user",
            },
            { transaction }
        );

        // ✅ Update Code (Increase `used` +1, Decrease `stock` -1)
        await existingCode.update(
            {
                used: existingCode.used + 1,
                stock: existingCode.stock - 1,
            },
            { transaction }
        );

        // ✅ Delete Request After Success
        await request.destroy({ transaction });

        // ✅ Commit Transaction
        await transaction.commit();

        res.status(201).json({ message: "User accepted successfully", user });
    } catch (err) {
        await transaction.rollback();
        next(new AppError(`Error: ${err.message}`, 500));
    }
};

export default { addCode, deleteCode, getAllCodes, editNumberOfCodes, acceptUserByCode };
