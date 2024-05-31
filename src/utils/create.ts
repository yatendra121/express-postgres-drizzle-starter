import { Router } from 'express';

export const createRouter = (callback: (router: Router) => void) => {
  const router = Router();
  callback(router);
  return router;
};
