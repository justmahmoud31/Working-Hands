// models/CodeUsers.js
import { DataTypes, Model } from "sequelize";
import sequelize from "../dbconnection.js";

class CodeUsers extends Model {}

CodeUsers.init(
  {
    codeId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "Codes",
        key: "id",
      },
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "Users",
        key: "id",
      },
    },
  },
  {
    sequelize,
    modelName: "CodeUsers",
  }
);

export default CodeUsers;
