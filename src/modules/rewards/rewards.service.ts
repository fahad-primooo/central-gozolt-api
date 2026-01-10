import { prisma } from '../../lib/prisma';
import RewardConversion from '../../utils/reward-conversion';
import logger from '../../utils/logger';

export class RewardService {
  /**
   * Process a reward action (e.g., ride completed, referral)
   * Evaluates applicable rules and applies rewards
   */
  async processAction(
    actionType: string,
    userId: number,
    options: {
      serviceType?: string;
      sourceType?: string;
      sourceId?: number;
      metadata?: Record<string, any>;
    } = {}
  ) {
    const { serviceType, sourceType, sourceId, metadata = {} } = options;

    // Find applicable rules
    const rules = await prisma.rewardRule.findMany({
      where: {
        actionType,
        isActive: true,
        OR: [{ serviceType: serviceType || null }, { serviceType: null }],
      },
    });

    logger.info(`Found ${rules.length} applicable rules for action: ${actionType}`);

    const results = [];

    for (const rule of rules) {
      // Evaluate conditions
      if (this.evaluateConditions(rule, { serviceType, metadata })) {
        const result = await this.applyReward(rule, userId, {
          sourceType,
          sourceId,
          metadata,
        });
        results.push(result);
      }
    }

    return results;
  }

  /**
   * Evaluate if rule conditions are met
   */
  private evaluateConditions(
    rule: { serviceType: string | null },
    context: { serviceType?: string; metadata?: Record<string, any> }
  ): boolean {
    // Check service type if specified
    if (rule.serviceType && rule.serviceType !== context.serviceType) {
      return false;
    }

    // Add more condition checks as needed
    return true;
  }

  /**
   * Apply reward based on rule
   */
  private async applyReward(
    rule: {
      id: number;
      actionType: string;
      pointsAwarded: number;
    },
    userId: number,
    options: {
      sourceType?: string;
      sourceId?: number;
      metadata?: Record<string, any>;
    }
  ) {
    const { sourceType, sourceId, metadata = {} } = options;

    // Get or create reward account
    const account = await prisma.rewardAccount.upsert({
      where: {
        userId,
      },
      create: {
        userId,
        pointsBalance: 0,
        level: 1,
      },
      update: {},
    });

    // Calculate points (can be overridden by metadata)
    let points = rule.pointsAwarded;

    // If it's a spending-based reward, calculate from actual amount
    if (metadata.actualAmount) {
      points = RewardConversion.spendingToCoins(metadata.actualAmount);
    }

    // Create transaction and update balance in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Update account balance
      const updatedAccount = await tx.rewardAccount.update({
        where: { id: account.id },
        data: {
          pointsBalance: {
            increment: points,
          },
        },
      });

      // Create transaction record
      const transaction = await tx.rewardTransaction.create({
        data: {
          rewardAccountId: account.id,
          actionType: rule.actionType,
          points,
          sourceType: sourceType || null,
          sourceId: sourceId || null,
          metadata: metadata,
          isRedeemed: false,
        },
      });

      return { account: updatedAccount, transaction };
    });

    logger.info(
      `Reward applied: ${points} coins for userId:${userId} (action: ${rule.actionType})`
    );

    return result;
  }

  /**
   * Redeem rewards for a service/ride
   */
  async redeem(
    userId: number,
    options: {
      serviceType: string;
      serviceName?: string;
      sourceType?: string;
      sourceId?: number;
      rideAmount: number;
      coinsToRedeem: number;
    }
  ) {
    const { serviceType, serviceName, sourceType, sourceId, rideAmount, coinsToRedeem } = options;

    // Get reward account
    const account = await prisma.rewardAccount.findUnique({
      where: {
        userId,
      },
    });

    if (!account) {
      throw new Error('Reward account not found');
    }

    if (account.pointsBalance < coinsToRedeem) {
      throw new Error(
        `Insufficient coins. Available: ${account.pointsBalance}, Required: ${coinsToRedeem}`
      );
    }

    // Convert coins to discount
    const discountAmount = RewardConversion.coinsToDiscount(coinsToRedeem);

    if (discountAmount > rideAmount) {
      throw new Error('Discount amount cannot exceed ride amount');
    }

    // Create redemption transaction and update balance
    const result = await prisma.$transaction(async (tx) => {
      // Update account balance
      const updatedAccount = await tx.rewardAccount.update({
        where: { id: account.id },
        data: {
          pointsBalance: {
            decrement: coinsToRedeem,
          },
        },
      });

      // Create redemption transaction
      const transaction = await tx.rewardTransaction.create({
        data: {
          rewardAccountId: account.id,
          actionType: 'redemption',
          points: -coinsToRedeem,
          sourceType: sourceType || null,
          sourceId: sourceId || null,
          isRedeemed: true,
          metadata: {
            serviceType,
            serviceName: serviceName || serviceType,
            rideAmount,
            coinsUsed: coinsToRedeem,
            discount: discountAmount,
          },
        },
      });

      return { account: updatedAccount, transaction, discountAmount };
    });

    logger.info(
      `Rewards redeemed: ${coinsToRedeem} coins = ${discountAmount} discount for userId:${userId}`
    );

    return result;
  }

  /**
   * Get reward account balance
   */
  async getBalance(userId: number) {
    const account = await prisma.rewardAccount.findUnique({
      where: {
        userId,
      },
    });

    if (!account) {
      // Return default account if not found
      return {
        pointsBalance: 0,
        level: 1,
        cashValue: 0,
      };
    }

    return {
      ...account,
      cashValue: RewardConversion.coinsToCash(account.pointsBalance),
    };
  }

  /**
   * Get transaction history
   */
  async getTransactions(userId: number, options: { page?: number; limit?: number } = {}) {
    const { page = 1, limit = 20 } = options;
    const skip = (page - 1) * limit;

    const account = await prisma.rewardAccount.findUnique({
      where: {
        userId,
      },
    });

    if (!account) {
      return {
        transactions: [],
        pagination: { page, limit, total: 0, totalPages: 0 },
      };
    }

    const [transactions, total] = await Promise.all([
      prisma.rewardTransaction.findMany({
        where: { rewardAccountId: account.id },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.rewardTransaction.count({
        where: { rewardAccountId: account.id },
      }),
    ]);

    return {
      transactions,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Create a reward rule
   */
  async createRule(data: {
    actionType: string;
    serviceType?: string;
    pointsAwarded: number;
    description?: string;
    isActive?: boolean;
  }) {
    return await prisma.rewardRule.create({
      data: {
        actionType: data.actionType,
        serviceType: data.serviceType || null,
        pointsAwarded: data.pointsAwarded,
        description: data.description || null,
        isActive: data.isActive ?? true,
      },
    });
  }

  /**
   * Update a reward rule
   */
  async updateRule(
    id: number,
    data: {
      actionType?: string;
      serviceType?: string | null;
      pointsAwarded?: number;
      description?: string | null;
      isActive?: boolean;
    }
  ) {
    return await prisma.rewardRule.update({
      where: { id },
      data,
    });
  }

  /**
   * Delete a reward rule
   */
  async deleteRule(id: number) {
    return await prisma.rewardRule.delete({
      where: { id },
    });
  }

  /**
   * Get all reward rules
   */
  async getAllRules(options: { isActive?: boolean } = {}) {
    return await prisma.rewardRule.findMany({
      where: options.isActive !== undefined ? { isActive: options.isActive } : {},
      orderBy: { createdAt: 'desc' },
    });
  }
}

export default new RewardService();
