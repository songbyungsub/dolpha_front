/*
=========================================================
* Material Kit 2 React - v2.1.0
=========================================================

* Product Page: https://www.creative-tim.com/product/material-kit-react
* Copyright 2023 Creative Tim (https://www.creative-tim.com)

Coded by www.creative-tim.com

 =========================================================

* The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
*/
// @mui material components
import Grid from "@mui/material/Grid";
import Box from "@mui/material/Box";
import CircularProgress from "@mui/material/CircularProgress";
import Chip from "@mui/material/Chip";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import ArrowUpward from "@mui/icons-material/ArrowUpward";
import ArrowDownward from "@mui/icons-material/ArrowDownward";
import Assessment from "@mui/icons-material/Assessment";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";

// Material Kit 2 React components
import MKBox from "components/MKBox";
import MKTypography from "components/MKTypography";

// Material Kit 2 React examples
import DefaultNavbar from "examples/Navbars/DefaultNavbar";

// Routes
import routes from "routes";

import { useState, useEffect } from "react";
import { useAuth } from "contexts/AuthContext";
import { useNavigate } from "react-router-dom";

// Custom hooks and components
import { useNotification } from "components/NotificationSystem/NotificationSystem";
import { useFinancialData } from "hooks/useFinancialData";
import { useAutotradingConfig } from "hooks/useAutotradingConfig";
import { useTradingForm } from "hooks/useTradingForm";
import { useChartInteractions } from "hooks/useChartInteractions";
import FinancialModal from "components/FinancialModal/FinancialModal";
import AutotradingAccordion from "components/AutotradingAccordion/AutotradingAccordion";
import ChartContainer from "components/ChartContainer/ChartContainer";
import { formatNumber } from "utils/formatters";


function Presentation() {
  const [stockData, setStockData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedStock, setSelectedStock] = useState(null);
  const [ohlcvData, setOhlcvData] = useState([]); // OHLCV 데이터 상태 추가
  const { isAuthenticated, authenticatedFetch, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [indexData, setIndexData] = useState([]); // 인덱스 데이터 상태 추가
  const [indexOhlcvData, setIndexOhlcvData] = useState([]); // 인덱스 OHLCV 데이터 상태 추가
  const [selectedIndexCode, setSelectedIndexCode] = useState(''); // 선택된 인덱스 코드
  const [analysisData, setAnalysisData] = useState([]); // 주식 분석 데이터 상태 추가
  const [activeTab, setActiveTab] = useState(0); // 탭 상태 (0: 투자목록, 1: 자동매매)
  
  // Custom hooks
  const { showSnackbar, NotificationComponent } = useNotification();
  const { 
    openFinancialModal, 
    financialData, 
    financialLoading, 
    handleOpenFinancialModal, 
    handleCloseFinancialModal 
  } = useFinancialData();
  const {
    autotradingList,
    expandedAccordion,
    fetchAutotradingList,
    deleteAutotradingConfig,
    toggleAutotradingConfig,
    handleAccordionChange
  } = useAutotradingConfig(authenticatedFetch, showSnackbar);
  
  // Trading form hook
  const tradingForm = useTradingForm(selectedStock, authenticatedFetch, showSnackbar);
  
  // Chart interactions hook
  const chartInteractions = useChartInteractions(
    tradingForm.entryPoint,
    tradingForm.pyramidingEntries,
    activeTab,
    tradingForm.setEntryPoint,
    tradingForm.handlePyramidingEntryChange,
    showSnackbar
  );
  
  

  
  // 실제 OHLCV 데이터 가져오기
  const fetchOHLCVData = async (stockCode) => {
    if (!stockCode) return [];
    
    try {
      chartInteractions.setChartLoading(true);
      const apiBaseUrl = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8000';
      const response = await fetch(`${apiBaseUrl}/api/find_stock_ohlcv?code=${stockCode}&limit=63`);
      if (!response.ok) {
        throw new Error('OHLCV 데이터를 가져올 수 없습니다');
      }
      const result = await response.json();
      const data = result.data || [];
      
      // 날짜순으로 정렬 (오래된 날짜부터)
      const sortedData = data.sort((a, b) => new Date(a.date) - new Date(b.date));
      setOhlcvData(sortedData);
      return sortedData;
    } catch (err) {
      // OHLCV 데이터 로드 실패
      setOhlcvData([]);
      return [];
    }
  };

  // 종목 관련 인덱스 데이터 가져오기
  const fetchStockIndexData = async (stockCode) => {
    if (!stockCode) return [];
    
    try {
      const apiBaseUrl = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8000';
      const response = await fetch(`${apiBaseUrl}/api/find_stock_index?code=${stockCode}&limit=10`);
      if (!response.ok) {
        throw new Error('인덱스 데이터를 가져올 수 없습니다');
      }
      const result = await response.json();
      const data = result.data || [];
      setIndexData(data);
      
      // 첫 번째 인덱스를 기본 선택
      if (data.length > 0) {
        setSelectedIndexCode(data[0].code);
        await fetchIndexOHLCVData(data[0].code);
      } else {
        setSelectedIndexCode('');
        setIndexOhlcvData([]);
      }
      
      return data;
    } catch (err) {
      // 인덱스 데이터 로드 실패
      setIndexData([]);
      setSelectedIndexCode('');
      return [];
    }
  };

  // 인덱스 OHLCV 데이터 가져오기
  const fetchIndexOHLCVData = async (indexCode) => {
    if (!indexCode) return [];
    
    try {
      const apiBaseUrl = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8000';
      const response = await fetch(`${apiBaseUrl}/api/find_index_ohlcv?code=${indexCode}&limit=63`);
      if (!response.ok) {
        throw new Error('인덱스 OHLCV 데이터를 가져올 수 없습니다');
      }
      const result = await response.json();
      const data = result.data || [];
      
      // 날짜순으로 정렬 (오래된 날짜부터)
      const sortedData = data.sort((a, b) => new Date(a.date) - new Date(b.date));
      setIndexOhlcvData(sortedData);
      return sortedData;
    } catch (err) {
      // 인덱스 OHLCV 데이터 로드 실패
      setIndexOhlcvData([]);
      return [];
    }
  };

  // 주식 분석 데이터 가져오기
  const fetchStockAnalysisData = async (stockCode) => {
    if (!stockCode) return [];
    
    try {
      const apiBaseUrl = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8000';
      const response = await fetch(`${apiBaseUrl}/api/find_stock_analysis?code=${stockCode}&limit=63`);
      if (!response.ok) {
        throw new Error('주식 분석 데이터를 가져올 수 없습니다');
      }
      const result = await response.json();
      const data = result.data || [];
      
      // 날짜순으로 정렬 (오래된 날짜부터)
      const sortedData = data.sort((a, b) => new Date(a.date) - new Date(b.date));
      setAnalysisData(sortedData);
      return sortedData;
    } catch (err) {
      // 주식 분석 데이터 로드 실패
      setAnalysisData([]);
      return [];
    }
  };




  // 자동매매 설정 저장 함수
  const saveAutotradingConfig = async () => {
    if (!isAuthenticated) {
      showSnackbar('로그인이 필요합니다.', 'warning');
      return;
    }

    const success = await tradingForm.saveAutotradingConfig(autotradingList, navigate);
    if (success) {
      // 저장 성공 후 데이터 새로고침
      await Promise.all([
        fetchAutotradingList(), // 자동매매 목록 새로고침
        tradingForm.loadAutobotConfig(selectedStock.code, true) // 현재 종목 설정 새로고침 (알림 없이)
      ]);
    }
  };

  // API 데이터 가져오기
  useEffect(() => {
    const fetchStockData = async () => {
      try {
        setLoading(true);
        const apiBaseUrl = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8000';
        const response = await fetch(`${apiBaseUrl}/api/find_stock_inMTT?format=json`);
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        const result = await response.json();
        const data = result.data || []; // API 응답에서 data 배열 추출
        setStockData(data);
        if (data.length > 0) {
          setSelectedStock(data[0]); // 첫 번째 종목을 기본 선택
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchStockData();
  }, []);

  // 선택된 종목이 변경될 때 OHLCV 데이터 가져오기
  useEffect(() => {
    const loadData = async () => {
      if (selectedStock && selectedStock.code) {
        try {
          await Promise.all([
            fetchOHLCVData(selectedStock.code),
            fetchStockIndexData(selectedStock.code),
            fetchStockAnalysisData(selectedStock.code)
          ]);
        } finally {
          // Data loading completed
        }
      }
    };
    
    loadData();
  }, [selectedStock]);


  const handleStockClick = (stock) => {
    setSelectedStock(stock);
    // 초기화는 useEffect에서 자동으로 처리됨
  };


  // 인덱스 선택 핸들러
  const handleIndexChange = async (event) => {
    const indexCode = event.target.value;
    setSelectedIndexCode(indexCode);
    if (indexCode) {
      await fetchIndexOHLCVData(indexCode);
    } else {
      setIndexOhlcvData([]);
    }
  };

  // 탭 변경 핸들러
  const handleTabChange = (_, newValue) => {
    // 자동매매 탭(1번)으로 변경할 때 로그인 체크
    if (newValue === 1) {
      if (!authLoading && !isAuthenticated) {
        showSnackbar('자동매매 기능을 사용하려면 로그인이 필요합니다.', 'warning');
        navigate('/pages/authentication/sign-in');
        return;
      }
    }
    
    setActiveTab(newValue);
    
    // 자동매매 탭으로 변경될 때 autobot 설정 로드 및 아코디언 열기
    if (newValue === 1 && selectedStock && selectedStock.code) {
      tradingForm.loadAutobotConfig(selectedStock.code);
      handleAccordionChange(selectedStock.code);
    }
  };




  // 자동매매 탭으로 변경될 때 목록 로드
  useEffect(() => {
    if (activeTab === 1) {
      fetchAutotradingList();
    }
  }, [activeTab]);



  // 종목 선택 핸들러 (차트 + 아코디언 동시 업데이트)
  const handleStockSelection = (stock) => {
    setSelectedStock(stock);
    handleAccordionChange(stock.code);
    // 해당 종목의 autobot 설정 로드
    tradingForm.loadAutobotConfig(stock.code);
  };





  return (
    <>
      <DefaultNavbar
        routes={routes}
        sticky
      />
      <Box
        sx={{
          height: "100vh",
          width: "100%",
          backgroundColor: "#f8f9fa",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
        }}
      >
        {/* 네비게이션 바 높이만큼 패딩 추가 */}
        <Box sx={{ height: "80px", flexShrink: 0 }} />
        
        <Grid container spacing={0.5} sx={{ height: "calc(100vh - 80px)", p: 0.5 }}>
          {/* 왼쪽 차트 영역 */}
          <Grid item xs={12} md={9} sx={{ 
            height: "100%",
            display: "flex",
            flexDirection: "column",
            overflow: "hidden"
          }}>
            <MKBox
              sx={{
                backgroundColor: "white",
                borderRadius: 2,
                boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
                height: "100%",
                display: "flex",
                flexDirection: "column",
                overflow: "hidden",
              }}
            >
              {/* 헤더 부분 */}
              <MKBox sx={{ px: 1, py: 1, pt: 0, flexShrink: 0, borderBottom: "1px solid #e0e0e0" }}>
                {/* <MKTypography variant="h5" textAlign="center">
                  {selectedStock ? `${selectedStock.name || '선택된 종목'} 차트` : '차트'}
                </MKTypography> */}
                
                {/* 선택된 종목 정보 */}
                {selectedStock && (
                  <MKBox 
                    p={1.5} 
                    sx={{ 
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      borderRadius: 1,
                      boxShadow: '0 2px 8px rgba(102, 126, 234, 0.1)',
                      position: 'relative'
                    }}
                  >
                    <Grid container spacing={1} alignItems="center">
                      {/* 종목명 & 코드 */}
                      <Grid item xs={12} sm={3}>
                        <MKBox>
                          <MKTypography variant="caption" color="white" sx={{ fontSize: '0.7rem' }}>
                            종목명
                          </MKTypography>
                          <MKBox sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            <MKTypography variant="body2" fontWeight="bold" color="white" sx={{ fontSize: '0.85rem', lineHeight: 1.2 }}>
                              {selectedStock.name || '-'}
                            </MKTypography>
                            <MKTypography variant="caption" color="white" sx={{ fontSize: '0.65rem' }}>
                              ({selectedStock.code || '-'})
                            </MKTypography>
                          </MKBox>
                        </MKBox>
                      </Grid>
                      
                      {/* 마켓 정보 */}
                      <Grid item xs={12} sm={1.5}>
                        <MKBox>
                          <MKTypography variant="caption" color="white" sx={{ fontSize: '0.7rem' }}>
                            마켓
                          </MKTypography>
                          <MKTypography variant="body2" fontWeight="bold" color="white" sx={{ fontSize: '0.85rem' }}>
                            KOSPI
                          </MKTypography>
                        </MKBox>
                      </Grid>
                      
                      {/* 종가 */}
                      <Grid item xs={12} sm={2.5}>
                        <MKBox>
                          <MKTypography variant="caption" color="white" sx={{ fontSize: '0.7rem' }}>
                            종가
                          </MKTypography>
                          <MKTypography variant="body2" fontWeight="bold" color="white" sx={{ fontSize: '0.85rem' }}>
                            {ohlcvData.length > 0 ? 
                              new Intl.NumberFormat('ko-KR').format(ohlcvData[ohlcvData.length - 1]?.close) : 
                              '-'
                            }
                          </MKTypography>
                        </MKBox>
                      </Grid>
                      
                      {/* 등락율 */}
                      <Grid item xs={12} sm={2.5}>
                        <MKBox>
                          <MKTypography variant="caption" color="white" sx={{ fontSize: '0.7rem' }}>
                            등락율
                          </MKTypography>
                          <MKBox sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            {ohlcvData.length >= 2 && (
                              ohlcvData[ohlcvData.length - 1]?.close >= ohlcvData[ohlcvData.length - 2]?.close ? (
                                <ArrowUpward sx={{ fontSize: '14px', color: 'white' }} />
                              ) : (
                                <ArrowDownward sx={{ fontSize: '14px', color: 'white' }} />
                              )
                            )}
                            <MKTypography 
                              variant="body2" 
                              fontWeight="bold" 
                              color="white"
                              sx={{ fontSize: '0.85rem' }}
                            >
                              {ohlcvData.length >= 2 ? 
                                `${((ohlcvData[ohlcvData.length - 1]?.close - ohlcvData[ohlcvData.length - 2]?.close) / 
                                   ohlcvData[ohlcvData.length - 2]?.close * 100) >= 0 ? '+' : ''}${(
                                  (ohlcvData[ohlcvData.length - 1]?.close - ohlcvData[ohlcvData.length - 2]?.close) / 
                                   ohlcvData[ohlcvData.length - 2]?.close * 100
                                ).toFixed(2)}%` :
                                '-'
                              }
                            </MKTypography>
                          </MKBox>
                        </MKBox>
                      </Grid>
                      
                      {/* ATR */}
                      <Grid item xs={12} sm={2}>
                        <MKBox>
                          <MKTypography variant="caption" color="white" sx={{ fontSize: '0.7rem' }}>
                            ATR
                          </MKTypography>
                          <MKTypography variant="body2" fontWeight="bold" color="white" sx={{ fontSize: '0.85rem' }}>
                            {analysisData.length > 0 && analysisData[analysisData.length - 1]?.atr ? 
                              analysisData[analysisData.length - 1].atr.toFixed(1) : 
                              '-'
                            }
                          </MKTypography>
                        </MKBox>
                      </Grid>
                      
                      {/* 재무제표 버튼 */}
                      <Grid item xs={12} sm={0.5}>
                        <MKBox sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', height: '100%', justifyContent: 'center' }}>
                          <IconButton
                            onClick={() => handleOpenFinancialModal(selectedStock)}
                            sx={{
                              color: 'white',
                              padding: '2px',
                              '&:hover': {
                                backgroundColor: 'rgba(255,255,255,0.1)',
                              }
                            }}
                            title="재무제표 보기"
                          >
                            <Assessment sx={{ fontSize: '18px' }} />
                          </IconButton>
                        </MKBox>
                      </Grid>
                    </Grid>
                  </MKBox>
                )}
              </MKBox>

              {/* 스크롤 가능한 차트 영역 */}
              <MKBox
                sx={{
                  flex: 1,
                  overflow: "auto",
                  display: "flex",
                  flexDirection: "column",
                  '&::-webkit-scrollbar': {
                    width: '8px',
                  },
                  '&::-webkit-scrollbar-track': {
                    background: '#f1f1f1',
                    borderRadius: '4px',
                  },
                  '&::-webkit-scrollbar-thumb': {
                    background: '#c1c1c1',
                    borderRadius: '4px',
                    '&:hover': {
                      background: '#a1a1a1',
                    },
                  },
                }}
              >
                {!selectedStock && (
                  <MKBox
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      height: "100%",
                      flexDirection: "column",
                      gap: 2,
                    }}
                  >
                    <MKBox
                      sx={{
                        width: 64,
                        height: 64,
                        borderRadius: "50%",
                        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        mb: 2,
                      }}
                    >
                      <MKTypography variant="h4" color="white">
                        📈
                      </MKTypography>
                    </MKBox>
                    <MKTypography variant="h6" color="text" textAlign="center">
                      종목을 선택하세요
                    </MKTypography>
                    <MKTypography variant="body2" color="text" textAlign="center">
                      오른쪽 목록에서 종목을 클릭하면
                      <br />
                      캔들스틱 차트가 표시됩니다
                    </MKTypography>
                  </MKBox>
                )}
                
                {selectedStock && (
                  <ChartContainer
                    ohlcvData={ohlcvData}
                    analysisData={analysisData}
                    indexOhlcvData={indexOhlcvData}
                    indexData={indexData}
                    selectedIndexCode={selectedIndexCode}
                    selectedStock={selectedStock}
                    entryPoint={tradingForm.entryPoint}
                    pyramidingEntries={tradingForm.pyramidingEntries}
                    activeTab={activeTab}
                    onIndexChange={handleIndexChange}
                    onEntryPointChange={tradingForm.setEntryPoint}
                    onPyramidingEntryChange={tradingForm.handlePyramidingEntryChange}
                    onShowSnackbar={showSnackbar}
                  />)}
              </MKBox>
            </MKBox>
          </Grid>

          {/* 오른쪽 종목 목록 */}
          <Grid item xs={12} md={3} sx={{ 
            height: "100%",
            display: "flex",
            flexDirection: "column",
            overflow: "hidden"
          }}>
            <MKBox
              sx={{
                backgroundColor: "white",
                borderRadius: 2,
                boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
                height: "100%",
                display: "flex",
                flexDirection: "column",
                overflow: "hidden",
              }}
            >
              {/* 탭 헤더 */}
              <MKBox sx={{ flexShrink: 0, borderBottom: "1px solid #e0e0e0" }}>
                <Tabs
                  value={activeTab}
                  onChange={handleTabChange}
                  sx={{
                    minHeight: '48px',
                    '& .MuiTabs-indicator': {
                      backgroundColor: '#667eea',
                      height: '3px',
                    },
                    '& .MuiTab-root': {
                      fontWeight: 'bold',
                      fontSize: '0.9rem',
                      color: '#666',
                      '&.Mui-selected': {
                        color: '#667eea',
                      },
                    },
                  }}
                >
                  <Tab label="투자목록" />
                  <Tab label="자동매매" />
                </Tabs>
              </MKBox>
              
              {loading && (
                <MKBox
                  sx={{
                    flex: 1,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <CircularProgress />
                </MKBox>
              )}

              {error && (
                <MKBox
                  sx={{
                    flex: 1,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <MKTypography color="error">
                    데이터 로드 중 오류가 발생했습니다: {error}
                  </MKTypography>
                </MKBox>
              )}

              {!loading && !error && stockData.length > 0 && (
                <>
                  {/* 투자목록 탭 내용 */}
                  {activeTab === 0 && (
                    <>
                      {/* 테이블 헤더 */}
                      <MKBox
                        sx={{
                          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                          p: 1,
                          display: 'flex',
                          alignItems: 'center',
                          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                          flexShrink: 0,
                        }}
                      >
                        <Grid container spacing={0}>
                          <Grid item xs={3.5}>
                            <MKTypography variant="subtitle2" color="white" fontWeight="bold">
                              종목명
                            </MKTypography>
                          </Grid>
                          <Grid item xs={2.5}>
                            <MKTypography variant="subtitle2" color="white" fontWeight="bold" textAlign="center">
                              RS순위
                            </MKTypography>
                          </Grid>
                          <Grid item xs={3}>
                            <MKTypography variant="subtitle2" color="white" fontWeight="bold" textAlign="center">
                              당기매출
                            </MKTypography>
                          </Grid>
                          <Grid item xs={3}>
                            <MKTypography variant="subtitle2" color="white" fontWeight="bold" textAlign="center">
                              영업이익
                            </MKTypography>
                          </Grid>
                        </Grid>
                      </MKBox>

                      {/* 스크롤 가능한 테이블 바디 */}
                      <MKBox
                        sx={{
                          flex: 1,
                          overflow: 'auto',
                          backgroundColor: 'white',
                          '&::-webkit-scrollbar': {
                            width: '8px',
                          },
                          '&::-webkit-scrollbar-track': {
                            background: '#f1f1f1',
                            borderRadius: '4px',
                          },
                          '&::-webkit-scrollbar-thumb': {
                            background: '#c1c1c1',
                            borderRadius: '4px',
                            '&:hover': {
                              background: '#a1a1a1',
                            },
                          },
                        }}
                      >
                        {stockData.map((row, rowIndex) => (
                          <MKBox
                            key={row.code || rowIndex}
                            onClick={() => handleStockClick(row)}
                            sx={{
                              p: 0.5,
                              borderBottom: rowIndex === stockData.length - 1 ? 'none' : '1px solid #f0f0f0',
                              cursor: 'pointer',
                              transition: 'all 0.2s ease',
                              backgroundColor: selectedStock?.code === row.code 
                                ? 'linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%)'
                                : rowIndex % 2 === 0 ? '#fafafa' : 'white',
                              '&:hover': {
                                backgroundColor: 'rgba(102, 126, 234, 0.08)',
                                transform: 'translateX(4px)',
                                boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                                borderLeft: '3px solid #667eea',
                              },
                              ...(selectedStock?.code === row.code && {
                                borderLeft: '3px solid #667eea',
                                boxShadow: '0 2px 12px rgba(102, 126, 234, 0.2)',
                              }),
                            }}
                          >
                            <Grid container spacing={0} alignItems="center">
                              <Grid item xs={3.5}>
                                <MKBox>
                                  <MKTypography 
                                    variant="body2" 
                                    fontWeight={selectedStock?.code === row.code ? "bold" : "medium"}
                                    color={selectedStock?.code === row.code ? "info" : "text"}
                                    sx={{
                                      fontSize: '0.8rem',
                                      lineHeight: 1.1,
                                      overflow: 'hidden',
                                      textOverflow: 'ellipsis',
                                      whiteSpace: 'nowrap',
                                    }}
                                  >
                                    {row.name || '-'}
                                  </MKTypography>
                                  <MKTypography 
                                    variant="caption" 
                                    color="text"
                                    sx={{ fontSize: '0.7rem' }}
                                  >
                                    {row.code || ''}
                                  </MKTypography>
                                </MKBox>
                              </Grid>
                              <Grid item xs={2.5}>
                                <MKBox display="flex" justifyContent="center">
                                  <Chip
                                    label={row.rsRank || '-'}
                                    size="small"
                                    sx={{
                                      backgroundColor: row.rsRank >= 80 ? '#4caf50' : 
                                                     row.rsRank >= 60 ? '#ff9800' : 
                                                     row.rsRank >= 40 ? '#f44336' : '#9e9e9e',
                                      color: 'white',
                                      fontWeight: 'bold',
                                      fontSize: '0.7rem',
                                      minWidth: '35px',
                                      height: '20px',
                                    }}
                                  />
                                </MKBox>
                              </Grid>
                              <Grid item xs={3}>
                                <MKBox display="flex" justifyContent="center" alignItems="center">
                                  <MKTypography 
                                    variant="body2" 
                                    textAlign="center"
                                    color={row['당기매출'] < 0 ? 'info' : 'text'}
                                    fontWeight={row['당기매출'] < 0 ? 'bold' : 'bold'}
                                    sx={{ 
                                      fontSize: '0.75rem',
                                      color: row['당기매출'] < 0 ? '#1976d2' : 'inherit',
                                      fontWeight: row['당기매출'] < 0 ? 'bold' : 'bold'
                                    }}
                                  >
                                    {formatNumber(row['당기매출']) || '0'}
                                  </MKTypography>
                                </MKBox>
                              </Grid>
                              <Grid item xs={3}>
                                <MKBox display="flex" justifyContent="center" alignItems="center">
                                  <MKTypography 
                                    variant="body2" 
                                    textAlign="center"
                                    color={row['당기영업이익'] < 0 ? 'info' : 'text'}
                                    fontWeight={row['당기영업이익'] < 0 ? 'bold' : 'bold'}
                                    sx={{ 
                                      fontSize: '0.8rem',
                                      color: row['당기영업이익'] < 0 ? '#1976d2' : 'inherit',
                                      fontWeight: row['당기영업이익'] < 0 ? 'bold' : 'bold'
                                    }}
                                  >
                                    {formatNumber(row['당기영업이익']) || '0'}
                                  </MKTypography>
                                </MKBox>
                              </Grid>
                            </Grid>
                          </MKBox>
                        ))}
                      </MKBox>
                    </>
                  )}

                  {/* 자동매매 탭 내용 */}
                  {activeTab === 1 && (
                    <MKBox
                      sx={{
                        flex: 1,
                        overflow: 'auto',
                        p: 2,
                        '&::-webkit-scrollbar': {
                          width: '6px',
                        },
                        '&::-webkit-scrollbar-track': {
                          background: '#f1f1f1',
                          borderRadius: '3px',
                        },
                        '&::-webkit-scrollbar-thumb': {
                          background: '#c1c1c1',
                          borderRadius: '3px',
                          '&:hover': {
                            background: '#a1a1a1',
                          },
                        },
                      }}
                    >
                      {!isAuthenticated ? (
                        <MKBox
                          sx={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            py: 4,
                            textAlign: 'center'
                          }}
                        >
                          <MKTypography variant="h5" sx={{ mb: 2, color: '#666' }}>
                            로그인이 필요합니다
                          </MKTypography>
                          <MKTypography variant="body1" sx={{ mb: 3, color: '#888' }}>
                            자동매매 기능을 사용하려면 Google 로그인이 필요합니다.
                          </MKTypography>
                          <Button
                            variant="contained"
                            onClick={() => navigate('/pages/authentication/sign-in')}
                            sx={{
                              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                              color: 'white',
                              px: 4,
                              py: 1.5,
                              '&:hover': {
                                background: 'linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%)',
                              },
                            }}
                          >
                            로그인 하러 가기
                          </Button>
                        </MKBox>
                      ) : (
                        <>
                          {/* 종목별 자동매매 설정 아코디언 */}
                          <MKBox>
                            <MKTypography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>
                              자동매매 설정
                            </MKTypography>
                        
                        <AutotradingAccordion
                          autotradingList={autotradingList}
                          expandedAccordion={expandedAccordion}
                          onAccordionChange={handleAccordionChange}
                          onToggle={toggleAutotradingConfig}
                          onDelete={deleteAutotradingConfig}
                          onRefresh={fetchAutotradingList}
                          onStockSelect={handleStockSelection}
                          selectedStock={selectedStock}
                          showSnackbar={showSnackbar}
                        />
                          </MKBox>
                        </>
                      )}
                    </MKBox>
                  )}

                  {!loading && !error && stockData.length === 0 && (
                    <MKBox
                      sx={{
                        flex: 1,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <MKTypography color="text">
                        데이터가 없습니다.
                      </MKTypography>
                    </MKBox>
                  )}
                </>
              )}
            </MKBox>

          </Grid>
        </Grid>
      </Box>

      {/* Financial Modal Component */}
      <FinancialModal 
        open={openFinancialModal}
        onClose={handleCloseFinancialModal}
        selectedStock={selectedStock}
        financialData={financialData}
        loading={financialLoading}
      />

      {/* Notification System */}
      <NotificationComponent />
    </>
  );
}

export default Presentation; 
