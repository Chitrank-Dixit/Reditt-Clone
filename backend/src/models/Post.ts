import { Schema, model, Document } from 'mongoose';

export interface IPost extends Document {
  title: string;
  content: string;
  author: { id: string; name: string };
  subreddit: string;
  votes: number;
  commentsCount: number;
  createdAt: Date;
  imageUrl?: string;
  postType: 'text' | 'link';
  linkUrl?: string;
}

const PostSchema = new Schema({
  title: { type: String, required: true },
  content: { type: String },
  author: {
    id: { type: String, required: true },
    name: { type: String, required: true },
  },
  subreddit: { type: String, required: true },
  votes: { type: Number, default: 0 },
  commentsCount: { type: Number, default: 0 },
  imageUrl: { type: String },
  postType: { type: String, enum: ['text', 'link'], default: 'text' },
  linkUrl: { type: String },
}, {
    timestamps: true
});

PostSchema.set('toJSON', {
    // FIX: Add 'any' type to returnedObject to allow adding the 'id' property.
    transform: (document, returnedObject: any) => {
        returnedObject.id = returnedObject._id.toString();
        delete returnedObject._id;
        delete returnedObject.__v;
    }
});

export default model<IPost>('Post', PostSchema);