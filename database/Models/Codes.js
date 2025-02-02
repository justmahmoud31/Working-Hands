import { DataTypes, Model } from "sequelize";
import sequelize from "../dbconnection.js";
class Codes extends Model { }
Codes.init({
    code: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
    },
    used: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
    },
    stock: {
        type: DataTypes.INTEGER,
        allowNull: false
    }
},{
    sequelize,
    modelName : "Codes"
});
export default Codes;