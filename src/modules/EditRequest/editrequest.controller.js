import EditRequests from "../../../database/Models/editRequests.js";
import User from "../../../database/Models/user.js";
import { AppError } from "../../utils/AppError.js";

const addEditRequest = async (req, res, next) => {
    try {
        const userId = req.user.id; // Get user ID from token
        const { fullname, livesin, ...otherFields } = req.body;

        // If no changes are requested
        if (!fullname && !livesin && Object.keys(otherFields).length === 0) {
            return res.status(400).json({ message: "No changes requested" });
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
const getAllEditRequests = async (req, res, next) => {
    try {
        const requests = await EditRequests.findAll({
            where: { status: "pending" },
            include: { model: User, as: "user", attributes: ["id", "username", "email"] },
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

export default { getAllEditRequests, addEditRequest, acceptEditRequest, rejectEditRequest };      