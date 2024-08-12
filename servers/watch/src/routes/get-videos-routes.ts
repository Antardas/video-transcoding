import express, { Router } from 'express';
import getVideos from '../controller/get-videos';

const router: Router = express.Router();

router.route('/videos').get(getVideos.all);
router.route('/videos/search').get(getVideos.search);
router.route('/videos/:id').get(getVideos.singleVideo);

export default router;
