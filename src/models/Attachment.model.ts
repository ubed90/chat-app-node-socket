import mongoose from "mongoose";

export interface IAttachment {
    type: "IMAGE" | "VIDEO" | "PDF";
    url?: string
    content?: Buffer
    public_id?: string;
}

const Attachment = new mongoose.Schema<IAttachment>({
    type: {
        type: String,
        enum: ['IMAGE', 'VIDEO', 'PDF'],
        required: [true, 'Attachment type is required']
    },
    url: String,
    content: Buffer,
    public_id: String
})

export default Attachment;