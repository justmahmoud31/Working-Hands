import { DataTypes, Model } from "sequelize";
import sequelize from './../dbconnection.js';

class Requests extends Model { }
Requests.init({
    username: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
    },
    fullname: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
    },
    privatenumber: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
    },
    phonenumber: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
    },
    height: {
        type: DataTypes.DECIMAL,
        allowNull: false,
    },
    weight: {
        type: DataTypes.INTEGER,
        allowNull: true,
    },
    birthdate: {
        type: DataTypes.DATE,
        allowNull: false,
    },
    jobtitle: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    livesin: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    profilepicture: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    isApproved: {
        type: DataTypes.BOOLEAN,
        defaultValue: 0
    }
}, {
    sequelize, modelName: 'Requests'

});
export default Requests;