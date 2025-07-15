import { useState } from 'react';

/**
 * 자동매매 설정 관리 훅
 */
export const useAutotradingConfig = (authenticatedFetch, showSnackbar) => {
  const [autotradingList, setAutotradingList] = useState([]);
  const [expandedAccordion, setExpandedAccordion] = useState(null);

  // 자동매매 목록 가져오기
  const fetchAutotradingList = async () => {
    try {
      // 첫 번째로 서버 설정이 있는지 확인
      try {
        const serverResponse = await authenticatedFetch('/api/mypage/server-settings');
        if (!serverResponse.ok) {
          if (serverResponse.status === 401) {
            // 서버 설정이 없으면 빈 목록으로 설정하고 종료
            setAutotradingList([]);
            showSnackbar('자동매매 기능을 사용하려면 먼저 autobot 서버 설정을 완료해주세요.', 'warning');
            return;
          }
          // 서버 설정 조회 실패 시에도 빈 목록으로 설정하고 종료
          setAutotradingList([]);
          showSnackbar('서버 설정을 확인할 수 없습니다. 먼저 서버 설정을 완료해주세요.', 'warning');
          return;
        }
      } catch (error) {
        // 서버 설정 확인 실패 시에도 빈 목록으로 설정하고 종료
        setAutotradingList([]);
        showSnackbar('서버 설정을 확인할 수 없습니다. 먼저 서버 설정을 완료해주세요.', 'warning');
        return;
      }

      // 서버 설정이 확인되면 자동매매 개요 목록 가져오기
      const response = await authenticatedFetch('/api/mypage/trading-configs/summary');
      
      if (response.ok) {
        const configs = await response.json();
        
        // 각 설정에 is_from_summary 플래그 추가 (개요에서 온 데이터임을 표시)
        const configsWithFlag = configs.map(config => ({
          ...config,
          is_from_summary: true  // 개요 데이터 플래그
        }));
        
        setAutotradingList(configsWithFlag);
        
        // 최초 로드 시에만 알림 표시
        if (autotradingList.length === 0) {
          showSnackbar(`${configsWithFlag.length}개의 자동매매 설정을 불러왔습니다.`, 'success');
        }
      } else {
        setAutotradingList([]);
        showSnackbar('자동매매 개요 목록 조회에 실패했습니다.', 'error');
      }
      
    } catch (error) {
      setAutotradingList([]);
      showSnackbar(`1차 데이터 로딩 오류: ${error.message}`, 'error');
    }
  };

  // 통합된 주식 목록 생성 (기존 주식 + 자동매매 설정된 주식)
  const getUnifiedStockList = (stockData) => {
    // 자동매매가 설정된 주식들을 주식 목록 형태로 변환
    const configuredStocks = autotradingList.map(config => ({
      code: config.stock_code,
      name: config.stock_name,
      isConfigured: true  // 자동매매 설정 여부 플래그
    }));
    
    // 선택된 주식이 기존 목록에 없고 자동매매도 설정되지 않은 경우 추가
    if (stockData.selectedStock && !autotradingList.find(config => config.stock_code === stockData.selectedStock.code)) {
      configuredStocks.push({
        ...stockData.selectedStock,
        isConfigured: false
      });
    }
    
    // 기존 주식 데이터에 자동매매 설정 플래그 추가
    const enrichedStockData = stockData.stockData.map(stock => ({
      ...stock,
      isConfigured: autotradingList.some(config => config.stock_code === stock.code)
    }));
    
    return {
      configuredStocks,
      enrichedStockData
    };
  };

  // 자동매매 설정 삭제
  const deleteAutotradingConfig = async (stockCode, stockName) => {
    try {
      const configToDelete = autotradingList.find(config => config.stock_code === stockCode);
      
      if (configToDelete) {
        const response = await authenticatedFetch(`/api/mypage/trading-configs/${configToDelete.id}`, {
          method: 'DELETE'
        });
        
        if (response.ok) {
          // 프론트엔드 상태 업데이트
          setAutotradingList(prev => prev.filter(item => item.stock_code !== stockCode));
          showSnackbar(`${stockName}(${stockCode}) 자동매매 설정이 삭제되었습니다.`, 'success');
          
          return { success: true, deletedStock: { code: stockCode, name: stockName } };
        } else {
          showSnackbar('자동매매 설정 삭제에 실패했습니다.', 'error');
          return { success: false };
        }
      }
    } catch (error) {
      showSnackbar(`삭제 실패: ${error.message}`, 'error');
      return { success: false };
    }
  };

  // 자동매매 상태 토글 (프론트엔드 상태만 변경)
  const toggleAutotradingConfig = (stockCode, stockName, currentStatus) => {
    setAutotradingList(prev => 
      prev.map(item => 
        item.stock_code === stockCode 
          ? { ...item, is_active: !currentStatus } 
          : item
      )
    );
    
    showSnackbar(
      `${stockName}(${stockCode}) 자동매매 상태가 변경되었습니다. 저장 버튼을 눌러 적용하세요.`, 
      'info'
    );
  };

  // 아코디언 변경 핸들러
  const handleAccordionChange = (stockCode) => {
    setExpandedAccordion(stockCode);
  };

  return {
    // State
    autotradingList,
    expandedAccordion,
    
    // Actions
    fetchAutotradingList,
    getUnifiedStockList,
    deleteAutotradingConfig,
    toggleAutotradingConfig,
    handleAccordionChange,
    setAutotradingList,
    setExpandedAccordion
  };
};