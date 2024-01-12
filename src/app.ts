import 'dotenv/config';
// @ts-ignore
import 'express-async-errors';
import express from "express";

// ? Config's
import connectWithDatabase from '@/database';

// ! External MW's
import cookieParser from "cookie-parser";
import morgan from 'morgan';
// ? A MW to extract CLient IP
import requestIP from 'request-ip';

// * Custom Middleware's
import notFoundMiddleware from './middlewares/notFound.middleware';
import errorHandlerMiddleware from './middlewares/errorHandler.middleware';

// * Application Wide Routes
import appRoutes from "./routes";

const PORT = process.env.PORT || 3000;

const app = express();

// * Applying Middlewares
app.use(requestIP.mw());
app.use(express.json({ limit: '16kb' }));
app.use(express.urlencoded({ extended: true, limit: '16kb' }));
app.use(cookieParser(process.env.JWT_SECRET))
if(process.env.NODE_ENV) {
    app.use(morgan('dev'));
}

// * Routes
app.get('/', (_, res) => {
    return res.status(200).send("<h1>APP IS WORKING</h1>")
})

app.use('/api/v1', appRoutes)

// * Not Found and Error Handler MW
app.use(notFoundMiddleware);
app.use(errorHandlerMiddleware);


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