import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bodyParser from 'body-parser';
import userRoutes from './route/userRoute.js';

const app = express();

app.use(bodyParser.json());

dotenv.config();

const PORT = process.env.PORT || 8000;
const MONGODB_URI = process.env.MONGODB_URI;

mongoose.connect(MONGODB_URI)
    .then(() => {
        console.log("Connected to MongoDB");
        app.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`);
        });
    })
    .catch((error) => {
        console.log(error);
    });

app.use(express.static('./public'));  // This will serve files from your root directory

// Add this before your API routes to serve index.html at the root path
app.get('/', (req, res) => {
    res.sendFile('index.html', { root: './public' });
});

app.use('/api', userRoutes);