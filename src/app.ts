import 'dotenv/config';
// @ts-ignore
import 'express-async-errors';
import express from "express";

// ? Config's
import connectWithDatabase from '@/database';

// ! External MW's
import cookieParser from "cookie-parser";
import morgan from 'morgan';
import cors from "cors";
// ? A MW to extract CLient IP
import requestIP from 'request-ip';

// * File Upload MW's
import fileUpload from "express-fileupload";
import '@/utils/Cloudinary';

// * Custom Middleware's
import notFoundMiddleware from './middlewares/notFound.middleware';
import errorHandlerMiddleware from './middlewares/errorHandler.middleware';

// * Application Wide Routes
import appRoutes from "./routes";

// * Socket Imports
import { createServer } from 'http';
import { Server } from 'socket.io';
import authorizeSocketMiddleware from './middlewares/socket.middleware';
import initializeSocketIO from './utils/socket/initializeSocketIO';
import path from 'path';
import { usersRegistry } from './utils/usersMap';

// * PeerJS Imports
import { ExpressPeerServer } from "peer";

const PORT = process.env.PORT || 3000;

// * Initialize express
const app = express();

// ! Initialize Sockets
const httpServer = createServer(app);
export const io = new Server(httpServer, {
  pingTimeout: 60000,
  ...(process.env.NODE_ENV === 'development'
    ? {
        cors: {
          origin: process.env.ORIGIN,
          credentials: true,
        },
      }
    : {}),
});

// * Initialize our Peer Server
const peerServer = ExpressPeerServer(httpServer, {
    port: Number(PORT),
    path: '/video-call',
})

// * Set Socket Auth MW
io.use(authorizeSocketMiddleware);

app.set('io', io);

// * Setting Public Directory
app.use(express.static(path.join(__dirname, '../public')));

// * Applying Middlewares
app.use(requestIP.mw());
app.use(express.json({ limit: '16kb' }));
app.use(fileUpload({ useTempFiles: true }))
app.use(express.urlencoded({ extended: true, limit: '16kb' }));
app.use(cookieParser(process.env.JWT_SECRET))
if(process.env.NODE_ENV === 'development') {
    app.use(
      cors({
        origin: process.env.ORIGIN,
        credentials: true, //access-control-allow-credentials:true
        optionsSuccessStatus: 200
      })
    );
    app.use(morgan('dev'));
}

// * Routes
app.use('/peerjs', peerServer);

app.use('/api/v1', appRoutes);

app.use('*', (_, res) => {
  return res.sendFile(path.resolve(__dirname, '../', 'public', 'index.html'));
});

// * Not Found and Error Handler MW
app.use(notFoundMiddleware);
app.use(errorHandlerMiddleware);

// * Initialize our SocketIo
initializeSocketIO({ io, usersRegistry });


const start = async () => {
    try {
        await connectWithDatabase(
          process.env.NODE_ENV === 'development'
            ? process.env.MONGO_URI_DEV as string
            : process.env.MONGO_URI_PROD as string
        );
        httpServer.listen(PORT, () => console.log(`App is running on http:localhost:${PORT} 🚀`))
    } catch (error) {
        console.log(error)
        process.exit();
    }
}

start();