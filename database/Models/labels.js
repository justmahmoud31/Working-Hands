import { DataTypes } from 'sequelize';
import sequelize from '../dbconnection.js';

const Label = sequelize.define('Label', {
  label: {
    type: DataTypes.STRING,
    allowNull: false,
  },
});

export default Label;
