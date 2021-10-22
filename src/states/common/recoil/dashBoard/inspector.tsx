import { atom, selector } from 'recoil';
import {
  BackTestingSetting,
  BasicSettings,
  IInspectorSettings,
  TradingPropertySetting,
  TradingSetting,
  UniversalSetting,
} from 'components/inspector/_organisms';

/**
* 1.1 인스팩터 상태관리 atom
  전략 생성 페이지의 인스펙터 상태 관리
*/
// 1.1 인스팩터 상태관리 interface & type
export type IInspectorTypes =
  | 'default'
  | 'basicSetting'
  | 'universalSetting'
  | 'tradingSetting' // 매매 전략 추가 삭제
  | 'tradingPropertySetting' // 매매 전략 상세 설정
  | 'backTestingSetting';

// IAtom - 인스팩터 state
interface IAtomInspector {
  isShow: boolean;
  inspectorType: IInspectorTypes;
  inspectorState: {
    // (1) 기본설정
    basicSetting: {
      isComplete: boolean;
    };
    // (2) 종목관리
    universalSetting: {
      tab: number;
      isFilterModalOpen: boolean;
      isComplete: boolean;
    };
    tradingSetting: {
      tab: number;
    };
    tradingPropertySetting: {};
    // (3) 백테스트
    backTestingSetting: {
      tab: number;
      isComplete: boolean;
    };
  };
}
export const atomInspector = atom<IAtomInspector>({
  key: 'Inspector',
  default: {
    isShow: true,
    inspectorType: 'basicSetting',
    inspectorState: {
      basicSetting: { isComplete: false },
      universalSetting: {
        isFilterModalOpen: false,
        tab: 0,
        isComplete: false,
      },
      tradingSetting: { tab: 0 },
      tradingPropertySetting: {},
      backTestingSetting: { tab: 0, isComplete: false },
    },
  },
});

// ----------------------------

/**
* 1.1 인스팩터 상태관리 Selector
  팩토리 패턴을 구현해보려고 했다.
  get: @returns 선택된 인스펙터 JSX 리턴
*/

export const selectorInspectorFC = selector<React.FC<IInspectorSettings>>({
  key: 'selectorInspectorFC',
  get: ({ get }) => {
    const inspectorState = get(atomInspector);
    if (inspectorState.inspectorType === 'default') {
      return BasicSettings;
    } else if (inspectorState.inspectorType === 'basicSetting') {
      return BasicSettings;
    } else if (inspectorState.inspectorType === 'universalSetting') {
      return UniversalSetting;
    } else if (inspectorState.inspectorType === 'tradingSetting') {
      return TradingSetting;
    } else if (inspectorState.inspectorType === 'tradingPropertySetting') {
      return TradingPropertySetting;
    } else if (inspectorState.inspectorType === 'backTestingSetting') {
      return BackTestingSetting;
    } else {
      return BasicSettings;
    }
  },
});
