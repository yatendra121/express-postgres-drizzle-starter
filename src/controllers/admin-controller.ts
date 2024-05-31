import {
  deleteAllUnverifiedUsers,
  getAllUsers,
  getAllVerifiedUsers,
} from '@/services/admin-service';
import { ApiResponse, asyncValidatorHandler } from '@qnx/response';

export const handleGetAllVerifiedUsers = asyncValidatorHandler(async () => {
  return await getAllVerifiedUsers();
});

export const handleGetAllUsers = asyncValidatorHandler(async () => {
  return await getAllUsers();
});

export const handleDeleteAllUnverifiedUsers = asyncValidatorHandler(async () => {
  const unverfiedUsersCount = await deleteAllUnverifiedUsers();
  return ApiResponse.getInstance().setMessage(
    `${unverfiedUsersCount} unverified users deleted successfully`
  );
});
