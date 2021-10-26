import React, { useMemo } from 'react';
import { useParams } from 'react-router-dom';
import styled from 'styled-components';
import useStrategyDetail from 'states/strategy/query/useStrategyDetail';
import NavHeaderDetail from 'components/common/_molecules/NavHeaderDetail';
import WingBlank from 'components/common/_atoms/WingBlank';
import WhiteSpace from 'components/common/_atoms/WhiteSpace';
import StrategyCardInfo from 'components/common/_molecules/StrategyCardInfo';
import Scrollable from 'components/common/_molecules/Scrollable';
import QuantStatesReport from 'components/report/_organisms/QuantStatesReport';

interface IStrategyBackTestReport {
  showForkButton?: boolean;
}
const StrategyBackTestReport: React.FC<IStrategyBackTestReport> = ({
  showForkButton,
}) => {
  showForkButton = showForkButton === undefined ? true : false;

  const params = useParams() as { id: string };
  const strategyCode = params?.id || 0;
  const { strategyDetailQuery } = useStrategyDetail(strategyCode + '');

  const memberStrategy = useMemo(
    () => strategyDetailQuery?.data?.memberStrategy,
    [strategyDetailQuery?.data],
  );

  if (strategyCode === 0) {
    return (
      <div>
        <WingBlank>전략이 없습니다.</WingBlank>
      </div>
    );
  }
  const SERVER_URL = process.env.REACT_APP_SERVER_URI;

  return (
    <PStrategyBTDetail>
      <NavHeaderDetail
        linkTo={
          process.env.PUBLIC_URL +
          `/takers/strategy-search/details/${strategyCode}`
        }
        headerTitle="백테스트 리포트"
      />
      <WingBlank>
        <WhiteSpace />
        {memberStrategy && <StrategyCardInfo strategy={memberStrategy} />}
        <Scrollable />
      </WingBlank>
      <QuantStatesReport strategyCode={strategyCode} />
    </PStrategyBTDetail>
  );
};

export default StrategyBackTestReport;

const PStrategyBTDetail = styled.section`
  margin-bottom: 120px;
  /* overflow: hidden; */
`;
