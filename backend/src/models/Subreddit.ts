import { Schema, model, Document, Types } from 'mongoose';

export interface ISubreddit extends Document {
  name: string;
  description: string;
  creator: Types.ObjectId;
  moderators: Types.ObjectId[];
  members: Types.ObjectId[];
  memberCount: number;
  createdAt: Date;
}

const SubredditSchema = new Schema({
  name: { type: String, required: true, unique: true, trim: true },
  description: { type: String, required: true },
  creator: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  moderators: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  members: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  memberCount: { type: Number, default: 1 },
}, {
    timestamps: true
});

SubredditSchema.pre('save', function(next) {
    this.memberCount = this.members.length;
    next();
});

SubredditSchema.set('toJSON', {
    transform: (document, returnedObject: any) => {
        returnedObject.id = returnedObject._id.toString();
        delete returnedObject._id;
        delete returnedObject.__v;
    }
});

export default model<ISubreddit>('Subreddit', SubredditSchema);