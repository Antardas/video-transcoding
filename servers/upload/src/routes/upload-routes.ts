import express, { Router } from 'express';
import uploadController from '../controllers/upload';
import multer from 'multer';
const files = multer();

const router: Router = express.Router();

router.route('/upload').post(files.single('chunk'), uploadController.upload);
router.route('/upload/initialize').post(files.none(), uploadController.initialize);
router.route('/upload/complete').post(files.none(), uploadController.complete);

export default router;
