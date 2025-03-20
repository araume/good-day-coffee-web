import express from 'express';
import { fetch } from '../controller/userController.js';

const router = express.Router();

router.get('/users', fetch);

export default router;