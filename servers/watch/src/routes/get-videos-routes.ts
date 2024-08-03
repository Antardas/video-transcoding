import express, { Router } from 'express';

const router: Router = express.Router();

router.route('/videos').get();

export default router;
