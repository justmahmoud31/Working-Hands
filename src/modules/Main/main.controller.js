import fs from 'fs';
import path from 'path';
import Main from '../../../database/Models/main.js'; // Import your Main model
import MainPictures from '../../../database/Models/MainPictures.js'; // Import MainPictures model
import { AppError } from '../../utils/AppError.js';

// Add Main Content
const addMainContent = async (req, res, next) => {
    try {
        const { title, description, pictureTitles } = req.body;

        const titles = Array.isArray(pictureTitles) ? pictureTitles : JSON.parse(pictureTitles || '[]');

        if (!req.files || !req.files.mainpictures) {
            return next(new AppError('No files uploaded.', 400));
        }

        const files = req.files.mainpictures;

        // Create a new Main record
        const newMain = await Main.create({
            title,
            description,
        });

        const pictures = files.map((file, index) => ({
            title: titles[index] || 'Untitled',
            url: file.path.replace(/\\/g, '/'), // Save the file path
            mainId: newMain.id, // Associate with the newly created Main record
        }));

        await MainPictures.bulkCreate(pictures);

        res.status(201).json({
            success: true,
            message: 'Main content added successfully',
            data: newMain,
        });
    } catch (err) {
        next(err);
    }
};

// Get Main Content
const getMainContent = async (req, res, next) => {
    try {
        const mainContent = await Main.findAll({
            include: {
                model: MainPictures,
                as: 'MainPictures',
            },
        });

        res.status(200).json({
            success: true,
            data: mainContent,
        });
    } catch (err) {
        next(new AppError(`Error: ${err.message}`, 500));
    }
};

// Update Main Content Details
const updateMainContentDetails = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { title, description } = req.body;

        const mainContent = await Main.findByPk(id);
        if (!mainContent) {
            return next(new AppError('Main content not found', 404));
        }

        await mainContent.update({
            title: title || mainContent.title,
            description: description || mainContent.description,
        });

        res.status(200).json({
            success: true,
            message: 'Main content updated successfully',
            data: mainContent,
        });
    } catch (err) {
        next(err);
    }
};

// Update Images and Titles
const updateMainContentImages = async (req, res, next) => {
    try {
        const { id, imageId } = req.params;
        const { pictureTitle } = req.body;

        const mainContent = await Main.findByPk(id);
        if (!mainContent) {
            return next(new AppError('Main content not found', 404));
        }

        const existingImage = await MainPictures.findOne({
            where: { id: imageId, mainId: id },
        });

        if (!existingImage) {
            return next(new AppError('Image not found', 404));
        }

        const picture = req.files?.mainpictures?.[0];
        if (!picture) {
            return next(new AppError('No new image file provided', 400));
        }
        // Delete the old image file
        const uploadDir = 'uploads/main';
        const oldFilePath = path.join(uploadDir, path.basename(existingImage.url));
        if (fs.existsSync(oldFilePath)) {
            fs.unlinkSync(oldFilePath);
        }

        const updatedImage = await existingImage.update({
            title: pictureTitle || existingImage.title,
            url: picture.path.replace(/\\/g, '/'),
        });

        res.status(200).json({
            success: true,
            message: 'Image updated successfully',
            data: updatedImage,
        });
    } catch (err) {
        next(err);
    }
};

// Delete Main Content
const deleteMainContent = async (req, res, next) => {
    try {
        const { id } = req.params;

        const mainContent = await Main.findByPk(id);
        if (!mainContent) {
            return next(new AppError('Main content not found', 404));
        }

        const mainPictures = await MainPictures.findAll({
            where: { mainId: id },
        });

        const filesToDelete = mainPictures.map((pic) => path.basename(pic.url));
        const uploadDir = 'uploads/main';

        filesToDelete.forEach((file) => {
            const filePath = path.join(uploadDir, file);
            if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
            }
        });

        await MainPictures.destroy({ where: { mainId: id } });
        await mainContent.destroy();

        res.status(200).json({
            success: true,
            message: 'Main content and associated images deleted successfully',
        });
    } catch (err) {
        next(err);
    }
};

export default {
    addMainContent,
    getMainContent,
    updateMainContentImages,
    updateMainContentDetails,
    deleteMainContent,
};
