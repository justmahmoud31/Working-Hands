import Ads from '../../../database/Models/ads.js';
import AdImages from '../../../database/Models/AdImages.js';
import { AppError } from '../../utils/AppError.js';
import fs from 'fs';
import path from 'path';
// Add a new ad with multiple images
const addAd = async (req, res, next) => {
    try {
        const { title, link } = req.body;

        if (!req.file) {
            throw new AppError('Photo is required', 400);
        }

        // Ensure only one ad exists
        let ad = await Ads.findOne();
        if (!ad) {
            ad = await Ads.create({ title });
        } else {
            await ad.update({ title }); // Update existing title
        }

        // Save image and link
        const imageEntry = await AdImages.create({
            photo: `/uploads/ads/${req.file.filename}`,
            link: link,
            adId: ad.id,
        });

        res.status(201).json({
            message: 'Ad updated successfully',
            ad,
            image: imageEntry,
        });
    } catch (err) {
        next(new AppError(`Error: ${err.message}`, 500));
    }
};


// Get all ads with their images
const getAds = async (req, res, next) => {
    try {
        const ad = await Ads.findOne({
            include: { model: AdImages, as: 'images' },
        });

        if (!ad) {
            return res.status(404).json({ message: 'No ads found' });
        }

        res.status(200).json({ ad });
    } catch (err) {
        next(new AppError(`Error: ${err.message}`, 500));
    }
};
const editAd = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { title, link } = req.body;
        const adImage = await AdImages.findByPk(id);
        if (!adImage) {
            throw new AppError('Ad not found', 404);
        }

        let oldPhotoPath = adImage.photo ? path.join(process.cwd(),adImage.photo) : null;
   
        
        // If a new photo is uploaded, delete the old one
        if (req.file) {
            if (oldPhotoPath && fs.existsSync(oldPhotoPath)) {
                fs.unlinkSync(oldPhotoPath);
            }

            adImage.photo = `/uploads/ads/${req.file.filename}`;
        }

        if (title) {
            const ad = await Ads.findByPk(adImage.adId);
            if (ad) {
                ad.title = title;
                await ad.save();
            }
        }

        if (link) {
            adImage.link = link;
        }

        await adImage.save();

        res.status(200).json({
            message: 'Ad updated successfully',
            adImage,
        });
    } catch (err) {
        next(new AppError(`Error: ${err.message}`, 500));
    }
};
const deleteAd = async (req, res, next) => {
    try {
      const { id } = req.params;
  
      const adImage = await AdImages.findByPk(id);
      if (!adImage) {
        throw new AppError('Ad not found', 404);
      }
  
      let photoPath = adImage.photo ? path.join(process.cwd(),adImage.photo) : null;
  
      // Delete the photo file from storage
      if (photoPath && fs.existsSync(photoPath)) {
        fs.unlinkSync(photoPath);
      }
  
      await adImage.destroy();
  
      res.status(200).json({
        message: 'Ad deleted successfully',
      });
    } catch (err) {
      next(new AppError(`Error: ${err.message}`, 500));
    }
  };
export default { addAd, getAds ,editAd,deleteAd};
