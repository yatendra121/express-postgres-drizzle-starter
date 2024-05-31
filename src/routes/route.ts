import adminRoutes from '@/routes/admin-route';
import userRoutes from '@/routes/user-route';
import { createRouter } from '@/utils/create';
import { Router } from 'express';

export default createRouter((router: Router) => {
  router.use('/admin', adminRoutes);
  router.use('/user', userRoutes);
});
