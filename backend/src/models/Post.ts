import { Schema, model, Document, Types } from 'mongoose';

export interface IPost extends Document {
  title: string;
  content?: string;
  author: Types.ObjectId;
  subreddit: Types.ObjectId;
  votes: number;
  commentsCount: number;
  createdAt: Date;
  imageUrl?: string;
  postType: 'text' | 'link';
  linkUrl?: string;
  status: 'visible' | 'removed';
}

const PostSchema = new Schema({
  title: { type: String, required: true },
  content: { type: String },
  author: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  subreddit: { type: Schema.Types.ObjectId, ref: 'Subreddit', required: true },
  votes: { type: Number, default: 0 },
  commentsCount: { type: Number, default: 0 },
  imageUrl: { type: String },
  postType: { type: String, enum: ['text', 'link'], default: 'text' },
  linkUrl: { type: String },
  status: { type: String, enum: ['visible', 'removed'], default: 'visible' },
}, {
    timestamps: true
});

PostSchema.set('toJSON', {
    transform: (document, returnedObject: any) => {
        returnedObject.id = returnedObject._id.toString();
        delete returnedObject._id;
        delete returnedObject.__v;
    }
});

export default model<IPost>('Post', PostSchema);