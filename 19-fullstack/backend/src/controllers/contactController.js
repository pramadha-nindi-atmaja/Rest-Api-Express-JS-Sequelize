import { Op } from "sequelize";
import Address from "../models/addressModel.js";
import Contact from "../models/contactModel.js";
import sequelize from "../utils/db.js";
import { dataValid } from "../validation/dataValidation.js";
import { isExists } from "../validation/sanitization.js";

const setContact = async (req, res, next) => {
  const t = await sequelize.transaction();
  try {
    let lstError = [];
    // dapatkan data dari post
    let contact = req.body;
    let address = [];
    if (isExists(contact.Addresses)) {
      address = contact.Addresses;
    }
    delete contact.Addresses;
    // rule validasi contact
    const validContact = {
      firstName: "required",
    };
    contact = await dataValid(validContact, contact);
    lstError.push(...contact.message);
    // rule validasi address
    let dtl = await Promise.all(
      address.map(async (item) => {
        const addressClear = await dataValid(
          {
            addressType: "requered",
            street: "requered",
          },
          item
        );
        lstError.push(...addressClear.message);
        return addressClear.data;
      })
    );

    contact = {
      ...contact.data,
      userId: req.user.userId,
      Addresses: dtl,
    };

    // jika ada error kirimkan pesan
    if (lstError.length > 0) {
      return res.status(400).json({
        errors: lstError,
        message: "Create Contact field",
        data: contact,
      });
    }

    // jika tidak ada error
    const createContact = await Contact.create(contact, { transaction: t });
    const createAddress = await Promise.all(
      contact.Addresses.map(async (item) => {
        return await Address.create(
          {
            ...item,
            contactId: createContact.contactId,
          },
          {
            transaction: t,
          }
        );
      })
    );
    if (!createContact || !createAddress) {
      await t.rollback();
      return res.status(400).json({
        errors: ["Contact not found"],
        message: "Create Contact field",
        data: contact,
      });
    }
    await t.commit();
    return res.status(201).json({
      errors: [],
      message: "Contact created successfully",
      data: { ...createContact.dataValues, address: createAddress },
    });
  } catch (error) {
    await t.rollback();
    next(
      new Error(
        "controllers/contactController.js:setContact - " + error.message
      )
    );
  }
};

const getContact = async (req, res, next) => {
  try {
    // persiapan filter
    const contacts = req.body;
    let address = [];
    if (isExists(contacts.Addresses)) {
      address = contacts.Addresses;
      delete contacts.Addresses;
    }

    // Get pagination parameters from query
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    // filter address
    let objFilter = [];
    const filterAddress = await new Promise((resolve) => {
      Object.entries(address).forEach(([key, value]) => {
        objFilter = {
          ...objFilter,
          [key]: {
            [Op.like]: "%" + value + "%",
          },
        };
      });
      resolve(objFilter);
    });

    // filter contact
    let objContact = [];
    const filterContact = await new Promise((resolve) => {
      Object.entries(contacts).forEach(([key, value]) => {
        objFilter = {
          ...objContact,
          [key]: {
            [Op.like]: "%" + value + "%",
          },
        };
      });
      resolve(objFilter);
    });

    // cek ada filter atau tidak
    let data = null;
    let totalCount = 0;
    
    if (Object.keys(filterAddress).length == 0) {
      totalCount = await Contact.count({
        where: filterContact,
      });
      
      data = await Contact.findAll({
        include: {
          model: Address,
        },
        where: filterContact,
        limit: limit,
        offset: offset,
        order: [['createdAt', 'DESC']],
      });
    } else {
      // For filtered queries, we need a more complex count
      totalCount = await Contact.count({
        include: [{
          model: Address,
          where: filterAddress,
        }],
        where: filterContact,
      });
      
      data = await Contact.findAll({
        include: {
          model: Address,
          where: filterAddress,
        },
        where: filterContact,
        limit: limit,
        offset: offset,
        order: [['createdAt', 'DESC']],
      });
    }

    // Calculate pagination info
    const totalPages = Math.ceil(totalCount / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    res.json({
      errors: [],
      message: "Get Contact successfully",
      data: data,
      pagination: {
        currentPage: page,
        totalPages: totalPages,
        totalCount: totalCount,
        hasNextPage: hasNextPage,
        hasPrevPage: hasPrevPage,
        limit: limit,
      }
    });
  } catch (error) {
    next(
      new Error(
        "controllers/contactController.js:getContact - " + error.message
      )
    );
  }
};

const getContactById = async (req, res, next) => {
  try {
    const id = req.params.id;
    console.log(id);
    const contact = await Contact.findOne({
      include: {
        model: Address,
      },
      where: {
        contactId: id,
      },
    });
    if (!contact) {
      return res.status(404).json({
        errors: ["Contact not found"],
        message: "Get Contact Field",
        data: null,
      });
    }
    return res.status(200).json({
      errors: [],
      message: "Get Contact successfully",
      data: contact,
    });
  } catch (error) {
    next(
      new Error(
        "controllers/contactController.js:getContactById - " + error.message
      )
    );
  }
};

const updateContact = async (req, res, next) => {
  const t = await sequelize.transaction();
  try {
    let lstError = [];
    const id = req.params.id;
    let contact = req.body;

    // siapkan data
    let address = [];
    if (isExists(contact.Addresses)) {
      contact.Addresses.forEach((element) => {
        delete element.addressId;
        delete element.contactId;
        address.push(element);
      });
    }
    // hapus data yang tidak digunakan
    delete contact.Addresses;
    delete contact.contactId;

    const validContact = {
      firstName: "required",
    };

    // bersihkan contak dan validasi
    contact = await dataValid(validContact, contact);
    // masukan error kedalam list
    lstError.push(...contact.message);

    // validasi address
    let dtl = await Promise.all(
      address.map(async (item) => {
        const addressClear = await dataValid(
          {
            addressType: "requered",
            street: "requered",
          },
          item
        );
        lstError.push(...addressClear.message);
        return addressClear.data;
      })
    );

    // jika ada error kirimkan pesan
    if (lstError.length > 0) {
      await t.rollback();
      return res.status(400).json({
        errors: lstError,
        message: "Update Contact Field",
        data: contact,
      });
    }

    // update contact
    const resultUpd = await Contact.update(
      {
        ...contact.data,
      },
      {
        where: {
          contactId: id,
        },
        transaction: t,
      }
    );

    // hapus address yang lama
    const addressDelete = await Address.destroy({
      where: {
        contactId: id,
      },
      transaction: t,
    });

    // buat address yang baru
    const insertAddress = await Promise.all(
      dtl.map(async (item) => {
        const result = await Address.create(
          {
            ...item,
            contactId: id,
          },
          {
            transaction: t,
          }
        );
        return result;
      })
    );

    if (!resultUpd || !insertAddress || !addressDelete) {
      await t.rollback();
      return res.status(400).json({
        errors: ["Contact not found"],
        message: "Update Contact Field",
        data: contact.data,
      });
    }

    // jika semua berhasil
    await t.commit();

    // kembalikan info hasil
    return res.status(200).json({
      errors: [],
      message: "Contact updated successfully",
      data: {
        ...contact.data,
        Addresses: insertAddress,
      },
    });
  } catch (error) {
    await t.rollback();
    next(
      new Error(
        "controllers/contactController.js:updateContact - " + error.message
      )
    );
  }
};

const deleteContact = async (req, res, next) => {
  const t = await sequelize.transaction();
  try {
    // dapatkan id dari user
    const id = req.params.id;

    // delete address
    const addressDelete = await Address.destroy({
      where: {
        contactId: id,
      },
      transaction: t,
    });

    // delete contact
    const contactDelete = await Contact.destroy({
      where: {
        contactId: id,
      },
      transaction: t,
    });

    // jika ada yang gagal
    if (!contactDelete || !addressDelete) {
      await t.rollback();
      return res.status(400).json({
        errors: ["Contact not found"],
        message: "Delete Contact Field",
        data: null,
      });
    }

    // jika semua berhasil
    await t.commit();
    return res.status(200).json({
      errors: [],
      message: "Contact deleted successfully",
      data: null,
    });
  } catch (error) {
    await t.rollback();
    next(
      new Error(
        "controllers/contactController.js:deleteContact - " + error.message
      )
    );
  }
};

const searchContacts = async (req, res, next) => {
  try {
    const { query } = req.query;
    
    if (!query) {
      return res.status(400).json({
        errors: ["Query parameter is required"],
        message: "Search Contact Field",
        data: null,
      });
    }
    
    // Search contacts by first name, last name, email, or phone
    const contacts = await Contact.findAll({
      where: {
        [Op.or]: [
          { firstName: { [Op.like]: `%${query}%` } },
          { lastName: { [Op.like]: `%${query}%` } },
          { email: { [Op.like]: `%${query}%` } },
          { phone: { [Op.like]: `%${query}%` } },
        ],
      },
      include: [{
        model: Address,
      }],
    });
    
    return res.status(200).json({
      errors: [],
      message: "Contacts retrieved successfully",
      data: contacts,
    });
  } catch (error) {
    next(
      new Error(
        "controllers/contactController.js:searchContacts - " + error.message
      )
    );
  }
};

const getContactStats = async (req, res, next) => {
  try {
    // Get total count of contacts
    const totalContacts = await Contact.count();
    
    // Get count of contacts with addresses
    const contactsWithAddress = await Contact.count({
      include: [{
        model: Address,
        required: true
      }]
    });
    
    // Get count of contacts by address type
    const addressTypes = await Address.findAll({
      attributes: [
        'addressType',
        [sequelize.fn('COUNT', sequelize.col('addressType')), 'count']
      ],
      group: ['addressType']
    });
    
    return res.status(200).json({
      errors: [],
      message: "Contact statistics retrieved successfully",
      data: {
        totalContacts,
        contactsWithAddress,
        addressTypes: addressTypes.map(item => ({
          type: item.addressType,
          count: item.get('count')
        }))
      }
    });
  } catch (error) {
    next(
      new Error(
        "controllers/contactController.js:getContactStats - " + error.message
      )
    );
  }
};

export { setContact, getContact, getContactById, updateContact, deleteContact, searchContacts, getContactStats };
