import sequelize from "../utils/db.js"; // Import the sequelize instance
import Contact from "./contactModel.js"; // Import the Contact model
import { Sequelize } from "sequelize"; // Import Sequelize to use its data types

// Define the Address model
const Address = sequelize.define(
  "Address",
  {
    addressId: {
      type: Sequelize.INTEGER, // Define addressId as an integer
      primaryKey: true, // Set addressId as the primary key
      autoIncrement: true, // Enable auto-increment for addressId
      allowNull: false, // Disallow null values for addressId
    },
    addressType: {
      type: Sequelize.STRING, // Define addressType as a string
      allowNull: false, // Disallow null values for addressType
    },
    street: {
      type: Sequelize.STRING, // Define street as a string
      allowNull: false, // Disallow null values for street
    },
    city: {
      type: Sequelize.STRING, // Define city as a string
    },
    province: {
      type: Sequelize.STRING, // Define province as a string
    },
    country: {
      type: Sequelize.STRING, // Define country as a string
    },
    zipCode: {
      type: Sequelize.STRING, // Define zipCode as a string
    },
  },
  {
    tableName: "address", // Specify the table name as "address"
    underscored: true, // Enable underscored option for snake_case columns
  }
);

// Define the relationship between Contact and Address models
Contact.hasMany(Address, {
  foreignKey: "contactId", // Use contactId as the foreign key in Address model
  onDelete: "RESTRICT", // Restrict deletion of Contact if there are associated Address records
  onUpdate: "RESTRICT", // Restrict updating of Contact if there are associated Address records
});

Address.belongsTo(Contact, {
  foreignKey: "contactId", // Use contactId as the foreign key in Address model
  onDelete: "RESTRICT", // Restrict deletion of Address if associated with a Contact
  onUpdate: "RESTRICT", // Restrict updating of Address if associated with a Contact
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

// Sync the Address model with the database
sequelize
  .sync()
  .then(() => {
    console.log("Address model synced successfully.");
  })
  .catch((error) => {
    console.error("Error syncing the Address model:", error.message);
  });

// Add a method to get address statistics
Address.getStats = async function() {
  const totalAddresses = await Address.count();
  
  const addressTypes = await Address.findAll({
    attributes: [
      'addressType',
      [sequelize.fn('COUNT', sequelize.col('addressType')), 'count']
    ],
    group: ['addressType']
  });
  
  return {
    totalAddresses,
    addressTypes: addressTypes.map(item => ({
      type: item.addressType,
      count: item.get('count')
    }))
  };
};

export default Address; // Export the Address model