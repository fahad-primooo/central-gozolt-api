import { Router } from 'express';
import rewardController from './rewards.controller';
import { validate } from '../../middlewares/validate.middleware';
import {
  processActionSchema,
  redeemRewardsSchema,
  getBalanceSchema,
  getTransactionsSchema,
  createRuleSchema,
  updateRuleSchema,
  deleteRuleSchema,
} from './rewards.validation.js';

const router = Router();

/**
 * @route   POST /api/rewards/process-action
 * @desc    Process a reward action (e.g., ride completed, referral)
 * @access  Public (should be protected with API key in production)
 */
router.post('/process-action', validate(processActionSchema), rewardController.processAction);

/**
 * @route   POST /api/rewards/redeem
 * @desc    Redeem reward coins for discount
 * @access  Public (should be protected with API key in production)
 */
router.post('/redeem', validate(redeemRewardsSchema), rewardController.redeem);

/**
 * @route   GET /api/rewards/balance/:userId
 * @desc    Get reward account balance
 * @access  Public
 */
router.get('/balance/:userId', validate(getBalanceSchema), rewardController.getBalance);

/**
 * @route   GET /api/rewards/transactions/:userId
 * @desc    Get transaction history
 * @access  Public
 */
router.get(
  '/transactions/:userId',
  validate(getTransactionsSchema),
  rewardController.getTransactions
);

/**
 * @route   POST /api/rewards/rules
 * @desc    Create a new reward rule
 * @access  Admin only (add auth middleware in production)
 */
router.post('/rules', validate(createRuleSchema), rewardController.createRule);

/**
 * @route   GET /api/rewards/rules
 * @desc    Get all reward rules
 * @access  Admin only (add auth middleware in production)
 */
router.get('/rules', rewardController.getAllRules);

/**
 * @route   PATCH /api/rewards/rules/:id
 * @desc    Update a reward rule
 * @access  Admin only (add auth middleware in production)
 */
router.patch('/rules/:id', validate(updateRuleSchema), rewardController.updateRule);

/**
 * @route   DELETE /api/rewards/rules/:id
 * @desc    Delete a reward rule
 * @access  Admin only (add auth middleware in production)
 */
router.delete('/rules/:id', validate(deleteRuleSchema), rewardController.deleteRule);

export default router;
