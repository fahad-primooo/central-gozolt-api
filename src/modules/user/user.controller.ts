import { Request, Response } from 'express';
import { UserService } from './user.service';
import { asyncHandler } from '../../utils/asyncHandler';

const userService = new UserService();

export const createUser = asyncHandler(async (req: Request, res: Response) => {
  const user = await userService.createUser(req.body);

  res.status(201).json({
    success: true,
    message: 'User created successfully',
    data: user,
  });
});

export const getUserById = asyncHandler(async (req: Request, res: Response) => {
  const user = await userService.getUserById(Number(req.params.id));

  res.status(200).json({
    success: true,
    data: user,
  });
});

export const getUserByEmail = asyncHandler(async (req: Request, res: Response) => {
  const user = await userService.getUserByEmail(req.params.email);

  res.status(200).json({
    success: true,
    data: user,
  });
});

export const getUserByUsername = asyncHandler(async (req: Request, res: Response) => {
  const user = await userService.getUserByUsername(req.params.username);

  res.status(200).json({
    success: true,
    data: user,
  });
});

export const getAllUsers = asyncHandler(async (req: Request, res: Response) => {
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 10;

  const result = await userService.getAllUsers(page, limit);

  res.status(200).json({
    success: true,
    data: result.users,
    pagination: result.pagination,
  });
});

export const updateUser = asyncHandler(async (req: Request, res: Response) => {
  const user = await userService.updateUser(Number(req.params.id), req.body);

  res.status(200).json({
    success: true,
    message: 'User updated successfully',
    data: user,
  });
});

export const deleteUser = asyncHandler(async (req: Request, res: Response) => {
  const soft = req.query.soft !== 'false';
  const result = await userService.deleteUser(Number(req.params.id), soft);

  res.status(200).json({
    success: true,
    message: result.message,
  });
});

export const verifyEmail = asyncHandler(async (req: Request, res: Response) => {
  const user = await userService.verifyEmail(Number(req.params.id));

  res.status(200).json({
    success: true,
    message: 'Email verified successfully',
    data: user,
  });
});
