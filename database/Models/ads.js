import { DataTypes, Model } from 'sequelize';
import sequelize from './../dbconnection.js';

class Ads extends Model {}

Ads.init(
  {
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  {
    sequelize,
    modelName: 'Ads',
  }
);

export default Ads;
