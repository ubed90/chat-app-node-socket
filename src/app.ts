import 'dotenv/config';
// @ts-ignore
import 'express-async-errors';
import express from "express";
import cookieParser from "cookie-parser";
import connectWithDatabase from './database';

const PORT = process.env.PORT || 3000;

const app = express();

// * Applying Middlewares
app.use(express.json());
app.use(cookieParser(process.env.JWT_SECRET))

// * Routes
app.get('/', (_, res) => {
    return res.status(200).send("<h1>APP IS WORKING</h1>")
})


const start = async () => {
    try {
        await connectWithDatabase(process.env.MONGO_URI as string + process.env.DB_NAME)
        app.listen(PORT, () => console.log(`App is running on http:localhost:${PORT} 🚀`))
    } catch (error) {
        console.log(error)
        process.exit();
    }
}

start();