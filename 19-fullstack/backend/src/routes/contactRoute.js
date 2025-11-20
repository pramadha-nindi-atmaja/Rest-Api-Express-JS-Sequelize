import express from "express";
import { autenticate } from "../controllers/errorHandlingController.js";
import {
  setContact,
  getContact,
  getContactById,
  updateContact,
  deleteContact,
  searchContacts,
  getContactStats,
} from "../controllers/contactController.js";
const contactRouter = express.Router();

contactRouter.post("/contacts", autenticate, setContact);
contactRouter.get("/contacts", autenticate, getContact);
contactRouter.get("/contacts/:id", autenticate, getContactById);
contactRouter.put("/contacts/:id", autenticate, updateContact);
contactRouter.delete("/contacts/:id", autenticate, deleteContact);
contactRouter.get("/contacts/search", autenticate, searchContacts);
contactRouter.get("/contacts/stats", autenticate, getContactStats);

export default contactRouter;
