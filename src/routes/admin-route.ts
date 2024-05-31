import {
  handleDeleteAllUnverifiedUsers,
  handleGetAllUsers,
  handleGetAllVerifiedUsers,
} from '@/controllers/admin-controller';
//import { authenticate } from '@/middlewares/auth';
import { createRouter } from '@/utils/create';
import { Router } from 'express';

export default createRouter((router: Router) => {
  // router.use(
  //   authenticate({
  //     verifyAdmin: false,
  //   })
  // );

  router.get('/all-users', handleGetAllUsers);
  router.get('/all-verfied-users', handleGetAllVerifiedUsers);
  router.delete('/remove-unverified-users', handleDeleteAllUnverifiedUsers);
});
