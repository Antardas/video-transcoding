import express, { Router } from 'express';
import uploadController from '../controllers/upload';

const router: Router = express.Router();

router.route('/upload').post(uploadController.upload)

export default router;
