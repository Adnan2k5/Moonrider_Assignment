import mongoose from "mongoose";

const ContactSchema = new mongoose.Schema(
  {
    phoneNumber: {
      type: String,
      required: false,
      trim: true,
      validate: {
        validator: function (v) {
          if (!v) return true; // Allow null/undefined
          return isValidPhoneNumber(v);
        },
        message: "Invalid phone number format",
      },
    },
    email: {
      type: String,
      required: false,
      trim: true,
      lowercase: true,
      validate: {
        validator: function (v) {
          if (!v) return true; // Allow null/undefined
          return isValidEmail(v);
        },
        message: "Invalid email format",
      },
    },
    linkedId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Contact",
      required: false,
      default: null,
    },
    linkPrecedence: {
      type: String,
      enum: ["primary", "secondary"],
      required: true,
      default: "primary",
    },
    deletedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true, // This automatically adds createdAt and updatedAt
    versionKey: false,
  }
);

// Custom validation to ensure at least one of email or phoneNumber is provided
ContactSchema.pre("validate", function (next) {
  if (!this.email && !this.phoneNumber) {
    next(new Error("At least one of email or phoneNumber must be provided"));
  } else {
    next();
  }
});

// Helper validation functions
const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const isValidPhoneNumber = (phoneNumber) => {
  const phoneRegex = /^[\+]?[0-9\s\-\(\)]+$/;
  return (
    phoneRegex.test(phoneNumber) && phoneNumber.replace(/\D/g, "").length >= 7
  );
};

const validateContact = (contactData) => {
  const errors = [];

  // At least one of email or phoneNumber must be provided
  if (!contactData.email && !contactData.phoneNumber) {
    errors.push("At least one of email or phoneNumber must be provided");
  }

  // Validate email format if provided
  if (contactData.email && !isValidEmail(contactData.email)) {
    errors.push("Invalid email format");
  }

  // Validate phone format if provided
  if (contactData.phoneNumber && !isValidPhoneNumber(contactData.phoneNumber)) {
    errors.push("Invalid phone number format");
  }

  // Validate linkPrecedence
  if (
    contactData.linkPrecedence &&
    !["primary", "secondary"].includes(contactData.linkPrecedence)
  ) {
    errors.push("linkPrecedence must be either 'primary' or 'secondary'");
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

const Contact = mongoose.model("Contact", ContactSchema);
export default Contact;
export { validateContact, isValidEmail, isValidPhoneNumber };
