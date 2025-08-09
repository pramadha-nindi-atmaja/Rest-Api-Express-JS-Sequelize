import sequelize from "../utils/db.js";
import { Sequelize } from "sequelize";
import User from "./userModel.js";

const Contact = sequelize.define(
  "Contact",
  {
    contactId: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    firstName: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    lastName: {
      type: Sequelize.STRING,
    },
    fullName: {
      type: Sequelize.VIRTUAL,
      get() {
        return this.firstName + " " + this.lastName;
      },
    },
    email: {
      type: Sequelize.STRING,
      validate: {
        isEmail: true,
      },
      set(value) {
        this.setDataValue("email", value.toLowerCase());
      },
    },
    phone: {
      type: Sequelize.STRING,
    },
  },
  {
    tableName: "contact",
    underscored: true,
  }
);

// Relationship between User and Contact
User.hasMany(Contact, {
  foreignKey: "userId",
  onDelete: "RESTRICT",
  onUpdate: "RESTRICT",
});

Contact.belongsTo(User, {
  foreignKey: "userId",
  onDelete: "RESTRICT",
  onUpdate: "RESTRICT",
});

// Added function to test database connection
sequelize
  .authenticate()
  .then(() => {
    console.log("Database connection established successfully.");
  })
  .catch((error) => {
    console.error("Failed to connect to the database:", error.message);
  });

// Sync Contact model with the database
sequelize
  .sync()
  .then(() => {
    console.log("Contact model synced successfully.");
  })
  .catch((error) => {
    console.error("Error syncing the Contact model:", error.message);
  });

export default Contact;