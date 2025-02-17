import sequelize from "../../../database/dbconnection.js";
import EditRequests from "../../../database/Models/editRequests.js";
import User from "../../../database/Models/user.js";
import { AppError } from "../../utils/AppError.js";
import Codes from './../../../database/Models/Codes.js';

const addEditRequest = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const { fullname, livesin, ...otherFields } = req.body;
        const profilePicturePath = req.file ? `/uploads/users/${req.file.filename}` : null;

        // If no changes are requested
        if (!fullname && !livesin && Object.keys(otherFields).length === 0 && !profilePicturePath) {
            return res.status(400).json({ message: "No changes requested" });
        }

        // Update profile picture if uploaded
        if (profilePicturePath) {
            await User.update({ profilepicture: profilePicturePath }, { where: { id: userId } });
        }

        // Update other fields directly (except fullname & livesin)
        if (Object.keys(otherFields).length > 0) {
            await User.update(otherFields, { where: { id: userId } });
        }

        // If fullname or livesin is changing, add an admin approval request
        if (fullname || livesin) {
            const request = await EditRequests.create({
                userId,
                fullname: fullname || null,
                livesin: livesin || null,
                status: "pending",
            });

            return res.status(201).json({
                message: "Request submitted for admin approval",
                request,
            });
        }

        res.status(200).json({ message: "Profile updated successfully" });
    } catch (err) {
        next(new AppError(`Error: ${err.message}`, 500));
    }
};
const approveByCode = async (req, res, next) => {
    const transaction = await sequelize.transaction(); // Start transaction
    try {
        const { id } = req.params;
        const { code } = req.body;

        // Check if the code exists
        const existingCode = await Codes.findOne({ where: { code }, transaction });
        if (!existingCode) {
            await transaction.rollback(); // Rollback transaction
            return next(new AppError('Invalid code provided', 400));
        }

        // Find the record that needs approval
        const record = await EditRequests.findByPk(id, { transaction });
        if (!record) {
            await transaction.rollback(); // Rollback transaction
            return next(new AppError('Record not found', 404));
        }

        // Apply the requested update (e.g., approving the record)
        await User.update(
            { fullname: record.fullname, livesin: record.livesin },
            { where: { id: record.userId }, transaction }
        );

        // Remove the edit request from the EditRequests table
        await record.destroy({ transaction });
        await existingCode.update(
            {
                used: existingCode.used + 1,
                stock: existingCode.stock - 1,
            },
            { transaction }
        );
        // Commit the transaction
        await transaction.commit();

        // Respond with success
        res.status(200).json({ message: 'Record approved successfully' });
    } catch (error) {
        await transaction.rollback(); // Rollback transaction in case of error
        next(new AppError(`Error: ${error.message}`, 500));
    }
};

const getAllEditRequests = async (req, res, next) => {
    try {
        const requests = await EditRequests.findAll({
            where: { status: "pending" },
            include: { model: User, as: "user", attributes: ["id", "fullname", "livesin", "profilepicture", "privatenumber", "phonenumber"] },
        });

        res.status(200).json({ message: "Success", requests });
    } catch (err) {
        next(new AppError(`Error: ${err.message}`, 500));
    }
};
const acceptEditRequest = async (req, res, next) => {
    const transaction = await sequelize.transaction(); // Start transaction
    try {
        const { id } = req.params;
        const request = await EditRequests.findByPk(id, { transaction });

        if (!request || request.status !== "pending") {
            return res.status(404).json({ message: "Request not found or already processed" });
        }

        // Update user profile with requested changes
        await User.update(
            { fullname: request.fullname, livesin: request.livesin },
            { where: { id: request.userId }, transaction }
        );

        // Delete request after updating the user
        await request.destroy({ transaction });
        await transaction.commit(); // Commit transaction

        res.status(200).json({ message: "Request approved, profile updated and removed from requests" });
    } catch (err) {
        await transaction.rollback(); // Rollback if there's an error
        next(new AppError(`Error: ${err.message}`, 500));
    }
};

const rejectEditRequest = async (req, res, next) => {
    try {
        const { id } = req.params;
        const request = await EditRequests.findByPk(id);

        if (!request || request.status !== "pending") {
            return res.status(404).json({ message: "Request not found or already processed" });
        }

        // Delete the request from the database
        await request.destroy();

        res.status(200).json({ message: "Request rejected and removed from database" });
    } catch (err) {
        next(new AppError(`Error: ${err.message}`, 500));
    }
};
const getEditRequestsCount = async (req, res, next) => {
    try {
        const editRequests = await EditRequests.findAll({ where: { status: "pending" }, });
        const count = editRequests.length;
        res.status(200).json({
            "Message": "Success",
            count
        })
    } catch (err) {
        next(new AppError(`Error: ${err.message}`, 500));
    }
}
export default { getAllEditRequests, addEditRequest, acceptEditRequest, rejectEditRequest, getEditRequestsCount, approveByCode };      