import { Router } from 'express';
import * as userController from './user.controller';
import { validate } from '../../middlewares/validate.middleware';
import * as userValidation from './user.validation';

const router = Router();

router.post('/', validate(userValidation.createUserSchema), userController.createUser);
router.get('/', validate(userValidation.getAllUsersSchema), userController.getAllUsers);
router.get('/:id', validate(userValidation.getUserByIdSchema), userController.getUserById);
router.get(
  '/email/:email',
  validate(userValidation.getUserByEmailSchema),
  userController.getUserByEmail
);
router.get(
  '/username/:username',
  validate(userValidation.getUserByUsernameSchema),
  userController.getUserByUsername
);
router.patch('/:id', validate(userValidation.updateUserSchema), userController.updateUser);
router.delete('/:id', validate(userValidation.deleteUserSchema), userController.deleteUser);

// Email verification
router.post(
  '/:id/verify-email',
  validate(userValidation.getUserByIdSchema),
  userController.verifyEmail
);

export default router;
