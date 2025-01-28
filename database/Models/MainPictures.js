import { DataTypes, Model } from "sequelize";
import sequelize from "../dbconnection.js";
import Main from "./main.js"; // Import the Main model

class MainPictures extends Model {}

MainPictures.init(
    {
        title: {
            type: DataTypes.STRING,
        },
        url: {
            type: DataTypes.STRING,
        },
        mainId: {
            type: DataTypes.INTEGER,
            references: {
                model: Main, // This model refers to Main
                key: 'id',
            },
        },
    },
    {
        sequelize,
        modelName: "MainPictures", // Name of the model
    }
);

// Establish relationship: A Main can have many MainPictures
Main.hasMany(MainPictures, { foreignKey: 'mainId' });
MainPictures.belongsTo(Main, { foreignKey: 'mainId' });

export default MainPictures;
