import 'dotenv/config';
// @ts-ignore
import 'express-async-errors';
import express from "express";

// ? MW's
import cookieParser from "cookie-parser";
import morgan from 'morgan';

// ? Config's
import connectWithDatabase from '@/database';

const PORT = process.env.PORT || 3000;

const app = express();

// * Applying Middlewares
app.use(express.json());
app.use(cookieParser(process.env.JWT_SECRET))
if(process.env.NODE_ENV) {
    app.use(morgan('dev'));
}

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