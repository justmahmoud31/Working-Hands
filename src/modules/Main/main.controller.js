import sequelize from "../../../database/dbconnection.js";
import Main from "../../../database/Models/main.js"; // Import your Main model
import MainPictures from "../../../database/Models/MainPictures.js"; // Import MainPictures model
import { AppError } from "../../utils/AppError.js";
import removeUnusedFiles from "../../utils/removeUnusedFiles.js";

// Add Main Content
const addMainContent = async (req, res, next) => {
    try {
        const { title, description, pictureTitles } = req.body;

        // Parse pictureTitles as an array
        const titles = Array.isArray(pictureTitles) ? pictureTitles : JSON.parse(pictureTitles || "[]");

        if (!Array.isArray(titles)) {
            return next(new AppError("Invalid format: pictureTitles must be a JSON array.", 400));
        }

        // Create a new Main record
        const newMain = await Main.create({
            title,
            description,
        });

        // Process file uploads and associate them with the Main record
        const pictures = req.files.map((file, index) => ({
            title: titles[index] || "Untitled",
            url: file.path.replace(/\\/g, "/"),
            mainId: newMain.id, // Associate with the newly created Main record
        }));

        // Insert picture records into MainPictures table
        await MainPictures.bulkCreate(pictures);

        res.status(201).json({
            success: true,
            message: "Main content added successfully",
            data: newMain,
        });
    } catch (err) {
        next(err);
    }
};

// Get Main Content (Including Photos)
const getMainContent = async (req, res, next) => {
    try {
        // Fetch all main content records along with associated pictures
        const mainContent = await Main.findAll({
            include: {
                model: MainPictures,
                as: 'MainPictures', // Alias for the associated pictures
            },
        });

        res.status(200).json({
            Message: "Success",
            mainContent,
        });
    } catch (err) {
        next(new AppError(`Error: ${err.message}`, 500));
    }
};

// Update Main Content (Including Photos)
// Update Title and Description
const updateMainContentDetails = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { title, description } = req.body;

        // Find the main content by ID
        const mainContent = await Main.findByPk(id);
        if (!mainContent) {
            return next(new AppError("Main content not found", 404));
        }

        // Update the main content's title and description
        await mainContent.update({
            title: title || mainContent.title,
            description: description || mainContent.description,
        });

        res.status(200).json({
            success: true,
            message: "Main content title and description updated successfully",
            data: mainContent,
        });
    } catch (err) {
        next(err);
    }
};
// Update Images and Titles
const updateMainContentImages = async (req, res, next) => {
    try {
        const { id, imageId } = req.params; // Get content ID and image ID from the URL params
        const { pictureTitle } = req.body;

        // Find the main content by ID
        const mainContent = await Main.findByPk(id);
        if (!mainContent) {
            return next(new AppError("Main content not found", 404));
        }

        // Find the image to update by imageId
        const existingImage = await MainPictures.findOne({
            where: { id: imageId, mainId: mainContent.id },
        });

        if (!existingImage) {
            return next(new AppError("Image not found", 404));
        }

        // Process the new file upload and title
        const picture = req.files?.[0]; // Only handle one image per request
        if (!picture) {
            return next(new AppError("No image file provided", 400));
        }

        // Delete the old image file from the system (only delete the old image related to the imageId)
        removeUnusedFiles("uploads", [existingImage.url]); // Use the URL of the old image

        // Update the image in the database
        const updatedImage = await existingImage.update({
            title: pictureTitle || existingImage.title, // Update the title if provided
            url: picture.path.replace(/\\/g, "/"), // Update the file path
        });

        res.status(200).json({
            success: true,
            message: "Image updated successfully",
            data: updatedImage,
        });
    } catch (err) {
        next(err);
    }
};



// Delete Main Content (Including Associated Pictures)
const deleteMainContent = async (req, res, next) => {
    try {
        const { id } = req.params;

        // Find the main content by ID
        const mainContent = await Main.findByPk(id);
        if (!mainContent) {
            return next(new AppError("Main content not found", 404));
        }

        // Get associated pictures from MainPictures
        const mainPictures = await MainPictures.findAll({
            where: { mainId: id },
        });

        // Get the file paths associated with the content
        const filesToDelete = mainPictures.map((pic) => pic.url);

        // Delete associated pictures from MainPictures table
        await MainPictures.destroy({
            where: { mainId: id },
        });

        // Delete the main content
        await mainContent.destroy();

        // Optionally remove unused files (if stored on the server)
        removeUnusedFiles("uploads", filesToDelete);

        res.status(200).json({
            success: true,
            message: "Main content deleted successfully",
        });
    } catch (err) {
        next(err);
    }
};


export default { addMainContent, getMainContent, updateMainContentImages, updateMainContentDetails, deleteMainContent };
