import multer from 'multer';
import { v4 as uuidv4 } from 'uuid';

// Reusable function to configure Multer with a dynamic folder name
export const fileUpload = (folderName) => {
  const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, `uploads/${folderName}`); // Set the destination folder dynamically
    },
    filename: (req, file, cb) => {
      cb(null, uuidv4() + '-' + file.originalname); // Generate a unique filename
    },
  });

  const fileFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('image')) {
      cb(null, true); // Accept the file
    } else {
      cb(new Error('Only images are allowed'), false); // Reject the file
    }
  };

  return multer({ storage, fileFilter });
};

// Helper function for single file upload
export const singleFile = (fieldName, folderName) => {
  return fileUpload(folderName).single(fieldName);
};

// Helper function for multiple file uploads
export const mixedFiles = (arrayOfFields, folderName) => {
  return fileUpload(folderName).fields(arrayOfFields);
};