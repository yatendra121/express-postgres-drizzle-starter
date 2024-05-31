import {
  // deleteUserSchema,
  loginSchema,
  newUserSchema,
  // updateUserSchema,
  verifyUserSchema,
  // type User,
} from '@/schema/user';
import {
  addUser,
  deleteUser,
  getUserByEmail,
  //  updateUser,
  verifyUser,
} from '@/services/user-service';
import { UserVerified } from '@/templates/user-verified';
import { sendVerificationEmail } from '@/utils/email';
import generateToken from '@/utils/jwt';
import { InvalidValueError } from '@qnx/errors';
import { asyncValidatorHandler } from '@qnx/response';
import { render } from '@react-email/render';
import argon2 from 'argon2';

export const handleUserLogin = asyncValidatorHandler(async (req, _res) => {
  const data = loginSchema.parse(req.body);
  const { email, password } = data.body;
  const user = await getUserByEmail(email);

  if (!user) {
    throw new InvalidValueError('User not found.', { key: 'email' });
  }

  const matchPassword = await argon2.verify(user.password, password, {
    salt: Buffer.from(user.salt, 'hex'),
  });
  if (!matchPassword) {
    throw new InvalidValueError('Invalid password.', { key: 'password' });
  }

  const token = generateToken(user.id);
  return { token };
});

export const handleAddUser = asyncValidatorHandler(async (req, _res) => {
  const data = newUserSchema.parse(req.body);

  const user = data.body;

  const existingUser = await getUserByEmail(user.email);

  if (existingUser) {
    throw new InvalidValueError('User already exists.', { key: 'email' });
  }

  const { user: addedUser, code } = await addUser(user);

  const status = await sendVerificationEmail(
    process.env.API_BASE_URL,
    addedUser.name,
    addedUser.email,
    code
  );

  if (status !== 200) {
    await deleteUser(addedUser.email);

    throw new InvalidValueError('Failed to signup user.', { key: 'email' });
  }

  return addedUser;
});

export const handleVerifyUser = asyncValidatorHandler(async (req, res) => {
  try {
    const data = verifyUserSchema.parse(req.body);

    const { email, code } = data.query;

    await verifyUser(email, code);
    const template = render(
      UserVerified({ status: 'verified', message: 'User verified successfully' })
    );

    //@ts-ignore
    return res.status(200).send(template);
  } catch (err) {
    if (err instanceof Error) {
      const template = render(
        UserVerified({
          status: 'invalid',
          message: err.message,
          error: 'Invalid Request',
        })
      );
      //@ts-ignore
      res.status(400).send(template);
      return;
    }
    throw err;
  }
});

// export const handleDeleteUser = createHandler(deleteUserSchema, async (req, res) => {
//   const { email } = req.body;

//   const { user } = res.locals as { user: User };

//   if (user.email !== email && !user.isAdmin) {
//     throw new BackendError('UNAUTHORIZED', {
//       message: 'You are not authorized to delete this user',
//     });
//   }

//   const deletedUser = await deleteUser(email);

//   res.status(200).json({
//     user: deletedUser,
//   });
// });

// export const handleGetUser = createHandler(async (_req, res) => {
//   const { user } = res.locals as { user: User };

//   res.status(200).json({
//     user: {
//       id: user.id,
//       name: user.name,
//       email: user.email,
//       isAdmin: user.isAdmin,
//       isVerified: user.isVerified,
//       createdAt: user.createdAt,
//     },
//   });
// });

// export const handleUpdateUser = createHandler(updateUserSchema, async (req, res) => {
//   const { user } = res.locals as { user: User };

//   const { name, password, email } = req.body;

//   const updatedUser = await updateUser(user, { name, password, email });

//   res.status(200).json({
//     user: updatedUser,
//   });
// });
