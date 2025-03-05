const asyncHandler = require("express-async-handler");
const Contact = require("../models/contactModel");

const getContacts = asyncHandler(async (req, res) => {
  const contacts = await Contact.find({ user_Id: req.user.id});
  res.status(200).json(contacts);
});

const getContact = asyncHandler(async (req, res) => {
  const id = req.params.id;
  if (!id) {
    res.status(400).json({ message: "Id is required" });
  }
  // const contact = await Contact.findById({ _id: id, user_Id: req.user.id });
  const contact = await Contact.findById({ _id: id });
  if (!contact) {
    res.status(404);
    throw new Error("Contact not found");
  }
  res.status(200).json(contact);
});

const createContact = asyncHandler(async (req, res) => {
  const { name, email, phoneNumber } = req.body;
  if (!name || !email || !phoneNumber) {
    res.status(400);
    throw new Error("Invalid request body");
  }
  const contact = await Contact.findOne({ email });
  if (contact) {
    return res
      .status(500)
      .json({ message: "Contact with email already exist" });
  }
  const newContact = await Contact.create({
    name,
    email,
    phoneNumber,
    user_Id: req.user.id
  });
  res.status(201).json(newContact);
  console.error(error.message);
});

const updateContact = asyncHandler(async (req, res) => {
  const id = req.params.id;
  if (!id) {
    res.status(404);
    throw new Error("Id is required");
  }
  const contact = await Contact.findById({ _id: id, user_Id: req.user.id });
  if (!contact) {
    res.status(404);
    throw new Error("Contact not found");
  }
  const updatedContact = await Contact.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true }
  );
  res.status(201).json({ message: "Contact updated successfully", updatedContact });
});

const deleteContact = asyncHandler(async (req, res) => {
   const id = req.params.id;
   if (!id) {
     res.status(404);
     throw new Error("Id is required");
   }
   const contact = await Contact.findById({ _id: id, user_Id: req.user.id });
   if (!contact) {
     res.status(404);
     throw new Error("Contact not found");
   }
  await Contact.findOneAndDelete(req.params.id);
  res.status(200).json({ message: "Contact deleted successfully" });
});

module.exports = {
  getContacts,
  getContact,
  createContact,
  updateContact,
  deleteContact,
};
