import Contact, {
  isValidEmail,
  isValidPhoneNumber,
  validateContact,
} from "../models/contact.model.js";
import * as ContactService from "../Services/Contact.services.js";

const create = async (contactData) => {
  // Validate contact data using manual validation
  console.log("Validating contact data:", contactData);
  const validation = validateContact(contactData);
  if (!validation.isValid) {
    throw new Error(`Validation failed: ${validation.errors.join(", ")}`);
  }

  // Create new contact using Mongoose model
  const contact = new Contact({
    ...contactData,
    deletedAt: null,
  });

  const savedContact = await contact.save();
  return savedContact.toJSON(); // This will include the virtual 'id' field
};

const findById = async (id) => {
  const contact = await Contact.findOne({ _id: id, deletedAt: null }).lean();
  return contact ? { ...contact, id: contact._id } : null;
};

const getAll = async (req, res) => {
  console.log("Fetching all contacts");
  const contacts = await Contact.find({ deletedAt: null }).lean();
  if (!contacts || contacts.length === 0) {
    return res.status(404).json({
      message: "No contacts found",
    });
  }
  return res.status(200).json({
    contacts: contacts.map((contact) => ({ ...contact, id: contact._id })),
  });
};

const identify = async (req, res) => {
  try {
    // Check if body exists
    if (!req.body) {
      return res.status(400).json({
        error: "Bad Request",
        message: "Request body is missing. Please send data as JSON.",
      });
    }

    const { email, phoneNumber } = req.body;

    // Validation: At least one of email or phoneNumber must be provided
    if (!email && !phoneNumber) {
      return res.status(400).json({
        error: "Bad Request",
        message: "At least one of email or phoneNumber must be provided",
      });
    }

    // Basic email validation
    if (email && !isValidEmail(email)) {
      return res.status(400).json({
        error: "Bad Request",
        message: "Invalid email format",
      });
    }

    // Basic phone validation
    if (phoneNumber && !isValidPhoneNumber(phoneNumber)) {
      return res.status(400).json({
        error: "Bad Request",
        message: "Invalid phone number format",
      });
    }

    const result = await ContactService.identify(email, phoneNumber);

    // Return successful response
    res.status(200).json({
      contact: result,
    });
  } catch (error) {
    console.error("Error in /identify:", error);

    // Return error to avoid revealing system details
    res.status(500).json({
      error: "Internal Server Error",
      message: "Unable to process request at this time",
    });
  }
};

const findByEmailOrPhone = async (email, phoneNumber) => {
  const query = {
    deletedAt: null,
    $or: [],
  };

  if (email) {
    query.$or.push({ email: email });
  }
  if (phoneNumber) {
    query.$or.push({ phoneNumber: phoneNumber });
  }

  if (query.$or.length === 0) {
    return [];
  }

  const contacts = await Contact.find(query).lean();
  return contacts.map((contact) => ({ ...contact, id: contact._id }));
};

const findLinkedContacts = async (primaryId) => {
  const contacts = await Contact.find({
    deletedAt: null,
    $or: [{ _id: primaryId }, { linkedId: primaryId }],
  }).lean();

  return contacts.map((contact) => ({ ...contact, id: contact._id }));
};

const makeSecondary = async (contactId, primaryId) => {
  await Contact.updateOne(
    { _id: contactId },
    {
      $set: {
        linkPrecedence: "secondary",
        linkedId: primaryId,
        updatedAt: new Date(),
      },
    }
  );
};

export default {
  create,
  findByEmailOrPhone,
  findLinkedContacts,
  makeSecondary,
  findById,
  identify,
  getAll,
};
