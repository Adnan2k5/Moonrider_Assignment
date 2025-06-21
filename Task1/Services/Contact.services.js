import contactController from "../Controllers/contact.controller.js";

const identify = async (email, phoneNumber) => {
  // Find existing contacts with matching email or phone
  const existingContacts = await contactController.findByEmailOrPhone(
    email,
    phoneNumber
  );

  if (existingContacts.length === 0) {
    // No existing contacts - create new primary contact
    return await createNewPrimaryContact(email, phoneNumber);
  }

  // Check if we have exact match (both email and phone)
  const exactMatch = existingContacts.find(
    (contact) => contact.email === email && contact.phoneNumber === phoneNumber
  );

  if (exactMatch) {
    // Exact match found - return consolidated response for this contact
    return await getConsolidatedResponse(exactMatch);
  }

  // Partial match found - need to handle linking
  return await handlePartialMatch(existingContacts, email, phoneNumber);
};

const createNewPrimaryContact = async (email, phoneNumber) => {
  const newContact = await contactController.create({
    email: email || null,
    phoneNumber: phoneNumber || null,
    linkedId: null,
    linkPrecedence: "primary",
  });

  return {
    primaryContactId: newContact.id,
    emails: email ? [email] : [],
    phoneNumbers: phoneNumber ? [phoneNumber] : [],
    secondaryContactIds: [],
  };
};

const handlePartialMatch = async (existingContacts, email, phoneNumber) => {
  // Find primary contacts
  const primaryContacts = existingContacts.filter(
    (c) => c.linkPrecedence === "primary"
  );

  if (primaryContacts.length === 0) {
    // All existing contacts are secondary, find their primary
    const secondaryContact = existingContacts[0];
    const primaryContact = await contactController.findById(
      secondaryContact.linkedId
    );
    return await createSecondaryAndConsolidate(
      primaryContact,
      email,
      phoneNumber
    );
  }

  if (primaryContacts.length === 1) {
    // One primary contact found
    const primaryContact = primaryContacts[0];
    return await createSecondaryAndConsolidate(
      primaryContact,
      email,
      phoneNumber
    );
  }

  // Multiple primary contacts found - need to merge them
  return await mergePrimaryContacts(primaryContacts, email, phoneNumber);
};

/**
 * Create secondary contact and return consolidated response
 */
const createSecondaryAndConsolidate = async (
  primaryContact,
  email,
  phoneNumber
) => {
  // Check if we need to create a secondary contact
  const hasNewInfo =
    (email && email !== primaryContact.email) ||
    (phoneNumber && phoneNumber !== primaryContact.phoneNumber);

  if (hasNewInfo) {
    await contactController.create({
      email: email || null,
      phoneNumber: phoneNumber || null,
      linkedId: primaryContact.id,
      linkPrecedence: "secondary",
    });
  }

  return await getConsolidatedResponse(primaryContact);
};

/**
 * Merge multiple primary contacts into one
 */
const mergePrimaryContacts = async (primaryContacts, email, phoneNumber) => {
  // Keep the oldest primary contact as the main primary
  const oldestPrimary = primaryContacts.reduce((oldest, current) =>
    current.createdAt < oldest.createdAt ? current : oldest
  );

  // Convert other primary contacts to secondary
  for (const contact of primaryContacts) {
    if (contact.id.toString() !== oldestPrimary.id.toString()) {
      await contactController.makeSecondary(contact.id, oldestPrimary.id);
    }
  }

  // Create new secondary contact if needed
  const hasNewInfo =
    (email && !primaryContacts.some((c) => c.email === email)) ||
    (phoneNumber &&
      !primaryContacts.some((c) => c.phoneNumber === phoneNumber));

  if (hasNewInfo) {
    await contactController.create({
      email: email || null,
      phoneNumber: phoneNumber || null,
      linkedId: oldestPrimary.id,
      linkPrecedence: "secondary",
    });
  }

  return await getConsolidatedResponse(oldestPrimary);
};

/**
 * Get consolidated response for a primary contact
 */
const getConsolidatedResponse = async (primaryContact) => {
  // Get all linked contacts (including the primary itself)
  const allLinkedContacts = await contactController.findLinkedContacts(
    primaryContact.id
  );

  // Extract unique emails and phone numbers
  const emails = [
    ...new Set(
      allLinkedContacts
        .map((c) => c.email)
        .filter((email) => email !== null && email !== undefined)
    ),
  ];

  const phoneNumbers = [
    ...new Set(
      allLinkedContacts
        .map((c) => c.phoneNumber)
        .filter((phone) => phone !== null && phone !== undefined)
    ),
  ];

  // Get secondary contact IDs
  const secondaryContactIds = allLinkedContacts
    .filter((c) => c.linkPrecedence === "secondary")
    .map((c) => c.id);

  return {
    primaryContactId: primaryContact.id,
    emails: emails,
    phoneNumbers: phoneNumbers,
    secondaryContactIds: secondaryContactIds,
  };
};

export {
  identify,
  createNewPrimaryContact,
  handlePartialMatch,
  createSecondaryAndConsolidate,
  mergePrimaryContacts,
  getConsolidatedResponse,
};
