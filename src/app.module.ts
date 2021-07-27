import {
  CacheModule,
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
} from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { GraphQLModule } from '@nestjs/graphql';
import * as Joi from 'joi';
import { join } from 'path';
import { AppController } from './app.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FinanceModule } from './finance/finance.module';
import { JwtModule } from './auth/jwt.module';
import { AppResolver } from './app.resolver';
import { JwtMiddleWare } from './auth/jwt.middleware';
import { StrategyModule } from './strategy/strategy.module';
import { TradingModule } from './trading/trading.module';
import { BacktestModule } from './backtest/backtest.module';
import { MemberModule } from './member/member.module';
import { MemberInfo } from './member/entities/member-info.entity';
import { MemberStrategy } from './strategy/entities/member-strategy.entity';
import { LookupMemberList } from './member/entities/lookup-member-list.entity';
import { OperationMemberList } from './member/entities/operation-member-list.entity';
import {
  AccumulateProfitRateChart,
  BacktestDetailInfo,
  BacktestMontlyProfitRateChart,
  BacktestQueue,
  BacktestWinRatio,
  History,
  InvestProfitInfo,
} from './backtest/entities';
import { Hash, HashList, StockList } from './strategy/entities';
import {
  Category,
  CategoryList,
  Corporation,
  DailyStock,
} from './finance/entities';
import { BaseTradingStrategy } from './trading/entities/base_trading_strategy.entity';
import { CustomTradingStrategy } from './trading/entities';
import { UploadModule } from './upload/upload.module';
import * as redisStore from 'cache-manager-redis-store';
import { UploadedObject } from './upload/entities/uploaded-object.entity';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: process.env.NODE_ENV === 'dev' ? '.env.dev' : '.env.test',
      ignoreEnvFile: process.env.NODE_ENV === 'prod',
      validationSchema: Joi.object({
        MAINTAINER: Joi.string().required(),
        PORT: Joi.number().required(),
        DATABASE_URL: Joi.string().required(),
        DATABASE_rejectUnauthorized: Joi.string().required(),
      }),
    }),
    GraphQLModule.forRoot({
      introspection: true,
      playground: true,
      autoSchemaFile: join(process.cwd(), 'src/schema.gql'),
      sortSchema: true,
    }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      url: process.env.DATABASE_URL,
      ...(process.env.DATABASE_rejectUnauthorized === 'false' && {
        ssl: {
          rejectUnauthorized: false,
        },
      }),
      synchronize: true,
      logging: false,
      entities: [
        ...[
          // finance (4/4)
          CategoryList,
          Category,
          Corporation,
          DailyStock,
        ],
        ...[
          // Trading(2/2)
          CustomTradingStrategy,
          BaseTradingStrategy,
        ],
        ...[
          //
          Hash,
          HashList,
          MemberStrategy,
          StockList,
        ],
        ...[
          // back test (7/7)
          AccumulateProfitRateChart,
          BacktestDetailInfo,
          BacktestMontlyProfitRateChart,
          BacktestQueue,
          BacktestWinRatio,
          History,
          InvestProfitInfo,
        ],
        ...[
          //member (3/3)
          LookupMemberList,
          MemberInfo,
          OperationMemberList,
        ],
        ...[
          //upload
          UploadedObject,
        ],
      ],
    }),
    JwtModule.forRoot({ privateKey: process.env.JWT_SECRET_KEY }),
    UploadModule,
    CacheModule.register({
      store: redisStore,
      host: process.env.REDIS_API_CACHE_HOST, // '127.0.0.1',
      port: process.env.REDIS_API_CACHE_PORT, //6379,
      password: process.env.REDIS_API_CACHE_PASSWORD, //
      ttl: +process.env.REDIS_API_CACHE_TTL, // 10초 캐슁
      // max: 3, // 3개의 key값 유지
    }),
    AuthModule,
    FinanceModule,
    // UserModule,
    StrategyModule,
    TradingModule,
    BacktestModule,
    MemberModule,
  ],
  controllers: [AppController],
  providers: [AppResolver],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(JwtMiddleWare).forRoutes({
      path: '*',
      method: RequestMethod.ALL,
    });
  }
}
