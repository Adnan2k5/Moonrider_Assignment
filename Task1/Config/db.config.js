import mongoose from "mongoose";

const connectDB = async () => {
  try {
    await mongoose.connect(
      "mongodb+srv://adnan2k5:Adnan%402k5@exprenses.iukimwd.mongodb.net/",
      {}
    );
  } catch (error) {
    process.exit(1);
  }
};

export default connectDB;
