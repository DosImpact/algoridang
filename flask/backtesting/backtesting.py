from __future__ import (absolute_import, division, print_function,
                        unicode_literals)

import json
from backtrader import strategy
#from quantstats._plotting.wrappers import daily_returns
import requests
import pandas as pd
import backtrader as bt
from pandas import json_normalize

import quantstats

from openAPI.DB.DB import databasepool

class BarAnalysis(bt.analyzers.Analyzer):
    ticker = ""
    rets = {}
    winCnt = 0
    loseCnt = 0
    tradehistory = []
    def start(self):
        self.rets['data']  = {}
        
    def next(self):
        try:
            if not self.rets['data'].get(str(self.datas[0].datetime.datetime())) :
                self.rets['data'][str(self.datas[0].datetime.datetime())]  = []
            
            self.rets['data'][str(self.datas[0].datetime.datetime())].append(
                    [
                        #self.datas[0].datetime.datetime(),
                        self.ticker,
                        self.datas[0].open[0],
                        self.datas[0].high[0],
                        self.datas[0].low[0],
                        self.datas[0].close[0],
                        self.datas[0].volume[0],
                        self.strategy.getposition().size,
                        self.strategy.broker.getvalue(),  # 주식 + 현금
                        self.strategy.broker.getcash(),  # 현금
                    ]
                )
        except:
            pass

    def get_analysis(self):
        return self.rets
    def get_winloseCnt(self):
        return self.winCnt,self.loseCnt
    def get_tradehistory(self):
        return self.tradehistory

    def notify_trade(self, trade):
        date = self.data.datetime.datetime()
        
        if trade.isopen:
            self.tradehistory.append([str(date),trade.price,None,self.ticker])
            """
            print('-'*32,' OPEN NOTIFY TRADE ','-'*32)
            print('{}, Price: {}'.format(date,trade.price))
            """
                                                


        if trade.isclosed:
            #히스토리 생성기
            self.tradehistory.append([str(date),self.datas[0].close[0],round(self.datas[0].close[0]/trade.price*100-100,2),self.ticker])

            """
            print('-'*32,' CLOSE NOTIFY TRADE ','-'*32)
            print('{}, Price: {}, Profit, Gross {}, Net {}'.format(
                                                date,
                                                trade.price,
                                                round(trade.pnl,2),
                                                round(trade.pnlcomm,2)))
                                                """
            # 승수 계산기
            if round(trade.pnl,2) > 0:
                self.winCnt += 1
            else:
                self.loseCnt += 1
                
class SMACross(bt.Strategy):
    param = [ 5 , 20 ]
    def __init__(self):
        sma1 = bt.ind.SMA(period=self.param[0]) # fast moving average 
        sma2 = bt.ind.SMA(period=self.param[1]) # slow moving average 
        self.crossover = bt.ind.CrossOver(sma1, sma2) # crossover signal 
        self.holding = 0

  
    def next(self): 
        if not self.position: # not in the market 
            if self.crossover > 0: # if fast crosses slow to the upside 
                close = self.data.close[0] # 종가 값 
                size = int(self.broker.getcash() / close)  # 최대 구매 가능 개수 
                self.buy(size=size) # 매수 size = 구매 개수 설정 
                
                dt = self.datas[0].datetime.date(0)
                #print('%s' % (dt.isoformat()),"buy : ",self.data.close[0])
        elif self.crossover < 0: # in the market & cross to the downside 
            
            dt = self.datas[0].datetime.date(0)
            #print('%s' % (dt.isoformat()),"sell : ",self.data.close[0])
            self.close() # 매도
        #print(self.data.close[0])
    
    def notify_order(self, order):
        if order.status not in [order.Completed]:
            return
        ftest = 0
        if order.isbuy():
            action = 'Buy'
            ftest=1
        elif order.issell():
            action = 'Sell'
            ftest=2
        stock_price = self.data.close[0]
        cash = self.broker.getcash()
        value = self.broker.getvalue()
        self.holding += order.size
        """
        if ftest == 1:
            print("buy : ",stock_price)
        if ftest == 2:
            print("sell : ",stock_price)
        """
        #print('%s[%d] holding[%d] price[%d] cash[%.2f] value[%.2f]'
        #      % (action, abs(order.size), self.holding, stock_price, cash, value))


   

class CBackTtrader(object):
    def __init__(self) -> None:
        super().__init__()

   


    def getDBData(self,ticker, start, end = None):
        DBClass = databasepool()
        conn = DBClass.getConn()
        if DBClass:
            query = "select stock_date, open_price, high_price, low_price, close_price, volume from daily_stock"
            query += " where \"ticker\" = \'"+ticker+"\' order by stock_date asc;"
            
            df = DBClass.selectDataframe(conn,query)
            df["stock_date"] = pd.to_datetime(df["stock_date"], format='%Y-%m-%d')
            df = df.set_index("stock_date")
            df = df.sort_values(by=['stock_date'], axis=0, ascending=True)

            df.rename(columns={
                "open_price":"Open"	,
                "high_price":"High"	,
                "low_price":"Low",
                "close_price":'Close'	,
                "volume":"Volume"
            },inplace = True)

            res = []
            if end == None or end == '':
                res = df[str(pd.to_datetime(start, format='%Y-%m-%d')) : ]
            else:
                res = df[str(pd.to_datetime(start, format='%Y-%m-%d')) :str(pd.to_datetime(end, format='%Y-%m-%d')) ]

            DBClass.putConn(conn)

            return res
        return "error"

#data startbackTest
    def startbackTest(self,tickerList, cash, startTime, endTime= None):
        if type(tickerList) is list:   
            ticker = tickerList[0]
        else :
            ticker = tickerList


        cerebro = bt.Cerebro()
        #cash setting
        cerebro.broker.setcash(int(cash))
        dateparser = lambda x: pd.datetime.strptime(x, '%Y-%m-%d')

        cerebro.broker.set_coc(True)
        # Add a strategy
        SMACross.pfast = 5
        SMACross.pslow = 20
        cerebro.addstrategy(SMACross)

        #pandas data inpute
        cerebro.adddata(bt.feeds.PandasData(dataname = self.getDBData(ticker,startTime,endTime)),name=ticker)
        
        #run strategy
        print('Starting Portfolio Value: %.2f' % cerebro.broker.getvalue())
        cerebro.run()
        print('Final Portfolio Value: %.2f' % cerebro.broker.getvalue())
        #cerebro.plot()

        return cerebro.broker.getvalue()

    def __setStrategy(self, strategyCode):
        strategyList = []
        DBClass = databasepool()
        conn = DBClass.getConn()
        if DBClass:
            query = "select u.strategy_code,u.ticker, u.trading_strategy_name ,u.setting_json from universal u where u.strategy_code = "+str(strategyCode)
            
            df = DBClass.selectDataframe(conn,query)
            DBClass.putConn(conn)
            for index, row in df.iterrows():
                if  row[2]== 'GoldenCross':
                    setting = [row[3]['GoldenCross']['pfast'],row[3]['GoldenCross']['pslow']]
                    setting = [5,20]
                    strategyList.append(( row[1] , SMACross ,setting, 1)) 

        return strategyList
        #(ticker, strategy, setting , weigth)


    def requestBacktestOneStock(self, data):
        #data = {'ticker': '["005930","005930"]', 'startTime': '20110101', 'endTime': '', 'strategyCode': '1', 'investPrice': '10000000'}
        
        
        #self.__setStrategy(data["strategyCode"])
        case = (self.__setStrategy(data["strategyCode"]))
        if len(case) == 0 :
            print("DB dose'not have any data in this field...")
            return "error"

        total = 0

        for ticker , stg, setting, wgt in case:
            cerebro = bt.Cerebro()
            cerebro.params.tradehistory = True
            for i in range(len(stg.param)):
                stg.param[i] = setting[i]

            cerebro.broker.setcash(int(data['investPrice']))
            
            cerebro.broker.set_coc(True) # 구매 신청시 무조건 최대 금액으로 살 수 있음.
            cerebro.addstrategy(stg)
            cerebro.addanalyzer(bt.analyzers.PyFolio, _name = 'PyFolio')
            BarAnalysis.ticker = ticker
            cerebro.addanalyzer(BarAnalysis, _name="bar_data")
       
            #pandas data inpute
            cerebro.adddata(bt.feeds.PandasData(dataname = self.getDBData(ticker,data['startTime'],data['endTime'])),name=ticker)
            

            print('Starting Portfolio Value: %.2f' % cerebro.broker.getvalue())
            results = cerebro.run()
            print('Final Portfolio Value: %.2f' % cerebro.broker.getvalue())
            #cerebro.plot()
            strat = results[0]

            ### 일간 수익 로그
            bar_data_res = strat.analyzers.bar_data.get_analysis()
            dailydata = pd.DataFrame(bar_data_res)
            dailydata.to_csv('saleLog.txt', sep = '\t')

            portfolio_stats = strat.analyzers.getbyname('PyFolio')
            returns, positions, transactions, gross_lev = portfolio_stats.get_pf_items()
            returns.index = returns.index.tz_convert(None)
            
            #for idx, data in returns.items():
            #    print(idx, data)
            metrics = quantstats.reports.metrics(returns, mode='full', display=False)
            print ("%%%%"*5)
            #백테스트 상세정보
            print(metrics.loc['CAGR%']['Strategy'], metrics.loc['Max Drawdown ']['Strategy'], )

            #월간 수익률
            print(quantstats.stats.monthly_returns(returns))

            # 승수 출력
            winCnt, loseCnt = strat.analyzers.bar_data.get_winloseCnt()
            print(winCnt,loseCnt)


            # 히스토리 출력하기
            tradehitory = strat.analyzers.bar_data.get_tradehistory()
            print(tradehitory)
            print ("%%%%"*5)
            total+= cerebro.broker.getvalue()
            break



        return total




