import Articls from "../../../database/Models/Articls.js"
import { AppError } from "../../utils/AppError.js";

const addNewContent = async (req, res, next) => {
    try {
        const { text } = await Articls.create(req.body);
        res.status(201).json({
            "Message": "Success",
            text
        });
    } catch (err) {
        next(new AppError(`Error ${err.message}`, 500));
    }
}
const getOneContent = async (req, res, next) => {
    try {
        const { id } = req.params;
        const content = await Articls.findByPk(id);
        res.status(200).json({
            "Message": "success",
            content
        })
    } catch (err) {
        next(new AppError(`Error ${err.message}`, 500));
    }
};
const editcontent = async (req, res, next) => {
    try {
        const { id } = req.params;
        const content = await Articls.findByPk(id);

        if (!content) {
            return next(new AppError("Not Found", 404));
        }

        const { newContent } = req.body;
        if (!newContent) {
            return next(new AppError("Content cannot be empty", 400));
        }

        content.text = newContent;
        await content.save();
        res.status(200).json({ message: "Content updated successfully", content });
    } catch (err) {
        next(new AppError(`Error: ${err.message}`, 500));
    }
};


export default { getOneContent, addNewContent, editcontent };