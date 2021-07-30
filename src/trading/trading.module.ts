import { forwardRef, Module } from '@nestjs/common';
import { TradingService } from './trading.service';
import { TradingResolver } from './trading.resolver';
import {
  TradingMutationController,
  TradingQueryController,
} from './trading.controller';
import { BaseTradingStrategy, CustomTradingStrategy } from './entities';
import { StockList } from './entities/stock-list.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FinanceModule } from 'src/finance/finance.module';
import { StrategyModule } from 'src/strategy/strategy.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      BaseTradingStrategy,
      CustomTradingStrategy,
      StockList,
    ]),
    forwardRef(() => FinanceModule),
    forwardRef(() => StrategyModule),
  ],
  controllers: [TradingQueryController, TradingMutationController],
  providers: [TradingService, TradingResolver],
})
export class TradingModule {}
