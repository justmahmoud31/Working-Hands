import Label from '../../../database/Models/labels.js';
import { AppError } from '../../utils/AppError.js';

// Get all labels
const getLabels = async (req, res, next) => {
    try {
        const labels = await Label.findAll();
        res.status(200).json(labels);
    } catch (err) {
        next(new AppError(`Error: ${err.message}`, 500));
    }
};
const addLabel = async (req, res, next) => {
    try {
        const { label } = req.body; // Ensure the request body contains 'field' and 'label'

        // Create a new label
        const newLabel = await Label.create({ label });

        res.status(201).json({
            message: "Label created successfully",
            newLabel
        });
    } catch (err) {
        next(new AppError(`Error: ${err.message}`, 500));
    }
};

// Update or create labels
const updateLabels = async (req, res, next) => {
    try {
        const { id } = req.params; // Get the id from the request parameters
        const { newlabel } = req.body; // Expect the new label value in the request body

        // Find the label by its ID
        const label = await Label.findByPk(id);
        
        if (!label) {
            return next(new AppError('Label not found', 404)); // Return 404 if label doesn't exist
        }

        // Update the label with the new value
        label.label = newlabel;

        // Save the updated label to the database
        await label.save();

        res.status(200).json({
            message: 'Label updated successfully',
            updatedLabel: label
        });
    } catch (err) {
        next(new AppError(`Error: ${err.message}`, 500));
    }
};

export default { updateLabels, getLabels, addLabel };