import mongoose from "mongoose";

const connectWithDatabase = (url: string) => {
    return mongoose.connect(url);
}

export default connectWithDatabase;