import { DataTypes, Model } from "sequelize";
import sequelize from "./../dbconnection.js";
import User from "./user.js"; // Import User model for association

class EditRequests extends Model {}

EditRequests.init(
  {
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: User,
        key: "id",
      },
      onDelete: "CASCADE",
    },
    fullname: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    livesin: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    otherFields: {
      type: DataTypes.JSON, // Stores other editable fields (except fullname, livesin)
      allowNull: true,
    },
    status: {
      type: DataTypes.ENUM("pending", "approved", "rejected"),
      defaultValue: "pending",
    },
  },
  { sequelize, modelName: "EditRequests" }
);

// Association: EditRequests belongs to a User
EditRequests.belongsTo(User, { foreignKey: "userId", as: "user" });
User.hasMany(EditRequests, { foreignKey: "userId", as: "editRequests" });

export default EditRequests;
