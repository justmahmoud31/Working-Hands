import { DataTypes, Model } from "sequelize";
import sequelize from './../dbconnection.js';

class Articls extends Model { }
Articls.init({
    text: {
        type: DataTypes.TEXT,
        allowNull: true,
    },

}, {
    sequelize,
    modelName: 'Articls',
});
export default Articls;