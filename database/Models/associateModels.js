import Codes from "./Codes.js";
import User from "./user.js";
import CodeUsers from "./CodeUsers.js";

// ✅ Define associations
Codes.belongsToMany(User, { through: CodeUsers, foreignKey: "codeId" });
User.belongsToMany(Codes, { through: CodeUsers, foreignKey: "userId" });
