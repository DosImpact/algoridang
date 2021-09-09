import { atom, selector } from "recoil";
import {
  BackTestingSetting,
  BasicSettings,
  IInspectorSettings,
  TradingPropertySetting,
  TradingSetting,
  UniversalSetting,
} from "components/_organisms/inspector";
import { Corporation } from "states/interface/finance/entities";
/**
 * 전략 생성에 대한 클라이언트 상태관리 입니다.
 *
 * 주요 상태 관리 대상  - atom,selector 이용
 * 1. 전략 생성에 필요한 대시보드 + 인스펙터의 View 상태 관리
 * 2. 사용자입력 (Form 및 HTMLInputElement) 에 대한 데이터 바인딩
 * 3. API 호출시 Body조립을 위한
 */

// 1.1 인스팩터 상태관리 interface & type
export type IInspectorTypes =
  | "default"
  | "basicSetting"
  | "universalSetting"
  | "tradingSetting" // 매매 전략 추가 삭제
  | "tradingPropertySetting" // 매매 전략 상세 설정
  | "backTestingSetting";

interface IInspector {
  isShow: boolean;
  inspectorType: IInspectorTypes;
  inspectorState: {
    basicSetting: {};
    universalSetting: {
      tab: number;
      isFilterModalOpen: boolean;
    };
    tradingSetting: {
      tab: number;
    };
    tradingPropertySetting: {};
    backTestingSetting: {
      tab: number;
    };
  };
}
// 1.1 인스팩터 상태관리 atom
// 전략 생성 페이지의 인스펙터 상태 관리
export const atomInspector = atom<IInspector>({
  key: "Inspector",
  default: {
    isShow: true,
    inspectorType: "basicSetting",
    inspectorState: {
      basicSetting: {},
      universalSetting: {
        isFilterModalOpen: false,
        tab: 0,
      },
      tradingSetting: { tab: 0 },
      tradingPropertySetting: {},
      backTestingSetting: { tab: 0 },
    },
  },
});

// 1.1 인스팩터 상태관리 Selector
// 인스펙터 JSX Selector
export const selectorInspector = selector<React.FC<IInspectorSettings>>({
  key: "selectorInspector",
  get: ({ get }) => {
    const inspectorState = get(atomInspector);
    if (inspectorState.inspectorType === "default") {
      return BasicSettings;
    } else if (inspectorState.inspectorType === "basicSetting") {
      return BasicSettings;
    } else if (inspectorState.inspectorType === "universalSetting") {
      return UniversalSetting;
    } else if (inspectorState.inspectorType === "tradingSetting") {
      return TradingSetting;
    } else if (inspectorState.inspectorType === "tradingPropertySetting") {
      return TradingPropertySetting;
    } else if (inspectorState.inspectorType === "backTestingSetting") {
      return BackTestingSetting;
    } else {
      return BasicSettings;
    }
  },
});

// 1.1 인스팩터 상태관리 Selector
// 전략 기본 설정 상태관리
interface IBasicSetting {
  strategy_name: string; // 전략 이름
  strategy_explanation: string; // 전략 설명
  tags: string[];

  invest_principal: string; // 투자 원금
  invest_start_date: string; // 백테스트 시작일
  securities_corp_fee: string; // 수수료

  open_yes_no: boolean; // 공개범위
}

// 2.1 전략 기본 설정 상태관리 - atom
// 전략 기본 설정 입력 form 저장 atom
export const atomBasicSetting = atom<IBasicSetting>({
  key: "BasicSetting",
  default: {
    strategy_name: "",
    strategy_explanation: "",
    tags: [""],
    open_yes_no: true,
    invest_principal: "",
    invest_start_date: "",
    securities_corp_fee: "",
  },
});
// 2.2 종목 관리 상태관리 - atom
interface IUniversalSettingState {
  // 선택된 종목들
  // 퀀트 필터들
  selectedCorporations: Corporation[];
}
export const atomUniversalSettingState = atom<IUniversalSettingState>({
  key: "UniversalSettingState",
  default: {
    selectedCorporations: [],
  },
});
// 2.3 단일 종목 매매전략 설정
interface ITradingSetting {}

interface ITradingPropertySetting {}
interface IBackTestingSetting {}

// TODO selector 에서 비동기 처리?
