
import { Model, DataTypes } from 'sequelize';
import sequelize from './../dbconnection.js';

class User extends Model { }
User.init(
  {
    username: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    profilepicture: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    fullname: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    status: {
      type: DataTypes.STRING,
      allowNull: true,
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
    fathernumber: {
      type: DataTypes.STRING,
      allowNull: true,
      unique: true,
    },
    brothernumber: {
      type: DataTypes.STRING,
      allowNull: true,
      unique: true,
    },
    statusmode: {
      type: DataTypes.ENUM("online", "offline"),
      allowNull: false,
      defaultValue: "offline",
    },
    role: {
      type: DataTypes.STRING, // or DataTypes.ENUM('user', 'admin') if you want predefined roles
      allowNull: false,
      defaultValue: 'user', // Default role if not specified
    },
    otp: {
      type: DataTypes.STRING,
      allowNull: true
    },
    otpExpires: {
      type: DataTypes.DATE,
      allowNull: true
    },
  },
  { sequelize, modelName: 'User' }
);

export default User;
