import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityNotFoundError, Like, Raw, Repository } from 'typeorm';
import {
  GetCorporationInput,
  GetCorporationOutput,
  GetCorporationsWithTermOutput,
  GetDayilStocksInput,
  GetDayilStocksOutput,
  GetCorporationsOutput,
  GetCorporationsWithTermInput,
  GetFinancialStatementOutput,
  GetFinancialStatementInput,
  QuantSelectionInput,
  QuantSelectionOutput,
  QuantSelectionLookupListOutput,
  QuantSelectionLookupTypeOutput,
} from './dtos/query.dtos';
import {
  Category,
  CategoryList,
  Corporation,
  DailyStock,
} from './entities/index';
import { execSync } from 'child_process';
import { join } from 'path';
import { FlaskService } from '../backtest/flask.service';
import {
  RequestQuantSelectDefaultOutput,
  RequestQuantSelectInput,
  RequestQuantSelectLookUpOutput,
  RequestQuantSelectOutput,
} from 'src/backtest/dto/query.dtos';
import { FinancialStatement } from './entities/financial-statement.entity';
// import { promisify } from 'util';

// π¨βπ» FinanceService μ μ±μμ΄ λ§μ€νλ€.
// > μλΉμ€ λ¨μλ₯Ό λλνμμ±..?
// eg) κ°κ²©λ°μ΄ν°κ΄λ ¨ μλΉμ€, νμ¬κ΄λ ¨ μλΉμ€
// >μ¬λ¬ λ ν¬κ° νμν μλΉμ€λΌλ©΄?

@Injectable()
export class FinanceService {
  constructor(
    @InjectRepository(Category)
    private readonly categoryRepo: Repository<Category>,
    @InjectRepository(CategoryList)
    private readonly categoryListRepo: Repository<CategoryList>,
    @InjectRepository(Corporation)
    private readonly corporationRepo: Repository<Corporation>,
    @InjectRepository(DailyStock)
    private readonly dailyStockRepo: Repository<DailyStock>,
    @InjectRepository(FinancialStatement)
    private readonly financialStatementRepo: Repository<FinancialStatement>,

    @Inject(forwardRef(() => FlaskService))
    private readonly flaskService: FlaskService,
  ) {}

  // (1) λͺ¨λ  νμ¬λ€μ λ¦¬μ€νΈλ₯Ό λ¦¬ν΄
  async getCorporations(): Promise<GetCorporationsOutput> {
    const corporations = await this.corporationRepo.find({});
    return {
      ok: true,
      corporations,
    };
  }
  // (2) κ²μμ΄λ‘, νμ¬λ€μ λ¦¬μ€νΈλ₯Ό λ¦¬ν΄
  async getCorporationsWithTerm({
    term,
  }: GetCorporationsWithTermInput): Promise<GetCorporationsWithTermOutput> {
    const corporations = await this.corporationRepo.find({
      where: [{ ticker: Like(`%${term}%`) }, { corp_name: Like(`%${term}%`) }],
    });
    if (!corporations)
      throw new EntityNotFoundError(
        Corporation,
        `cannot find stock by ${term}`,
      );
    return {
      ok: true,
      corporations,
    };
  }

  // (3) νμ¬μ λ³΄ νλλ₯Ό κ²μν©λλ€.
  async getCorporation({
    term,
  }: GetCorporationInput): Promise<GetCorporationOutput> {
    const corporation = await this.corporationRepo.findOneOrFail({
      where: [{ ticker: Like(`%${term}%`) }, { corp_name: Like(`%${term}%`) }],
    });
    return {
      ok: true,
      corporation,
    };
  }

  // (4) κ°κ²©λ°μ΄ν°λ₯Ό κ²μν©λλ€.
  async getDailyStocks({
    term,
    skip,
    take,
    sort,
  }: GetDayilStocksInput): Promise<GetDayilStocksOutput> {
    const dailyStocks = await this.dailyStockRepo.find({
      where: {
        ticker: term,
      },
      order: {
        stock_date: 'DESC',
      },
      skip: skip || 0,
      take: take || 365,
    });
    if (sort === 'ASC') {
      dailyStocks.reverse();
    }
    if (!dailyStocks)
      throw new EntityNotFoundError(
        DailyStock,
        `cannot find dailystock with term ${term}`,
      );
    return {
      ok: true,
      dailyStocks,
    };
  }

  // (7) νΉμ  μ’λͺ©μκ°μ§ μ λ΅ μ½λλ€ λ°ν
  async searchTickerByTerm(term: string) {
    return await this.corporationRepo.find({
      where: [
        { ticker: Raw((ticker) => `${ticker} ILIKE '${term}'`) },
        { corp_name: Raw((corp_name) => `${corp_name} ILIKE '${term}'`) },
      ],
    });
  }

  async getFinancialStatements({
    ticker,
  }: GetFinancialStatementInput): Promise<GetFinancialStatementOutput> {
    const financialStatements = await this.financialStatementRepo.find({
      where: { ticker },
      order: { finance_date: 'DESC' },
    });

    return {
      financialStatements,
      ok: true,
    };
  }

  async QuantSelection(
    body: QuantSelectionInput,
  ): Promise<QuantSelectionOutput> {
    return this.flaskService.__requestQuantSelection(body);
  }

  async QuantSelectionLookupList(): Promise<QuantSelectionLookupListOutput> {
    return this.flaskService.__requestQuantSelectLookUp();
  }
  async QuantSelectionLookupType(
    index: number,
  ): Promise<QuantSelectionLookupTypeOutput> {
    return this.flaskService.__requestQuantSelectDefault(index);
  }
  async QuantSelectionLookupAll() {}
}
