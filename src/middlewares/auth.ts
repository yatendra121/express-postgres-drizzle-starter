import { getUserByUserId } from '@/services/user-service';
import { verifyToken } from '@/utils/jwt';
import { InvalidValueError } from '@qnx/errors';
import { asyncValidatorHandler } from '@qnx/response';

export const authenticate = (
  { verifyAdmin } = {
    verifyAdmin: false,
  }
) => {
  return asyncValidatorHandler(async (req, res, next) => {
    const { authorization } = req.headers;

    if (!authorization) {
      throw new InvalidValueError('Authorization header not found.', {
        key: 'UNAUTHORIZED',
      });
    }

    const token = authorization.split(' ')[1];

    if (!token) {
      throw new InvalidValueError('Token not found.', { key: 'UNAUTHORIZED' });
    }

    const { userId } = verifyToken(token);

    const user = await getUserByUserId(userId);

    if (!user) {
      throw new InvalidValueError('Token not found.', { key: 'USER_NOT_FOUND' });
    }

    if (!user.isVerified) {
      throw new InvalidValueError('User not verified.', { key: 'UNAUTHORIZED' });
    }

    if (verifyAdmin && !user.isAdmin) {
      throw new InvalidValueError('User not authorized.', { key: 'UNAUTHORIZED' });
    }

    //@ts-ignore
    res.locals.user = user;
    //@ts-ignore

    next();
  });
};
