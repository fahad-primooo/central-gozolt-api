import { Request, Response } from 'express';
import rewardService from './rewards.service';
import logger from '../../utils/logger';
import { asyncHandler } from '../../utils/asyncHandler';
import { ApiError } from '../../utils/ApiError';

export class RewardController {
  /**
   * Process a reward action (called by Laravel or other services)
   * POST /api/rewards/process-action
   */
  processAction = asyncHandler(async (req: Request, res: Response) => {
    const { actionType, userId, serviceType, sourceType, sourceId, metadata } = req.body;

    const results = await rewardService.processAction(actionType, userId, {
      serviceType,
      sourceType,
      sourceId,
      metadata,
    });

    res.json({
      status: true,
      message: 'Reward action processed successfully',
      data: {
        rulesApplied: results.length,
        results,
      },
    });
  });

  /**
   * Redeem rewards for a service/ride
   * POST /api/rewards/redeem
   */
  redeem = asyncHandler(async (req: Request, res: Response) => {
    const { userId, serviceType, serviceName, sourceType, sourceId, rideAmount, coinsToRedeem } =
      req.body;

    const result = await rewardService.redeem(userId, {
      serviceType,
      serviceName,
      sourceType,
      sourceId,
      rideAmount,
      coinsToRedeem,
    });

    res.json({
      status: true,
      message: 'Rewards redeemed successfully',
      data: {
        coinsRedeemed: coinsToRedeem,
        discountAmount: result.discountAmount,
        remainingBalance: result.account.pointsBalance,
        transaction: result.transaction,
      },
    });
  });

  /**
   * Get reward account balance
   * GET /api/rewards/balance/:userId
   */
  getBalance = asyncHandler(async (req: Request, res: Response) => {
    const { userId } = req.params;

    const balance = await rewardService.getBalance(parseInt(userId));

    res.json({
      status: true,
      message: 'Balance retrieved successfully',
      data: balance,
    });
  });

  /**
   * Get transaction history
   * GET /api/rewards/transactions/:userId
   */
  getTransactions = asyncHandler(async (req: Request, res: Response) => {
    const { userId } = req.params;
    const { page = '1', limit = '20' } = req.query;

    const result = await rewardService.getTransactions(parseInt(userId), {
      page: parseInt(page as string),
      limit: parseInt(limit as string),
    });

    res.json({
      status: true,
      message: 'Transactions retrieved successfully',
      data: result.transactions,
      pagination: result.pagination,
    });
  });

  /**
   * Create a reward rule
   * POST /api/rewards/rules
   */
  createRule = asyncHandler(async (req: Request, res: Response) => {
    const { actionType, serviceType, pointsAwarded, description, isActive } = req.body;

    const rule = await rewardService.createRule({
      actionType,
      serviceType,
      pointsAwarded,
      description,
      isActive,
    });

    logger.info(`Reward rule created: ${rule.actionType} - ${rule.pointsAwarded} points`);

    res.status(201).json({
      status: true,
      message: 'Reward rule created successfully',
      data: rule,
    });
  });

  /**
   * Get all reward rules
   * GET /api/rewards/rules
   */
  getAllRules = asyncHandler(async (req: Request, res: Response) => {
    const { isActive } = req.query;

    const rules = await rewardService.getAllRules({
      isActive: isActive === 'true' ? true : isActive === 'false' ? false : undefined,
    });

    res.json({
      status: true,
      message: 'Reward rules retrieved successfully',
      data: rules,
    });
  });

  /**
   * Update a reward rule
   * PATCH /api/rewards/rules/:id
   */
  updateRule = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const { actionType, serviceType, pointsAwarded, description, isActive } = req.body;

    const rule = await rewardService.updateRule(parseInt(id), {
      actionType,
      serviceType,
      pointsAwarded,
      description,
      isActive,
    });

    logger.info(`Reward rule updated: ${rule.id}`);

    res.json({
      status: true,
      message: 'Reward rule updated successfully',
      data: rule,
    });
  });

  /**
   * Delete a reward rule
   * DELETE /api/rewards/rules/:id
   */
  deleteRule = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;

    await rewardService.deleteRule(parseInt(id));

    logger.info(`Reward rule deleted: ${id}`);

    res.json({
      status: true,
      message: 'Reward rule deleted successfully',
    });
  });
}

export default new RewardController();
