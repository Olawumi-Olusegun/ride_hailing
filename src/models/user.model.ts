import mongoose, { Schema, Document } from "mongoose";
import bcrypt from "bcryptjs";


export interface User extends Document {
  name: string;
  email: string;
  password: string;
  role: "rider" | "driver";
  location?: { longitude: number; latitude: number; };
  isValidPassword: (password: string) => Promise<boolean>;
}

const UserSchema = new Schema<User>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ["rider", "driver"], required: true },
    location: {
      longitude: { type: Number, default: 0 },
      latitude: { type: Number, default: 0 },
    }
  }, { timestamps: true } );

UserSchema.pre("save" , async function(next) {
    if(this.isModified("password")) {
      const salt = await bcrypt.genSalt(12);
      this.password = await bcrypt.hash(this.password, salt);
    }
    next();
});

UserSchema.methods.isValidPassword = async function(password: string) {
  return await bcrypt.compare(password, this.password);
}

export default mongoose.model<User>("User", UserSchema);
