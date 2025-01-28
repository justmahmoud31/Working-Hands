import { DataTypes, Model } from "sequelize";
import sequelize from "../dbconnection.js"; // Import your Sequelize instance

class Main extends Model {}

Main.init(
    {
        title: {
            type: DataTypes.STRING,
        },
        description: {
            type: DataTypes.STRING,
        },
    },
    {
        sequelize, // Pass the Sequelize instance
        modelName: "Main", // Name of the model
    }
);

export default Main;
