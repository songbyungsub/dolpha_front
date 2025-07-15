import { useState } from 'react';

/**
 * 재무제표 데이터 관리 훅
 */
export const useFinancialData = () => {
  const [openFinancialModal, setOpenFinancialModal] = useState(false);
  const [financialData, setFinancialData] = useState([]);
  const [financialLoading, setFinancialLoading] = useState(false);

  // 재무제표 데이터 가져오기
  const fetchFinancialData = async (stockCode) => {
    if (!stockCode) return [];
    
    try {
      setFinancialLoading(true);
      const apiBaseUrl = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8000';
      const response = await fetch(`${apiBaseUrl}/api/find_stock_financial?code=${stockCode}&limit=50`);
      if (!response.ok) {
        throw new Error('재무제표 데이터를 가져올 수 없습니다');
      }
      const result = await response.json();
      const data = result.data || [];
      
      setFinancialData(data);
      return data;
    } catch (err) {
      console.error('재무제표 데이터 로딩 실패:', err);
      setFinancialData([]);
      throw err;
    } finally {
      setFinancialLoading(false);
    }
  };

  // 재무제표 모달 열기
  const handleOpenFinancialModal = async (selectedStock) => {
    setOpenFinancialModal(true);
    if (selectedStock && selectedStock.code) {
      await fetchFinancialData(selectedStock.code);
    }
  };

  // 재무제표 모달 닫기
  const handleCloseFinancialModal = () => {
    setOpenFinancialModal(false);
  };

  return {
    // State
    openFinancialModal,
    financialData,
    financialLoading,
    
    // Actions
    fetchFinancialData,
    handleOpenFinancialModal,
    handleCloseFinancialModal
  };
};