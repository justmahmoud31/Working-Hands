import fs from "fs";
import path from "path";

/**
 * Utility function to remove unused files from the upload directory.
 * @param {string} uploadDir - Path to the directory where files are uploaded.
 * @param {string[]} usedFiles - Array of file paths currently in use (e.g., from the database).
 */
const removeUnusedFiles = (uploadDir, usedFiles) => {
    // Read all files in the upload directory
    fs.readdir(uploadDir, (err, files) => {
        if (err) {
            console.error("Error reading upload directory:", err);
            return;
        }

        // Filter out files that are not in use
        const unusedFiles = files.filter((file) => {
            const filePath = path.join(uploadDir, file);
            return !usedFiles.includes(filePath); // File is not in use
        });

        // Only delete the file that is being replaced (old image)
        if (usedFiles && usedFiles.length > 0) {
            // Fix: Ensure only one "uploads/" is added
            const oldFilePath = path.join(uploadDir, usedFiles[0]);

            console.log("Deleting this file: ", oldFilePath);

            fs.unlink(oldFilePath, (err) => {
                if (err) {
                    console.error("Error deleting file:", oldFilePath, err);
                } else {
                    console.log("Deleted old file:", oldFilePath);
                }
            });
        }

        // Optional: Log remaining files that were not deleted
        unusedFiles.forEach((file) => {
            const filePath = path.join(uploadDir, file);
            console.log("Unused file, but not deleted:", filePath);
        });
    });
};

export default removeUnusedFiles;
