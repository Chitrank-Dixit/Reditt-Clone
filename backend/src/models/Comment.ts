import { Schema, model, Document, Types } from 'mongoose';

export interface IComment extends Document {
  content: string;
  author: { id: string; name: string };
  post: Types.ObjectId;
  votes: number;
  createdAt: Date;
  replies: Types.ObjectId[];
}

const CommentSchema = new Schema({
    content: { type: String, required: true },
    author: {
        id: { type: String, required: true },
        name: { type: String, required: true },
    },
    post: { type: Schema.Types.ObjectId, ref: 'Post', required: true },
    votes: { type: Number, default: 0 },
    createdAt: { type: Date, default: Date.now },
    replies: [{ type: Schema.Types.ObjectId, ref: 'Comment' }],
}, {
    timestamps: true
});

CommentSchema.set('toJSON', {
    transform: (document, returnedObject) => {
        returnedObject.id = returnedObject._id.toString();
        delete returnedObject._id;
        delete returnedObject.__v;
    }
});


export default model<IComment>('Comment', CommentSchema);
