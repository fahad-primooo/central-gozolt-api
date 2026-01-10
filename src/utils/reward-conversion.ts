/**
 * Reward Conversion Helper
 * Handles conversions between cash amounts and reward coins
 */

export class RewardConversion {
  // Conversion rates (configurable)
  private static readonly CASH_TO_COINS_RATE = 10; // 1 coin = 10 units of currency
  private static readonly SPENDING_TO_COINS_RATE = 100; // Earn 1 coin for every 100 spent

  /**
   * Convert cash amount to reward coins
   * Example: 200 cash = 20 coins
   */
  static cashToCoins(cashAmount: number): number {
    return Math.floor(cashAmount / this.CASH_TO_COINS_RATE);
  }

  /**
   * Convert reward coins to cash value
   * Example: 20 coins = 200 cash
   */
  static coinsToCash(coins: number): number {
    return coins * this.CASH_TO_COINS_RATE;
  }

  /**
   * Calculate coins earned from spending
   * Example: Spending 1000 = 10 coins earned
   */
  static spendingToCoins(spendingAmount: number): number {
    return Math.floor(spendingAmount / this.SPENDING_TO_COINS_RATE);
  }

  /**
   * Calculate discount amount from coins
   * Example: 20 coins = 200 discount
   */
  static coinsToDiscount(coins: number): number {
    return this.coinsToCash(coins);
  }
}

export default RewardConversion;
