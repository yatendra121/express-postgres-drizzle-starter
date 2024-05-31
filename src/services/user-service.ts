import { users, type NewUser, type UpdateUser, type User } from '@/schema/user';
import { db } from '@/utils/db';
import { sendVerificationEmail } from '@/utils/email';
import { sha256 } from '@/utils/hash';
import { InvalidValueError } from '@qnx/errors';
import argon2 from 'argon2';
import crypto from 'crypto';
import { eq } from 'drizzle-orm';

export const getUserByUserId = async (userId: string) => {
  const [user] = await db.select().from(users).where(eq(users.id, userId)).limit(1);
  return user;
};

export const getUserByEmail = async (email: string) => {
  const [user] = await db.select().from(users).where(eq(users.email, email)).limit(1);
  return user;
};

export const addUser = async (user: NewUser) => {
  const { password, ...userDetails } = user;

  const salt = crypto.randomBytes(32);
  const code = crypto.randomBytes(32).toString('hex');
  const hashedPassword = await argon2.hash(password, {
    salt,
  });

  const [newUser] = await db
    .insert(users)
    .values({
      ...userDetails,
      password: hashedPassword,
      salt: salt.toString('hex'),
      code,
    })
    .returning({
      id: users.id,
      name: users.name,
      email: users.email,
      code: users.code,
      isVerified: users.isVerified,
      isAdmin: users.isAdmin,
    });

  if (!newUser) {
    throw new InvalidValueError('Failed to add user', { key: 'INTERNAL_ERROR' });
  }

  return { user: newUser, code };
};

export const verifyUser = async (email: string, code: string) => {
  const [user] = await db.select().from(users).where(eq(users.email, email)).limit(1);

  if (!user) {
    throw new InvalidValueError('User not found', { key: 'USER_NOT_FOUND' });
  }

  if (user.isVerified) {
    throw new InvalidValueError('User already verified', { key: 'CONFLICT' });
  }

  const isVerified = sha256.verify(code, user.code);

  if (!isVerified) {
    throw new InvalidValueError('Invalid verification code', { key: 'UNAUTHORIZED' });
  }

  const [updatedUser] = await db
    .update(users)
    .set({ isVerified })
    .where(eq(users.email, email))
    .returning({ id: users.id });

  if (!updatedUser) {
    throw new InvalidValueError('Failed to verify user', { key: 'INTERNAL_ERROR' });
  }
};

export const deleteUser = async (email: string) => {
  const user = await getUserByEmail(email);

  if (!user) {
    throw new InvalidValueError('User not found', { key: 'USER_NOT_FOUND' });
  }

  const [deletedUser] = await db.delete(users).where(eq(users.email, email)).returning({
    id: users.id,
    name: users.name,
    email: users.email,
  });

  return deletedUser;
};

export const updateUser = async (user: User, { name, email, password }: UpdateUser) => {
  let code: string | undefined;
  let hashedCode: string | undefined;

  if (email) {
    const user = await getUserByEmail(email);

    if (user) {
      throw new InvalidValueError('Email already in use', { key: 'CONFLICT' });
    }

    code = crypto.randomBytes(32).toString('hex');
    hashedCode = sha256.hash(code);
  }

  const [updatedUser] = await db
    .update(users)
    .set({
      name,
      password,
      email,
      code: hashedCode,
      isVerified: hashedCode ? false : user.isVerified,
    })
    .where(eq(users.email, user.email))
    .returning({
      id: users.id,
      name: users.name,
      email: users.email,
      isAdmin: users.isAdmin,
      isVerified: users.isVerified,
      createdAt: users.createdAt,
    });

  if (!updatedUser) {
    throw new InvalidValueError('User could not be updated', { key: 'USER_NOT_FOUND' });
  }

  if (email && code) {
    const { API_BASE_URL } = process.env;
    const status = await sendVerificationEmail(
      API_BASE_URL,
      updatedUser.name,
      updatedUser.email,
      code
    );

    if (status !== 200) {
      await db
        .update(users)
        .set({ email: user.email, isVerified: user.isVerified })
        .where(eq(users.email, updatedUser.email))
        .returning();

      throw new InvalidValueError('Email could not be updated', { key: 'BAD_REQUEST' });
    }
  }

  return updatedUser;
};
