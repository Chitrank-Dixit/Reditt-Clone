import { Schema, model, Document } from 'mongoose';

export interface IUser extends Document {
  id: string;
  name: string;
  bio?: string;
  avatarUrl?: string;
  joinDate: Date;
}

const UserSchema = new Schema({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true, unique: true },
  bio: { type: String, default: 'No bio provided.' },
  avatarUrl: { type: String, default: null },
  joinDate: { type: Date, default: Date.now },
}, {
    timestamps: true
});

UserSchema.set('toJSON', {
    transform: (document, returnedObject) => {
        returnedObject.id = returnedObject._id.toString();
        delete returnedObject._id;
        delete returnedObject.__v;
    }
});

export default model<IUser>('User', UserSchema);