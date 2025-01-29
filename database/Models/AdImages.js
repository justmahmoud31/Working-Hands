import { DataTypes, Model } from 'sequelize';
import sequelize from './../dbconnection.js';
import Ads from './ads.js'; // Import Ads model

class AdImages extends Model {}

AdImages.init(
  {
    photo: {
      type: DataTypes.STRING,
      allowNull: false, // Store file path
    },
    link: {
      type: DataTypes.STRING,
      allowNull: false, // URL for redirection
    },
    adId: {
      type: DataTypes.INTEGER,
      references: {
        model: Ads,
        key: 'id',
      },
      onDelete: 'CASCADE',
    },
  },
  {
    sequelize,
    modelName: 'AdImages',
  }
);

// Define the relationship
Ads.hasMany(AdImages, { foreignKey: 'adId', as: 'images' });
AdImages.belongsTo(Ads, { foreignKey: 'adId' });

export default AdImages;
