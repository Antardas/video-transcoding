import { NextFunction, Request, Response, RequestHandler } from 'express';

// use this code to avoid repeated code try & catch block
type Controller = (req: Request, res: Response, next: NextFunction) => Promise<any>;
const catchAsyncError = (errorFunc: Controller): RequestHandler => {
	return (req: Request, res: Response, next: NextFunction) => {
		Promise.resolve(errorFunc(req, res, next)).catch(next);
	};
};

export default catchAsyncError;
