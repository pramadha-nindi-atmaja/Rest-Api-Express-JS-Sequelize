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

// Add a method to search contacts
Contact.search = async function(query) {
  return await Contact.findAll({
    where: {
      [Sequelize.Op.or]: [
        { firstName: { [Sequelize.Op.like]: `%${query}%` } },
        { lastName: { [Sequelize.Op.like]: `%${query}%` } },
        { email: { [Sequelize.Op.like]: `%${query}%` } },
        { phone: { [Sequelize.Op.like]: `%${query}%` } },
      ],
    },
    include: [{
      model: Address,
    }],
  });
};

// Add a method to get contact statistics
Contact.getStats = async function() {
  const totalContacts = await Contact.count();
  
  const contactsWithAddress = await Contact.count({
    include: [{
      model: Address,
      required: true
    }]
  });
  
  const addressTypes = await Address.findAll({
    attributes: [
      'addressType',
      [sequelize.fn('COUNT', sequelize.col('addressType')), 'count']
    ],
    group: ['addressType']
  });
  
  return {
    totalContacts,
    contactsWithAddress,
    addressTypes: addressTypes.map(item => ({
      type: item.addressType,
      count: item.get('count')
    }))
  };
};

// Add a method to get contacts with pagination
Contact.paginate = async function(page = 1, limit = 10, filters = {}) {
  const offset = (page - 1) * limit;
  
  // Build where clause from filters
  const whereClause = {};
  if (filters.firstName) {
    whereClause.firstName = { [Sequelize.Op.like]: `%${filters.firstName}%` };
  }
  if (filters.lastName) {
    whereClause.lastName = { [Sequelize.Op.like]: `%${filters.lastName}%` };
  }
  if (filters.email) {
    whereClause.email = { [Sequelize.Op.like]: `%${filters.email}%` };
  }
  
  const result = await Contact.findAndCountAll({
    where: whereClause,
    include: [{
      model: Address,
    }],
    limit: limit,
    offset: offset,
    order: [['createdAt', 'DESC']],
  });
  
  const totalPages = Math.ceil(result.count / limit);
  
  return {
    contacts: result.rows,
    pagination: {
      currentPage: page,
      totalPages: totalPages,
      totalCount: result.count,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1,
      limit: limit,
    }
  };
};

export default Contact;