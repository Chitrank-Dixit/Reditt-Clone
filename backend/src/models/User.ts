import { Schema, model, Document } from 'mongoose';
import bcrypt from 'bcryptjs';

export interface IUser extends Document {
  name: string;
  email: string;
  password?: string;
  bio?: string;
  avatarUrl?: string;
  joinDate: Date;
  karma: number;
}

const UserSchema = new Schema({
  name: { type: String, required: true, unique: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true, select: false },
  bio: { type: String, default: 'No bio provided.' },
  avatarUrl: { type: String, default: null },
  joinDate: { type: Date, default: Date.now },
  karma: { type: Number, default: 0 },
}, {
    timestamps: true
});

// Hash password before saving
UserSchema.pre('save', async function(next) {
  if (!this.isModified('password') || !this.password) {
    return next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

UserSchema.set('toJSON', {
    // FIX: Add 'any' type to returnedObject to allow adding the 'id' property.
    transform: (document, returnedObject: any) => {
        returnedObject.id = returnedObject._id.toString();
        delete returnedObject._id;
        delete returnedObject.__v;
        // The password hash should not be revealed
        delete returnedObject.password;
    }
});

export default model<IUser>('User', UserSchema);