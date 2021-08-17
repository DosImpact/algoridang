import React, { useMemo } from "react";
import { WingBlank, WhiteSpace, Button } from "antd-mobile";
import { SubTitle } from "components/data-display/Typo";
import StrategyCard from "components/strategy/StrategyCard";
import { useHistory, useParams } from "react-router-dom";
import { toPercentage, toRatio, toTagsString } from "utils/parse";
import styled from "styled-components";
import DetailSummary from "components/strategy-report/DetailSummary";
import CumulativeReturn from "components/strategy-report/CumulativeReturn";
import MonthlyReturn from "components/strategy-report/MonthlyReturn";
import WinRatio from "components/strategy-report/WinRatio";
import BackNav from "components/takers/BackNav";
import useStrategyDetail from "states/react-query/strategy/useStrategyDetail";
import useBackTestReport from "states/react-query/backtest/useBackTestReport";

const dummyDatas = {
  title: "삼성전자 황금 신호",
  subTitle: ["단일 종목", "골든 크로스"],
  CAGR: 22.22,
};

const dummyDatasReport = {
  header: ["항목", "결과값"],
  body: [
    {
      항목: "운용기간",
      결과값: "⚛",
    },
    {
      항목: "수수료",
      결과값: "⚛",
    },
    {
      항목: "누적수익율",
      결과값: "⚛",
    },
    {
      항목: "연평균수익율",
      결과값: "⚛",
    },
    {
      항목: "MDD",
      결과값: "⚛",
    },
    {
      항목: "거래 개월수",
      결과값: "⚛",
    },
    {
      항목: "상승 개월수",
      결과값: "⚛",
    },
    {
      항목: "승률",
      결과값: "⚛",
    },
    {
      항목: "전체 거래종목수",
      결과값: "⚛",
    },
    {
      항목: "월평균수익률",
      결과값: "⚛",
    },
    {
      항목: "월간변동성(샤프)",
      결과값: "⚛",
    },
  ],
};

const StrategyReport = () => {
  const history = useHistory();
  const params = useParams() as { id: string };
  const strategyCode = params?.id || 0;
  if (strategyCode === 0) {
    history.push("/");
  }
  const { strategyDetailQuery } = useStrategyDetail(strategyCode + "");
  const { accumulateProfitRateQuery, montlyProfitRateQuery, winRatioQuery } =
    useBackTestReport(strategyCode + "");

  const memberStrategy = useMemo(
    () => strategyDetailQuery?.data?.memberStrategy,
    [strategyDetailQuery?.data]
  );
  const backtestDetailInfo = useMemo(
    () => strategyDetailQuery?.data?.memberStrategy?.backtestDetailInfo,
    [strategyDetailQuery?.data]
  );
  const investProfitInfo = useMemo(
    () => strategyDetailQuery?.data?.memberStrategy?.investProfitInfo,
    [strategyDetailQuery?.data]
  );

  // console.log("memberStrategy", memberStrategy);
  // console.log("backtestDetailInfo", backtestDetailInfo);
  // console.log("accumulateProfitRateQuery", accumulateProfitRateQuery);
  // console.log("montlyProfitRateQuery", montlyProfitRateQuery);
  // console.log("winRatioQuery", winRatioQuery);
  const winRatio = useMemo(() => {
    if (winRatioQuery.data?.ok && winRatioQuery.data.backtestWinRatio) {
      const { loss_count, win_count } = winRatioQuery.data.backtestWinRatio;
      return toPercentage(toRatio(win_count, loss_count));
    }
    return null;
  }, [winRatioQuery]);

  const reportBody = useMemo(() => {
    return [
      {
        항목: "수수료",
        결과값: `${
          investProfitInfo?.securities_corp_fee
            ? toPercentage(investProfitInfo?.securities_corp_fee)
            : "-"
        } %`,
      },
      {
        항목: "누적수익율",
        결과값: `${
          investProfitInfo?.profit_rate
            ? toPercentage(investProfitInfo?.profit_rate)
            : "-"
        } %`,
      },
      {
        항목: "연평균수익율",
        결과값: `${
          backtestDetailInfo?.year_avg_profit_rate
            ? toPercentage(backtestDetailInfo?.year_avg_profit_rate)
            : "-"
        } %`,
      },
      {
        항목: "MDD",
        결과값: `${
          backtestDetailInfo?.mdd ? toPercentage(backtestDetailInfo?.mdd) : "-"
        } %`,
      },
      {
        항목: "거래 개월수",
        결과값: `${
          backtestDetailInfo?.trading_month_count
            ? toPercentage(backtestDetailInfo?.trading_month_count)
            : "-"
        }`,
      },
      {
        항목: "상승 개월수",
        결과값: `${
          backtestDetailInfo?.rising_month_count
            ? toPercentage(backtestDetailInfo?.rising_month_count)
            : "-"
        }`,
      },
      {
        항목: "승률",
        결과값: `${winRatio ? winRatio : "-"} %`,
      },
      {
        항목: "월평균수익률",
        결과값: `${
          backtestDetailInfo?.month_avg_profit_rate
            ? toPercentage(backtestDetailInfo?.month_avg_profit_rate)
            : "-"
        }`,
      },
      {
        항목: "연간변동성(표준편차)",
        결과값: `${
          backtestDetailInfo?.yearly_volatility
            ? backtestDetailInfo?.yearly_volatility
            : "-"
        }`,
      },
      {
        항목: "샤프 지수",
        결과값: `${
          backtestDetailInfo?.sharp ? backtestDetailInfo?.sharp : "-"
        }`,
      },
    ];
  }, []);

  return (
    <StrategyDetailP>
      <WingBlank style={{ margin: "15x" }} size="lg">
        <WhiteSpace size="xl" />
        <BackNav title={"투자 전략 리포트"} />
        {memberStrategy && (
          <StrategyCard
            title={memberStrategy.strategy_name}
            subTitle={toTagsString(
              memberStrategy.hashList?.map((e) => e?.hash?.hash_contents)
            )}
            CAGR={
              memberStrategy?.backtestDetailInfo?.year_avg_profit_rate &&
              Number(memberStrategy?.backtestDetailInfo?.year_avg_profit_rate)
            }
            thumnail={memberStrategy.image_url}
          />
        )}
        <>
          <div className="flexRowSBt">
            <SubTitle
              title="모의 투자"
              style={{ marginRight: "15px" }}
            ></SubTitle>
            <Button type="warning" size="small" style={{ width: "100px" }}>
              시작하기
            </Button>
          </div>
        </>
        {/* 4. 상세 리포트 DetailSummary.tsx  */}
        <DetailSummary body={reportBody} header={dummyDatasReport.header} />
        {/* 5. 백테스팅 누적 수익률 CumulativeReturn.tsx */}
        <CumulativeReturn strategyCode={"" + strategyCode} />
        {/* 6. 백테스팅 월간 수익률 */}
        <MonthlyReturn />
        {/* 7. 승률 */}
        <WinRatio />
      </WingBlank>
    </StrategyDetailP>
  );
};

export default StrategyReport;

const StrategyDetailP = styled.section`
  margin-bottom: 120px;
  overflow: hidden;
`;
