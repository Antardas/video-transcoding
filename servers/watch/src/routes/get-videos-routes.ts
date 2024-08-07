import express, { Router } from 'express';
import getVideos from '../controller/get-videos';

const router: Router = express.Router();

router.route('/videos').get(getVideos.all);

export default router;

