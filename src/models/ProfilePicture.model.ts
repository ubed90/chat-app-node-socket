import mongoose from "mongoose";

export interface IProfilePicture {
    public_id: string;
    url: string;
}

const ProfilePicture = new mongoose.Schema<IProfilePicture>({
    public_id: {
        type: String,
        unique: true
    },
    url: String
})

export default ProfilePicture;