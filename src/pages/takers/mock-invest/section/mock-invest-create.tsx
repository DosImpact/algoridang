import React, { useMemo } from 'react';
import { List, InputItem } from 'antd-mobile';
import { Title } from 'components/_atoms/Typos';
import WhiteSpace from 'components/_atoms/WhiteSpace';
import WingBlank from 'components/_atoms/WingBlank';
import NavHeaderDetail from 'components/_molecules/NavHeaderDetail';
import StrategyCardBox from 'components/_molecules/StrategyCardBox';
import { useHistory, useParams } from 'react-router-dom';
import useStrategyDetail from 'states/react-query/strategy/useStrategyDetail';
import { toTagsString, toTickerImage } from 'utils/parse';
import { Button } from 'components/_atoms/Buttons';
import { useForm } from 'react-hook-form';
import { useForkStrategy } from 'states/react-query/strategy/useForkStrategy';
import InputListItem from 'components/_atoms/InputListItem';

interface IForkStrategyForm {
  strategy_code: string; // "52",
  strategy_name: string; // "따라해보는 전략 테스트",
  invest_principal: string; // "8800000",
  securities_corp_fee: string; // "8.8"
}

const MockInvestCreate = () => {
  // route 처리
  const history = useHistory();
  const params = useParams() as { id: string };
  const strategyCode = params?.id || 0;
  if (strategyCode === 0) {
    history.push('/');
  }

  // 전략에 대한 정보
  const { strategyDetailQuery } = useStrategyDetail(strategyCode + '');
  const memberStrategy = useMemo(
    () => strategyDetailQuery?.data?.memberStrategy,
    [strategyDetailQuery?.data],
  );

  // form 처리
  const { register, handleSubmit, formState, getValues, setValue } =
    useForm<IForkStrategyForm>({
      defaultValues: {
        strategy_code: String(strategyCode),
      },
    });

  // mutation 처리
  const { forkStrategyMutation } = useForkStrategy();
  console.log('formState.errors', formState.errors);

  return (
    <>
      <NavHeaderDetail
        linkTo={
          process.env.PUBLIC_URL +
          `/takers/strategy-search/details/${strategyCode}`
        }
        headerTitle="전략 생성 하기"
      />
      <WingBlank>
        {strategyDetailQuery.isLoading && 'loading...'}
        <WhiteSpace />
        {memberStrategy && (
          <StrategyCardBox
            title={memberStrategy.strategy_name}
            subTitle={toTagsString(
              memberStrategy.hashList?.map((e) => e?.hash?.hash_contents),
            )}
            CAGR={
              memberStrategy?.backtestDetailInfo?.year_avg_profit_rate &&
              Number(memberStrategy?.backtestDetailInfo?.year_avg_profit_rate)
            }
            thumnail={
              memberStrategy.universal.length >= 1
                ? toTickerImage(memberStrategy.universal[0].ticker)
                : ''
            }
            onErrorImg={memberStrategy.image_url}
          />
        )}
        <WingBlank>
          <Title title={'기본 설정'} />
          <InputListItem>
            <label>전략 코드</label>
            <input disabled value={getValues('strategy_code')} />
          </InputListItem>
          <InputListItem
            error={!!formState.errors.strategy_name?.message}
            errorMessage={formState.errors.strategy_name?.message}
          >
            <label htmlFor="strategy_name">전략이름</label>
            <input
              type="text"
              id="strategy_name"
              placeholder="eg) 1번 전략"
              {...register('strategy_name', {
                required: true,
                validate: {
                  lessThan: (v) => v.length <= 50 || '50자 이하',
                  MoreThan: (v) => v.length >= 2 || '2자 이상',
                },
              })}
            />
          </InputListItem>
          <WhiteSpace />
          <WhiteSpace />
          <Title title={'사용자 설정'} />
          <>
            <InputListItem
              error={!!formState.errors.invest_principal?.message}
              errorMessage={formState.errors.invest_principal?.message}
            >
              <label htmlFor="invest_principal">원금</label>
              <input
                type="text"
                id="invest_principal"
                placeholder="투자 시작 금액을 입력해주세요"
                {...register('invest_principal', {
                  required: true,
                  validate: {
                    moreThan: (v) =>
                      Number(v) >= 1000000 || '100만원 보다 큰 금액',
                  },
                })}
              />
            </InputListItem>

            <InputListItem>
              <label htmlFor="securities_corp_fee">수수료%</label>
              <input
                type="text"
                id="securities_corp_fee"
                placeholder="거래당 발생하는 수수료"
                {...register('securities_corp_fee', {
                  required: true,
                  validate: {
                    lessThan: (v) => Number(v) >= 100 || '100 보다 작은 금액',
                  },
                })}
              />
            </InputListItem>
          </>
          <WhiteSpace />
        </WingBlank>
        <Button
          style={{
            height: '4.6rem',
            fontSize: '1.8rem',
            lineHeight: '1.6rem',
          }}
          onClick={handleSubmit((data) => {
            console.log('data', data);
          })}
        >
          전략 생성 및 백테스팅 시작
        </Button>
      </WingBlank>
    </>
  );
};

export default MockInvestCreate;
