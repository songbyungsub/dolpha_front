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
/* eslint-disable */
// @mui material components
import Grid from "@mui/material/Grid";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import Box from "@mui/material/Box";
import CircularProgress from "@mui/material/CircularProgress";
import Chip from "@mui/material/Chip";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import IconButton from "@mui/material/IconButton";
import ArrowUpward from "@mui/icons-material/ArrowUpward";
import ArrowDownward from "@mui/icons-material/ArrowDownward";
import Close from "@mui/icons-material/Close";
import Assessment from "@mui/icons-material/Assessment";
import Timeline from "@mui/icons-material/Timeline";
import Delete from "@mui/icons-material/Delete";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import Radio from "@mui/material/Radio";
import RadioGroup from "@mui/material/RadioGroup";
import FormControlLabel from "@mui/material/FormControlLabel";
import TextField from "@mui/material/TextField";
import Tooltip from "@mui/material/Tooltip";
import ToggleButton from "@mui/material/ToggleButton";

// Material Kit 2 React components
import MKBox from "components/MKBox";
import MKTypography from "components/MKTypography";

// Material Kit 2 React examples
import DefaultNavbar from "examples/Navbars/DefaultNavbar";

// Routes
import routes from "routes";

import { useState, useEffect, useRef } from "react";

// Chart.js imports
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  TimeScale,
  Title,
  Tooltip as ChartTooltip,
  Legend,
  BarElement,
  LineElement,
  PointElement,
} from 'chart.js';
import 'chartjs-adapter-date-fns';
import { CandlestickController, CandlestickElement } from 'chartjs-chart-financial';
import { Chart } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  TimeScale,
  CandlestickController,
  CandlestickElement,
  BarElement,
  LineElement,
  PointElement,
  Title,
  ChartTooltip,
  Legend
);

function Presentation() {
  const [stockData, setStockData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedStock, setSelectedStock] = useState(null);
  const [ohlcvData, setOhlcvData] = useState([]); // OHLCV 데이터 상태 추가
  const [chartLoading, setChartLoading] = useState(false); // 차트 로딩 상태
  const [indexData, setIndexData] = useState([]); // 인덱스 데이터 상태 추가
  const [indexOhlcvData, setIndexOhlcvData] = useState([]); // 인덱스 OHLCV 데이터 상태 추가
  const [selectedIndexCode, setSelectedIndexCode] = useState(''); // 선택된 인덱스 코드
  const [analysisData, setAnalysisData] = useState([]); // 주식 분석 데이터 상태 추가
  const [openFinancialModal, setOpenFinancialModal] = useState(false); // 재무제표 모달 상태
  const [financialData, setFinancialData] = useState([]); // 재무제표 데이터 상태
  const [financialLoading, setFinancialLoading] = useState(false); // 재무제표 로딩 상태
  const [activeTab, setActiveTab] = useState(0); // 탭 상태 (0: 투자목록, 1: 자동매매)
  
  // 자동매매 관련 상태
  const [tradingMode, setTradingMode] = useState('manual'); // 'manual' 또는 'turtle'
  const [maxLoss, setMaxLoss] = useState('');
  const [stopLoss, setStopLoss] = useState('');
  const [takeProfit, setTakeProfit] = useState('');
  const [pyramidingCount, setPyramidingCount] = useState(0);
  const [entryPoint, setEntryPoint] = useState(''); // 단일 진입시점
  const [pyramidingEntries, setPyramidingEntries] = useState([]); // 피라미딩 진입시점 배열
  const [positions, setPositions] = useState([100]); // 포지션 배열 (합이 100%가 되어야 함)
  const [horizontalLines, setHorizontalLines] = useState([]); // 수평선 배열
  const [isDrawingMode, setIsDrawingMode] = useState(false); // 수평선 그리기 모드
  const [isDragging, setIsDragging] = useState(false); // 드래그 상태
  const [dragLineId, setDragLineId] = useState(null); // 드래그 중인 선 ID
  const [selectedLineId, setSelectedLineId] = useState(null); // 선택된 선 ID
  const [showEntryPopup, setShowEntryPopup] = useState(false); // 진입시점 설정 팝업 상태
  
  // 드래그 상태를 즉시 접근 가능하도록 useRef 사용
  const dragStateRef = useRef({
    isDragging: false,
    dragLineId: null
  });
  
  // 차트 참조를 위한 ref
  const chartRef = useRef(null);
  
  // 라벨 위치 강제 업데이트를 위한 상태
  const [labelUpdateTrigger, setLabelUpdateTrigger] = useState(0);
  
  // 차트 데이터 변경 시 라벨 위치 업데이트
  useEffect(() => {
    if (chartRef.current && ohlcvData.length > 0) {
      // 차트가 완전히 렌더링된 후 라벨 위치 업데이트
      const timer = setTimeout(() => {
        setLabelUpdateTrigger(prev => prev + 1);
      }, 200);
      return () => clearTimeout(timer);
    }
  }, [ohlcvData, analysisData]);
  
  // 실제 OHLCV 데이터 가져오기
  const fetchOHLCVData = async (stockCode) => {
    if (!stockCode) return [];
    
    try {
      setChartLoading(true);
      const response = await fetch(`http://218.152.32.218:8000/api/find_stock_ohlcv?code=${stockCode}&limit=63`);
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
      console.error('OHLCV 데이터 로드 실패:', err);
      setOhlcvData([]);
      return [];
    }
  };

  // 종목 관련 인덱스 데이터 가져오기
  const fetchStockIndexData = async (stockCode) => {
    if (!stockCode) return [];
    
    try {
      const response = await fetch(`http://218.152.32.218:8000/api/find_stock_index?code=${stockCode}&limit=10`);
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
      console.error('인덱스 데이터 로드 실패:', err);
      setIndexData([]);
      setSelectedIndexCode('');
      return [];
    }
  };

  // 인덱스 OHLCV 데이터 가져오기
  const fetchIndexOHLCVData = async (indexCode) => {
    if (!indexCode) return [];
    
    try {
      const response = await fetch(`http://218.152.32.218:8000/api/find_index_ohlcv?code=${indexCode}&limit=63`);
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
      console.error('인덱스 OHLCV 데이터 로드 실패:', err);
      setIndexOhlcvData([]);
      return [];
    }
  };

  // 주식 분석 데이터 가져오기
  const fetchStockAnalysisData = async (stockCode) => {
    if (!stockCode) return [];
    
    try {
      const response = await fetch(`http://218.152.32.218:8000/api/find_stock_analysis?code=${stockCode}&limit=63`);
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
      console.error('주식 분석 데이터 로드 실패:', err);
      setAnalysisData([]);
      return [];
    }
  };

  // 재무제표 데이터 가져오기
  const fetchFinancialData = async (stockCode) => {
    if (!stockCode) return [];
    
    try {
      setFinancialLoading(true);
      const response = await fetch(`http://218.152.32.218:8000/api/find_stock_financial?code=${stockCode}&limit=50`);
      if (!response.ok) {
        throw new Error('재무제표 데이터를 가져올 수 없습니다');
      }
      const result = await response.json();
      const data = result.data || [];
      
      setFinancialData(data);
      return data;
    } catch (err) {
      console.error('재무제표 데이터 로드 실패:', err);
      setFinancialData([]);
      return [];
    } finally {
      setFinancialLoading(false);
    }
  };

  // 캔들스틱 차트 데이터 생성 (이동평균선 포함)
  const createCandlestickData = (ohlcvData, analysisData) => {
    if (!ohlcvData || ohlcvData.length === 0) return null;


    const datasets = [
      {
        label: '캔들스틱',
        type: 'candlestick',
        data: ohlcvData.map(item => ({
          x: new Date(item.date).getTime(),
          o: item.open,
          h: item.high,
          l: item.low,
          c: item.close
        })),
        borderColor: function(context) {
          const data = context.parsed;
          return data.c >= data.o ? '#4caf50' : '#f44336';
        },
        backgroundColor: function(context) {
          const data = context.parsed;
          return data.c >= data.o ? 'rgba(76, 175, 80, 0.8)' : 'rgba(244, 67, 54, 0.8)';
        },
        color: {
          up: '#4caf50',
          down: '#f44336',
          unchanged: '#999'
        },
        order: 1
      }
    ];

    // 수평선 추가
    horizontalLines.forEach((line, index) => {
      const timeRange = ohlcvData.length > 0 ? [
        new Date(ohlcvData[0].date).getTime(),
        new Date(ohlcvData[ohlcvData.length - 1].date).getTime()
      ] : [Date.now() - 86400000, Date.now()];


      datasets.push({
        label: `진입선 ${index + 1}`,
        type: 'line',
        data: [
          { x: timeRange[0], y: line.value },
          { x: timeRange[1], y: line.value }
        ],
        borderColor: line.color,
        backgroundColor: 'transparent',
        borderWidth: selectedLineId === line.id ? 3 : 2,
        pointRadius: 0,
        pointHoverRadius: 8,
        tension: 0,
        borderDash: [5, 5],
        order: 10 + index,
        hoverBorderWidth: 4,
        hoverBorderColor: '#ff9800',
        lineId: line.id // 커스텀 속성으로 ID 저장
      });
    });

    // 이동평균선 데이터 추가
    if (analysisData && analysisData.length > 0) {
      // 50일선
      datasets.push({
        label: '50일선',
        type: 'line',
        data: analysisData
          .filter(item => item.ma50 !== null && item.ma50 !== undefined && !isNaN(item.ma50))
          .map(item => ({
            x: new Date(item.date).getTime(),
            y: item.ma50
          })),
        borderColor: '#ff6b35',
        backgroundColor: 'transparent',
        borderWidth: 2,
        pointRadius: 0,
        pointHoverRadius: 4,
        tension: 0.1,
        order: 2
      });

      // 150일선
      datasets.push({
        label: '150일선',
        type: 'line',
        data: analysisData
          .filter(item => item.ma150 !== null && item.ma150 !== undefined && !isNaN(item.ma150))
          .map(item => ({
            x: new Date(item.date).getTime(),
            y: item.ma150
          })),
        borderColor: '#f7931e',
        backgroundColor: 'transparent',
        borderWidth: 2,
        pointRadius: 0,
        pointHoverRadius: 4,
        tension: 0.1,
        order: 3
      });

      // 200일선
      datasets.push({
        label: '200일선',
        type: 'line',
        data: analysisData
          .filter(item => item.ma200 !== null && item.ma200 !== undefined && !isNaN(item.ma200))
          .map(item => ({
            x: new Date(item.date).getTime(),
            y: item.ma200
          })),
        borderColor: '#9c27b0',
        backgroundColor: 'transparent',
        borderWidth: 2,
        pointRadius: 0,
        pointHoverRadius: 4,
        tension: 0.1,
        order: 4
      });
    }

    return { datasets };
  };

  // 인덱스 캔들스틱 차트 데이터 생성
  const createIndexCandlestickData = (indexOhlcvData) => {
    if (!indexOhlcvData || indexOhlcvData.length === 0) return null;

    return {
      datasets: [
        {
          label: '인덱스 캔들스틱',
          type: 'candlestick',
          data: indexOhlcvData.map(item => ({
            x: new Date(item.date).getTime(),
            o: item.open,
            h: item.high,
            l: item.low,
            c: item.close
          })),
          borderColor: function(context) {
            const data = context.parsed;
            return data.c >= data.o ? '#2196f3' : '#ff9800';
          },
          backgroundColor: function(context) {
            const data = context.parsed;
            return data.c >= data.o ? 'rgba(33, 150, 243, 0.8)' : 'rgba(255, 152, 0, 0.8)';
          },
          color: {
            up: '#2196f3',
            down: '#ff9800',
            unchanged: '#999'
          }
        }
      ]
    };
  };
  
  // 거래량 차트 데이터 생성
  const createVolumeData = (ohlcvData) => {
    if (!ohlcvData || ohlcvData.length === 0) return null;

    return {
      datasets: [
        {
          label: '거래량',
          type: 'bar',
          data: ohlcvData.map(item => ({
            x: new Date(item.date).getTime(),
            y: item.volume || 0
          })),
          backgroundColor: ohlcvData.map(item => 
            item.close >= item.open ? 'rgba(76, 175, 80, 0.6)' : 'rgba(244, 67, 54, 0.6)'
          ),
          borderColor: ohlcvData.map(item => 
            item.close >= item.open ? '#4caf50' : '#f44336'
          ),
          borderWidth: 1
        }
      ]
    };
  };

  // RS Rank 차트 데이터 생성
  const createRSRankData = (analysisData) => {
    if (!analysisData || analysisData.length === 0) return null;

    return {
      datasets: [
        {
          label: 'RS Rank',
          type: 'line',
          data: analysisData
            .filter(item => item.rsRank !== null && item.rsRank !== undefined && !isNaN(item.rsRank))
            .map(item => ({
              x: new Date(item.date).getTime(),
              y: item.rsRank
            })),
          borderColor: '#667eea',
          backgroundColor: 'transparent',
          borderWidth: 2,
          pointRadius: 3,
          pointHoverRadius: 5,
          tension: 0.1
        },
        {
          label: 'RS Rank 1M',
          type: 'line',
          data: analysisData
            .filter(item => item.rsRank1m !== null && item.rsRank1m !== undefined && !isNaN(item.rsRank1m))
            .map(item => ({
              x: new Date(item.date).getTime(),
              y: item.rsRank1m
            })),
          borderColor: '#ff6b35',
          backgroundColor: 'transparent',
          borderWidth: 2,
          pointRadius: 2,
          pointHoverRadius: 4,
          tension: 0.1
        },
        {
          label: 'RS Rank 3M',
          type: 'line',
          data: analysisData
            .filter(item => item.rsRank3m !== null && item.rsRank3m !== undefined && !isNaN(item.rsRank3m))
            .map(item => ({
              x: new Date(item.date).getTime(),
              y: item.rsRank3m
            })),
          borderColor: '#f7931e',
          backgroundColor: 'transparent',
          borderWidth: 2,
          pointRadius: 2,
          pointHoverRadius: 4,
          tension: 0.1
        },
        {
          label: 'RS Rank 6M',
          type: 'line',
          data: analysisData
            .filter(item => item.rsRank6m !== null && item.rsRank6m !== undefined && !isNaN(item.rsRank6m))
            .map(item => ({
              x: new Date(item.date).getTime(),
              y: item.rsRank6m
            })),
          borderColor: '#9c27b0',
          backgroundColor: 'transparent',
          borderWidth: 2,
          pointRadius: 2,
          pointHoverRadius: 4,
          tension: 0.1
        },
        {
          label: 'RS Rank 12M',
          type: 'line',
          data: analysisData
            .filter(item => item.rsRank12m !== null && item.rsRank12m !== undefined && !isNaN(item.rsRank12m))
            .map(item => ({
              x: new Date(item.date).getTime(),
              y: item.rsRank12m
            })),
          borderColor: '#2196f3',
          backgroundColor: 'transparent',
          borderWidth: 2,
          pointRadius: 2,
          pointHoverRadius: 4,
          tension: 0.1
        }
      ]
    };
  };

  // API 데이터 가져오기
  useEffect(() => {
    const fetchStockData = async () => {
      try {
        setLoading(true);
        const response = await fetch('http://218.152.32.218:8000/api/find_stock_inMTT?format=json');
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
        setChartLoading(true);
        try {
          await Promise.all([
            fetchOHLCVData(selectedStock.code),
            fetchStockIndexData(selectedStock.code),
            fetchStockAnalysisData(selectedStock.code)
          ]);
        } finally {
          setChartLoading(false);
        }
      }
    };
    
    loadData();
  }, [selectedStock]);

  // 숫자를 억/조 단위로 포맷팅하는 함수
  const formatNumber = (value) => {
    if (!value || value === 0) return '0';
    
    const numValue = Number(value);
    if (isNaN(numValue)) return value;

    const absValue = Math.abs(numValue);
    
    if (absValue >= 1000000000000) { // 조 단위 (1조 = 1,000,000,000,000)
      return `${(numValue / 1000000000000).toFixed(1)}조`;
    } else if (absValue >= 100000000) { // 억 단위 (1억 = 100,000,000)
      return `${(numValue / 100000000).toFixed(1)}억`;
    } else if (absValue >= 10000) { // 만 단위
      return `${(numValue / 10000).toFixed(1)}만`;
    } else {
      return numValue.toLocaleString();
    }
  };

  const handleStockClick = (stock) => {
    setSelectedStock(stock);
  };

  // 재무제표 모달 열기/닫기
  const handleOpenFinancialModal = async () => {
    setOpenFinancialModal(true);
    if (selectedStock && selectedStock.code) {
      await fetchFinancialData(selectedStock.code);
    }
  };

  const handleCloseFinancialModal = () => {
    setOpenFinancialModal(false);
  };


  // 금액을 억/조 단위로 포맷팅하는 함수 (재무제표용)
  const formatFinancialAmount = (amount) => {
    if (!amount || amount === 0) return '0';
    
    const absAmount = Math.abs(amount);
    
    if (absAmount >= 1000000000000) { // 조 단위
      return `${(amount / 1000000000000).toFixed(1)}조`;
    } else if (absAmount >= 100000000) { // 억 단위
      return `${(amount / 100000000).toFixed(1)}억`;
    } else if (absAmount >= 10000) { // 만 단위
      return `${(amount / 10000).toFixed(1)}만`;
    } else {
      return amount.toLocaleString();
    }
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
    setActiveTab(newValue);
  };

  // KRX 호가단위 계산 함수
  const getKRXTickSize = (price) => {
    const numPrice = parseFloat(price) || 0;
    
    if (numPrice < 1000) return 1;
    if (numPrice < 5000) return 5;
    if (numPrice < 10000) return 10;
    if (numPrice < 50000) return 50;
    if (numPrice < 100000) return 100;
    if (numPrice < 500000) return 500;
    return 1000;
  };

  // 가격을 KRX 호가단위로 조정하는 함수
  const adjustToKRXTickSize = (price) => {
    const numPrice = parseFloat(price) || 0;
    const tickSize = getKRXTickSize(numPrice);
    return Math.round(numPrice / tickSize) * tickSize;
  };

  // 자동매매 관련 핸들러
  const handleTradingModeChange = (event) => {
    setTradingMode(event.target.value);
  };

  const handlePyramidingCountChange = (event) => {
    const count = parseInt(event.target.value) || 0;
    setPyramidingCount(count);
    
    // 피라미딩 횟수에 따른 포지션 계산
    const totalEntries = count + 1; // 1차 + 피라미딩 횟수
    const equalPosition = 100 / totalEntries;
    
    // 포지션 배열 설정 (1차는 소수점 유지, 2차 이상은 반올림)
    const newPositions = Array(totalEntries).fill(0).map((_, index) => {
      if (index === 0) {
        // 1차 진입시점은 소수점 2자리까지 유지
        return parseFloat(equalPosition.toFixed(2));
      } else {
        // 2차 이상은 반올림
        return Math.round(equalPosition);
      }
    });
    setPositions(newPositions);
    
    // 피라미딩 진입시점 배열 크기 조정 (2차부터 시작하므로 count개)
    const newPyramidingEntries = Array(count).fill('').map((_, index) => 
      pyramidingEntries[index] || ''
    );
    setPyramidingEntries(newPyramidingEntries);
  };

  const handlePyramidingEntryChange = (index, value) => {
    const newPyramidingEntries = [...pyramidingEntries];
    newPyramidingEntries[index] = value;
    setPyramidingEntries(newPyramidingEntries);
  };

  // 포지션 합계 계산
  const positionSum = positions.reduce((sum, pos) => sum + (parseFloat(pos) || 0), 0);

  // 수평선 관련 핸들러
  const handleAddHorizontalLine = (yValue) => {
    const newLine = {
      id: Date.now(),
      value: yValue,
      color: '#ff6b35',
      isDragging: false,
      type: 'entry'
    };
    setHorizontalLines(prev => [...prev, newLine]);
    
    // 자동매매 탭의 진입시점에 값 설정
    if (activeTab === 0) {
      setEntryPoint(yValue.toString());
    }
  };

  const handleUpdateHorizontalLine = (id, newValue, updateTradingSettings = true) => {
    setHorizontalLines(prev => 
      prev.map(line => 
        line.id === id ? { ...line, value: newValue } : line
      )
    );
    
    if (updateTradingSettings) {
      const line = horizontalLines.find(line => line.id === id);
      if (line) {
        if (line.type === 'entry') {
          setEntryPoint(newValue.toString());
        } else if (line.type === 'pyramiding') {
          const lineIndex = horizontalLines.findIndex(l => l.id === id && l.type === 'pyramiding');
          if (lineIndex >= 0) {
            // 1차 진입시점 대비 비율 계산
            const baseEntryPrice = parseFloat(entryPoint);
            if (baseEntryPrice && baseEntryPrice > 0) {
              const percentage = ((newValue - baseEntryPrice) / baseEntryPrice * 100).toFixed(2);
              const percentageStr = percentage > 0 ? `+${percentage}` : percentage.toString();
              handlePyramidingEntryChange(lineIndex, percentageStr);
            } else {
              handlePyramidingEntryChange(lineIndex, newValue.toString());
            }
          }
        }
      }
    }
  };

  const handleDeleteHorizontalLine = (id) => {
    setHorizontalLines(prev => prev.filter(line => line.id !== id));
  };

  const toggleDrawingMode = () => {
    setIsDrawingMode(!isDrawingMode);
  };

  // 라벨 클릭 핸들러 (드래그와 구분)
  const handleLabelClick = (lineId, event) => {
    event.preventDefault();
    event.stopPropagation();
    
    // 선택된 라인이 같으면 팝업 토글, 다르면 새로 선택
    if (selectedLineId === lineId) {
      setShowEntryPopup(!showEntryPopup);
    } else {
      setSelectedLineId(lineId);
      setShowEntryPopup(true);
    }
  };

  // 라벨 드래그 핸들러
  const handleLabelMouseDown = (lineId, event) => {
    event.preventDefault();
    event.stopPropagation();
    
    // 드래그 시작 위치 저장
    const startX = event.clientX;
    const startY = event.clientY;
    
    const handleMouseMove = (moveEvent) => {
      const deltaX = Math.abs(moveEvent.clientX - startX);
      const deltaY = Math.abs(moveEvent.clientY - startY);
      
      // 5픽셀 이상 움직이면 드래그 시작
      if (deltaX > 5 || deltaY > 5) {
        // state와 ref 모두 업데이트
        setIsDragging(true);
        setDragLineId(lineId);
        setSelectedLineId(lineId);
        
        // ref에도 즉시 값 저장
        dragStateRef.current = {
          isDragging: true,
          dragLineId: lineId
        };
        
        // 임시 리스너 제거
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
        
        // 전역 드래그 이벤트 리스너 추가
        document.addEventListener('mousemove', handleGlobalMouseMove);
        document.addEventListener('mouseup', handleGlobalMouseUp);
      }
    };
    
    const handleMouseUp = () => {
      // 드래그가 시작되지 않았으면 클릭으로 처리
      if (!dragStateRef.current.isDragging) {
        handleLabelClick(lineId, event);
      }
      
      // 임시 리스너 제거
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
    
    // 임시 이벤트 리스너 추가 (드래그 감지용)
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  const handleGlobalMouseMove = (event) => {
    // ref 값을 사용하여 즉시 접근
    const { isDragging: refIsDragging, dragLineId: refDragLineId } = dragStateRef.current;
    
    if (refIsDragging && refDragLineId && chartData && ohlcvData.length > 0) {
      try {
        // 차트 영역 찾기
        const chartCanvas = document.querySelector('canvas');
        
        if (chartCanvas) {
          const rect = chartCanvas.getBoundingClientRect();
          const y = event.clientY - rect.top;
          
          // Y축 범위 계산
          const yScale = chartData.datasets[0]?.data || [];
          const minPrice = Math.min(...yScale.map(d => Math.min(d.l || d.y || 0)));
          const maxPrice = Math.max(...yScale.map(d => Math.max(d.h || d.y || 0)));
          const priceRange = maxPrice - minPrice;
          const chartHeight = 350;
          
          // 마우스 Y 위치를 가격으로 변환
          const normalizedY = Math.max(0, Math.min(1, (y - 30) / (chartHeight - 60)));
          const dataY = maxPrice - (normalizedY * priceRange);
          
          if (dataY && !isNaN(dataY)) {
            handleUpdateHorizontalLine(refDragLineId, Math.round(dataY), false);
          }
        }
      } catch (error) {
        // 오류 발생 시 조용히 처리
      }
    }
  };

  const handleGlobalMouseUp = () => {
    // 드래그 완료 시 자동매매 설정 업데이트
    const { dragLineId: refDragLineId } = dragStateRef.current;
    if (refDragLineId) {
      const line = horizontalLines.find(line => line.id === refDragLineId);
      if (line) {
        if (line.type === 'entry') {
          setEntryPoint(line.value.toString());
        } else if (line.type === 'pyramiding') {
          const lineIndex = horizontalLines.findIndex(l => l.id === refDragLineId && l.type === 'pyramiding');
          if (lineIndex >= 0) {
            // 1차 진입시점 대비 비율 계산
            const baseEntryPrice = parseFloat(entryPoint);
            if (baseEntryPrice && baseEntryPrice > 0) {
              const percentage = ((line.value - baseEntryPrice) / baseEntryPrice * 100).toFixed(2);
              const percentageStr = percentage > 0 ? `+${percentage}` : percentage.toString();
              handlePyramidingEntryChange(lineIndex, percentageStr);
            } else {
              handlePyramidingEntryChange(lineIndex, line.value.toString());
            }
          }
        }
      }
    }
    
    setIsDragging(false);
    setDragLineId(null);
    
    // ref도 초기화
    dragStateRef.current = {
      isDragging: false,
      dragLineId: null
    };
    
    // 전역 이벤트 리스너 제거
    document.removeEventListener('mousemove', handleGlobalMouseMove);
    document.removeEventListener('mouseup', handleGlobalMouseUp);
  };

  // 수평선에서 자동매매 설정으로 연결
  const connectLineToEntry = (lineId) => {
    const line = horizontalLines.find(l => l.id === lineId);
    if (line) {
      const adjustedPrice = adjustToKRXTickSize(line.value);
      setEntryPoint(adjustedPrice.toString());
      setHorizontalLines(prev => 
        prev.map(l => 
          l.id === lineId ? { ...l, type: 'entry', color: '#667eea' } : l
        )
      );
    }
  };

  const connectLineToPyramiding = (lineId, pyramidingIndex) => {
    const line = horizontalLines.find(l => l.id === lineId);
    if (!line) return;
    
    // 1차 진입시점이 설정되어 있는지 확인
    const baseEntryPrice = parseFloat(entryPoint);
    if (!baseEntryPrice || baseEntryPrice <= 0) {
      alert('1차 진입시점을 먼저 설정해주세요.');
      return;
    }
    
    // 수평선 가격을 KRX 호가단위로 조정
    const adjustedLinePrice = adjustToKRXTickSize(line.value);
    
    // 1차 진입시점 대비 비율 계산 (정수로 반올림)
    const percentage = Math.round((adjustedLinePrice - baseEntryPrice) / baseEntryPrice * 100);
    const percentageStr = percentage > 0 ? `+${percentage}` : percentage.toString();
    
    handlePyramidingEntryChange(pyramidingIndex, percentageStr);
    
    setHorizontalLines(prev => 
      prev.map(l => 
        l.id === lineId ? { ...l, type: 'pyramiding', color: '#ff9800' } : l
      )
    );
  };

  // 실제 OHLCV 데이터로 차트 생성
  const chartData = createCandlestickData(ohlcvData, analysisData);
  const volumeData = createVolumeData(ohlcvData);
  const indexChartData = createIndexCandlestickData(indexOhlcvData);
  const rsRankData = createRSRankData(analysisData);

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    animation: {
      duration: 300
    },
    layout: {
      padding: {
        top: 5,
        bottom: 5,
        left: 10,
        right: 10
      }
    },
    onClick: (event, elements, chart) => {
      // 수평선 클릭 확인
      if (elements.length > 0 && !isDrawingMode) {
        const element = elements[0];
        const dataset = chart.data.datasets[element.datasetIndex];
        if (dataset.label && dataset.label.includes('진입선')) {
          const lineId = dataset.lineId;
          setSelectedLineId(lineId);
          return;
        }
      }
      
      if (isDrawingMode && ohlcvData.length > 0) {
        try {
          // 더 안전한 방법으로 Y 좌표 계산
          let dataY;
          
          if (event.native && chart.canvas && chart.scales.y) {
            const rect = chart.canvas.getBoundingClientRect();
            const y = event.native.clientY - rect.top;
            dataY = chart.scales.y.getValueForPixel(y);
          } else {
            // 대체 방법: 가격 범위 중간값 사용
            const yScale = chart.scales.y;
            const minValue = yScale.min;
            const maxValue = yScale.max;
            dataY = (minValue + maxValue) / 2;
          }
          
          if (dataY && !isNaN(dataY)) {
            const adjustedPrice = adjustToKRXTickSize(dataY);
            handleAddHorizontalLine(adjustedPrice);
            setIsDrawingMode(false);
          }
        } catch (error) {
          // 대체 방법: 마지막 가격 사용
          if (ohlcvData.length > 0) {
            const lastPrice = ohlcvData[ohlcvData.length - 1].close;
            const adjustedPrice = adjustToKRXTickSize(lastPrice);
            handleAddHorizontalLine(adjustedPrice);
            setIsDrawingMode(false);
          }
        }
      }
    },
    onHover: (event, elements, chart) => {
      try {
        if (isDrawingMode) {
          event.native.target.style.cursor = 'crosshair';
        } else if (elements.length > 0) {
          const element = elements[0];
          const datasetLabel = chart.data.datasets[element.datasetIndex]?.label;
          if (datasetLabel && datasetLabel.includes('진입선')) {
            event.native.target.style.cursor = 'pointer';
          } else {
            event.native.target.style.cursor = 'default';
          }
        } else {
          event.native.target.style.cursor = 'default';
        }
      } catch (error) {
        // 오류 발생 시 조용히 처리
      }
    },
    scales: {
      x: {
        type: 'time',
        time: {
          unit: 'day',
          displayFormats: {
            day: 'MM/dd'
          }
        },
        grid: {
          display: true,
          color: 'rgba(0,0,0,0.05)',
        },
        ticks: {
          color: '#666',
          font: {
            size: 12
          },
          maxRotation: 0,
          minRotation: 0,
          padding: 5
        }
      },
      y: {
        beginAtZero: false,
        grace: '5%',
        grid: {
          color: 'rgba(0,0,0,0.05)',
        },
        ticks: {
          color: '#666',
          font: {
            size: 12
          },
          padding: 8,
          callback: function(value) {
            return new Intl.NumberFormat('ko-KR').format(Math.round(value));
          }
        }
      }
    },
    plugins: {
      legend: {
        display: true,
        position: 'top',
        labels: {
          filter: function(legendItem) {
            // 캔들스틱은 범례에서 제외
            return legendItem.text !== '캔들스틱';
          },
          usePointStyle: true,
          pointStyle: 'line',
          font: {
            size: 10
          },
          color: '#666'
        }
      },
      tooltip: {
        callbacks: {
          title: function(context) {
            return new Date(context[0].parsed.x).toLocaleDateString('ko-KR');
          },
          beforeBody: function(context) {
            const candleData = context.find(ctx => ctx.dataset.label === '캔들스틱');
            if (!candleData || !candleData.parsed.o) return '';
            
            const data = candleData.parsed;
            const changePercent = ((data.c - data.o) / data.o * 100).toFixed(2);
            return `당일변화: ${changePercent > 0 ? '+' : ''}${changePercent}%`;
          },
          label: function(context) {
            if (context.dataset.label === '캔들스틱') {
              const data = context.parsed;
              if (!data) return '';
              
              return [
                `시가: ${new Intl.NumberFormat('ko-KR').format(data.o)}`,
                `고가: ${new Intl.NumberFormat('ko-KR').format(data.h)}`,
                `저가: ${new Intl.NumberFormat('ko-KR').format(data.l)}`,
                `종가: ${new Intl.NumberFormat('ko-KR').format(data.c)}`
              ];
            } else {
              // 이동평균선
              return `${context.dataset.label}: ${new Intl.NumberFormat('ko-KR').format(Math.round(context.parsed.y))}`;
            }
          }
        },
        backgroundColor: 'rgba(0,0,0,0.9)',
        titleColor: '#fff',
        bodyColor: '#fff',
        borderColor: '#667eea',
        borderWidth: 1,
        cornerRadius: 8,
        displayColors: true,
      }
    },
    interaction: {
      intersect: false,
      mode: 'index',
    }
  };

  const indexChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    animation: {
      duration: 300
    },
    layout: {
      padding: {
        top: 5,
        bottom: 5,
        left: 10,
        right: 10
      }
    },
    scales: {
      x: {
        type: 'time',
        time: {
          unit: 'day',
          displayFormats: {
            day: 'MM/dd'
          }
        },
        grid: {
          display: true,
          color: 'rgba(0,0,0,0.05)',
        },
        ticks: {
          color: '#666',
          font: {
            size: 10
          },
          maxRotation: 0,
          minRotation: 0,
          padding: 5
        }
      },
      y: {
        beginAtZero: false,
        grace: '3%',
        grid: {
          color: 'rgba(0,0,0,0.05)',
        },
        ticks: {
          color: '#666',
          font: {
            size: 10
          },
          padding: 8,
          callback: function(value) {
            return new Intl.NumberFormat('ko-KR').format(Math.round(value));
          }
        },
        title: {
          display: true,
          text: selectedIndexCode && indexData.length > 0 
            ? indexData.find(idx => idx.code === selectedIndexCode)?.name || '인덱스'
            : '인덱스',
          color: '#666',
          font: {
            size: 10,
            weight: 'bold'
          }
        }
      }
    },
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        callbacks: {
          title: function(context) {
            return new Date(context[0].parsed.x).toLocaleDateString('ko-KR');
          },
          beforeBody: function(context) {
            const data = context[0].parsed;
            if (!data || !data.o) return '';
            
            const changePercent = ((data.c - data.o) / data.o * 100).toFixed(2);
            return `당일변화: ${changePercent > 0 ? '+' : ''}${changePercent}%`;
          },
          label: function(context) {
            const data = context.parsed;
            if (!data) return '';
            
            return [
              `시가: ${new Intl.NumberFormat('ko-KR').format(data.o)}`,
              `고가: ${new Intl.NumberFormat('ko-KR').format(data.h)}`,
              `저가: ${new Intl.NumberFormat('ko-KR').format(data.l)}`,
              `종가: ${new Intl.NumberFormat('ko-KR').format(data.c)}`
            ];
          }
        },
        backgroundColor: 'rgba(0,0,0,0.9)',
        titleColor: '#fff',
        bodyColor: '#fff',
        borderColor: '#2196f3',
        borderWidth: 1,
        cornerRadius: 8,
        displayColors: false,
      }
    },
    interaction: {
      intersect: false,
      mode: 'index',
    }
  };
  
  const volumeOptions = {
    responsive: true,
    maintainAspectRatio: false,
    animation: {
      duration: 300
    },
    layout: {
      padding: {
        top: 5,
        bottom: 5,
        left: 10,
        right: 10
      }
    },
    scales: {
      x: {
        type: 'time',
        time: {
          unit: 'day',
          displayFormats: {
            day: 'MM/dd'
          }
        },
        grid: {
          display: true,
          color: 'rgba(0,0,0,0.05)',
        },
        ticks: {
          color: '#666',
          font: {
            size: 10
          },
          maxRotation: 0,
          minRotation: 0,
          padding: 5
        }
      },
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(0,0,0,0.05)',
        },
        ticks: {
          color: '#666',
          font: {
            size: 10
          },
          padding: 8,
          callback: function(value) {
            if (value >= 1000000) {
              return (value / 1000000).toFixed(1) + 'M';
            } else if (value >= 1000) {
              return (value / 1000).toFixed(0) + 'K';
            }
            return value;
          }
        },
        title: {
          display: true,
          text: '거래량',
          color: '#666',
          font: {
            size: 10,
            weight: 'bold'
          }
        }
      }
    },
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        callbacks: {
          title: function(context) {
            return new Date(context[0].parsed.x).toLocaleDateString('ko-KR');
          },
          label: function(context) {
            return `거래량: ${new Intl.NumberFormat('ko-KR').format(context.parsed.y)}`;
          }
        },
        backgroundColor: 'rgba(0,0,0,0.9)',
        titleColor: '#fff',
        bodyColor: '#fff',
        borderColor: '#667eea',
        borderWidth: 1,
        cornerRadius: 8,
        displayColors: false,
      }
    },
    interaction: {
      intersect: false,
      mode: 'index',
    }
  };

  const rsRankOptions = {
    responsive: true,
    maintainAspectRatio: false,
    animation: {
      duration: 300
    },
    layout: {
      padding: {
        top: 5,
        bottom: 5,
        left: 10,
        right: 10
      }
    },
    scales: {
      x: {
        type: 'time',
        time: {
          unit: 'day',
          displayFormats: {
            day: 'MM/dd'
          }
        },
        grid: {
          display: true,
          color: 'rgba(0,0,0,0.05)',
        },
        ticks: {
          color: '#666',
          font: {
            size: 10
          },
          maxRotation: 0,
          minRotation: 0,
          padding: 5
        }
      },
      y: {
        min: 0,
        max: 100,
        grid: {
          color: 'rgba(0,0,0,0.05)',
        },
        ticks: {
          color: '#666',
          font: {
            size: 10
          },
          padding: 8,
          stepSize: 20,
          callback: function(value) {
            return value;
          }
        },
        title: {
          display: true,
          text: 'RS Rank (%)',
          color: '#666',
          font: {
            size: 10,
            weight: 'bold'
          }
        }
      }
    },
    plugins: {
      legend: {
        display: true,
        position: 'top',
        labels: {
          usePointStyle: true,
          pointStyle: 'line',
          font: {
            size: 9
          },
          color: '#666',
          boxWidth: 15,
          padding: 8
        }
      },
      tooltip: {
        callbacks: {
          title: function(context) {
            return new Date(context[0].parsed.x).toLocaleDateString('ko-KR');
          },
          label: function(context) {
            return `${context.dataset.label}: ${context.parsed.y}`;
          }
        },
        backgroundColor: 'rgba(0,0,0,0.9)',
        titleColor: '#fff',
        bodyColor: '#fff',
        borderColor: '#667eea',
        borderWidth: 1,
        cornerRadius: 8,
        displayColors: true,
      }
    },
    interaction: {
      intersect: false,
      mode: 'index',
    }
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
                            onClick={handleOpenFinancialModal}
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
                    <MKTypography variant="h6" color="text.secondary" textAlign="center">
                      종목을 선택하세요
                    </MKTypography>
                    <MKTypography variant="body2" color="text.secondary" textAlign="center">
                      오른쪽 목록에서 종목을 클릭하면
                      <br />
                      캔들스틱 차트가 표시됩니다
                    </MKTypography>
                  </MKBox>
                )}
                
                {selectedStock && (
                  <>
                    {chartLoading ? (
                      <MKBox
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          height: "100%",
                          flexDirection: "column"
                        }}
                      >
                        <CircularProgress size={40} />
                        <MKTypography variant="body2" mt={2} color="text.secondary">
                          차트 데이터를 로드하는 중...
                        </MKTypography>
                      </MKBox>
                    ) : chartData && ohlcvData.length > 0 ? (
                      <MKBox sx={{ p: 0.5 }}>
                        {/* 차트 헤더 */}
                        <MKBox
                          sx={{
                            mb: 0.5,
                            pb: 0.5,
                            borderBottom: "1px solid #f0f0f0",
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                          }}
                        >
                          {/* <MKBox>
                            <MKTypography variant="h6" fontWeight="bold" color="#667eea">
                              {selectedStock.name}
                            </MKTypography>
                            <MKTypography variant="caption" color="text.secondary">
                              {selectedStock.code} • 최근 63일
                            </MKTypography>
                          </MKBox> */}
                          
                          {/* {ohlcvData.length > 0 && (
                            <MKBox sx={{ textAlign: "right" }}>
                              <MKTypography variant="h6" fontWeight="bold">
                                {new Intl.NumberFormat('ko-KR').format(ohlcvData[ohlcvData.length - 1]?.close)}
                              </MKTypography>
                              <MKBox sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                                {ohlcvData.length >= 2 && (
                                  <>
                                    {ohlcvData[ohlcvData.length - 1]?.close >= ohlcvData[ohlcvData.length - 2]?.close ? (
                                      <ArrowUpward sx={{ fontSize: '16px', color: '#f44336' }} />
                                    ) : (
                                      <ArrowDownward sx={{ fontSize: '16px', color: '#2196f3' }} />
                                    )}
                                    <MKTypography 
                                      variant="body2" 
                                      color={ohlcvData[ohlcvData.length - 1]?.close >= ohlcvData[ohlcvData.length - 2]?.close ? '#f44336' : '#2196f3'}
                                      fontWeight="bold"
                                    >
                                      {Math.abs(
                                        ((ohlcvData[ohlcvData.length - 1]?.close - ohlcvData[ohlcvData.length - 2]?.close) / 
                                         ohlcvData[ohlcvData.length - 2]?.close * 100)
                                      ).toFixed(2)}%
                                    </MKTypography>
                                  </>
                                )}
                              </MKBox>
                            </MKBox>
                          )} */}
                        </MKBox>

                        {/* 캔들스틱 차트 */}
                        <MKBox sx={{ 
                          height: "350px",
                          backgroundColor: "#ffffff",
                          border: "1px solid #e0e0e0",
                          borderRadius: 1,
                          p: 0.5,
                          mb: 1,
                          position: 'relative'
                        }}>
                          {/* 차트 컨트롤 버튼들 */}
                          <MKBox sx={{ 
                            position: 'absolute', 
                            top: 8, 
                            right: 8, 
                            zIndex: 1000,
                            display: 'flex',
                            gap: 1
                          }}>
                            <Tooltip title="수평선 그리기">
                              <ToggleButton
                                value="drawing"
                                selected={isDrawingMode}
                                onChange={toggleDrawingMode}
                                size="small"
                                sx={{
                                  border: '1px solid #667eea',
                                  color: isDrawingMode ? 'white' : '#667eea',
                                  backgroundColor: isDrawingMode ? '#667eea' : 'transparent',
                                  '&:hover': {
                                    backgroundColor: isDrawingMode ? '#5a6fd8' : 'rgba(102, 126, 234, 0.1)',
                                  },
                                  '&.Mui-selected': {
                                    backgroundColor: '#667eea',
                                    color: 'white',
                                    '&:hover': {
                                      backgroundColor: '#5a6fd8',
                                    },
                                  },
                                }}
                              >
                                <Timeline sx={{ fontSize: '16px' }} />
                              </ToggleButton>
                            </Tooltip>
                            
                            {horizontalLines.length > 0 && (
                              <Tooltip title="모든 수평선 삭제">
                                <IconButton
                                  onClick={() => setHorizontalLines([])}
                                  size="small"
                                  sx={{
                                    border: '1px solid #f44336',
                                    color: '#f44336',
                                    backgroundColor: 'transparent',
                                    '&:hover': {
                                      backgroundColor: 'rgba(244, 67, 54, 0.1)',
                                    },
                                  }}
                                >
                                  <Delete sx={{ fontSize: '16px' }} />
                                </IconButton>
                              </Tooltip>
                            )}
                          </MKBox>

                          {/* 수평선 가격 라벨들 - 차트 내부에 표시 */}
                          {horizontalLines.map((line) => {
                            // 차트 인스턴스에서 실제 스케일 정보 가져오기
                            let linePosition = 175; // 기본값 (차트 중앙)
                            
                            // labelUpdateTrigger를 의존성으로 하여 강제 재계산
                            if (chartRef.current && labelUpdateTrigger >= 0) {
                              const chartInstance = chartRef.current;
                              if (chartInstance.scales && chartInstance.scales.y) {
                                const yScale = chartInstance.scales.y;
                                try {
                                  const pixelPosition = yScale.getPixelForValue(line.value);
                                  // 라벨 중심이 수평선과 일치하도록 조정
                                  linePosition = pixelPosition - 12;
                                } catch (error) {
                                  // 대체 계산으로 fallback
                                  const yScale = chartData ? chartData.datasets[0]?.data : [];
                                  if (yScale.length > 0) {
                                    const minPrice = Math.min(...yScale.map(d => Math.min(d.l || d.y || 0)));
                                    const maxPrice = Math.max(...yScale.map(d => Math.max(d.h || d.y || 0)));
                                    const priceRange = maxPrice - minPrice;
                                    const chartHeight = 350;
                                    linePosition = ((maxPrice - line.value) / priceRange) * (chartHeight - 60) + 30 - 12;
                                  }
                                }
                              }
                            } else {
                              // 대체 계산 (차트가 아직 준비되지 않은 경우)
                              const yScale = chartData ? chartData.datasets[0]?.data : [];
                              if (yScale.length > 0) {
                                const minPrice = Math.min(...yScale.map(d => Math.min(d.l || d.y || 0)));
                                const maxPrice = Math.max(...yScale.map(d => Math.max(d.h || d.y || 0)));
                                const priceRange = maxPrice - minPrice;
                                const chartHeight = 350;
                                linePosition = ((maxPrice - line.value) / priceRange) * (chartHeight - 60) + 30 - 12;
                              }
                            }
                            
                            return (
                              <MKBox 
                                key={line.id}
                                sx={{ 
                                  position: 'absolute', 
                                  left: 8, 
                                  top: `${linePosition}px`,
                                  zIndex: 1001,
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: 0.5,
                                  backgroundColor: isDragging && dragLineId === line.id 
                                    ? 'rgba(255, 152, 0, 0.9)' 
                                    : selectedLineId === line.id 
                                      ? 'rgba(102, 126, 234, 0.9)' 
                                      : 'rgba(255, 255, 255, 0.9)',
                                  borderRadius: 1,
                                  p: 0.5,
                                  border: isDragging && dragLineId === line.id
                                    ? '2px solid #ff9800'
                                    : selectedLineId === line.id 
                                      ? '2px solid #667eea' 
                                      : '1px solid #ddd',
                                  boxShadow: isDragging && dragLineId === line.id
                                    ? '0 4px 12px rgba(255, 152, 0, 0.3)'
                                    : '0 2px 4px rgba(0,0,0,0.1)',
                                  cursor: isDragging && dragLineId === line.id ? 'grabbing' : 'grab',
                                  transition: isDragging && dragLineId === line.id ? 'none' : 'all 0.2s ease',
                                  transform: isDragging && dragLineId === line.id ? 'scale(1.1)' : 'scale(1)',
                                  '&:hover': {
                                    backgroundColor: isDragging && dragLineId === line.id 
                                      ? 'rgba(255, 152, 0, 0.9)'
                                      : 'rgba(102, 126, 234, 0.1)',
                                    transform: isDragging && dragLineId === line.id ? 'scale(1.1)' : 'scale(1.05)',
                                  }
                                }}
                                onMouseDown={(e) => handleLabelMouseDown(line.id, e)}
                              >
                                <MKBox sx={{ 
                                  width: 8, 
                                  height: 2, 
                                  backgroundColor: line.color,
                                  borderRadius: 1
                                }} />
                                <MKTypography 
                                  variant="caption" 
                                  sx={{ 
                                    fontSize: '0.75rem',
                                    fontWeight: 'bold',
                                    color: isDragging && dragLineId === line.id 
                                      ? 'white'
                                      : selectedLineId === line.id 
                                        ? 'white' 
                                        : 'text.primary',
                                    minWidth: '60px',
                                    userSelect: 'none' // 텍스트 선택 방지
                                  }}
                                >
                                  {new Intl.NumberFormat('ko-KR').format(line.value)}
                                </MKTypography>
                                <IconButton
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDeleteHorizontalLine(line.id);
                                  }}
                                  size="small"
                                  sx={{ 
                                    p: 0.2, 
                                    color: isDragging && dragLineId === line.id 
                                      ? 'white'
                                      : selectedLineId === line.id 
                                        ? 'white' 
                                        : '#f44336',
                                    '&:hover': {
                                      backgroundColor: 'rgba(244, 67, 54, 0.2)',
                                    },
                                  }}
                                >
                                  <Delete sx={{ fontSize: '12px' }} />
                                </IconButton>
                              </MKBox>
                            );
                          })}
                          
                          {/* 선택된 라인에 대한 연결 옵션 - 클릭 시 팝업 */}
                          {selectedLineId && showEntryPopup && (
                            <MKBox sx={{ 
                              position: 'absolute', 
                              top: 40, 
                              right: 8, 
                              zIndex: 1002,
                              backgroundColor: 'rgba(255, 255, 255, 0.98)',
                              borderRadius: 1,
                              p: 1,
                              border: '2px solid #667eea',
                              boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
                              animation: 'fadeIn 0.2s ease-in-out'
                            }}>
                              <MKBox sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                                <MKTypography variant="caption" fontWeight="bold">
                                  진입시점 설정 ({horizontalLines.find(l => l.id === selectedLineId)?.value}원)
                                </MKTypography>
                                <IconButton
                                  size="small"
                                  onClick={() => setShowEntryPopup(false)}
                                  sx={{ padding: '2px' }}
                                >
                                  <Close sx={{ fontSize: '14px' }} />
                                </IconButton>
                              </MKBox>
                              <MKBox sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                                <Button
                                  size="small"
                                  variant="outlined"
                                  onClick={() => {
                                    connectLineToEntry(selectedLineId);
                                    setShowEntryPopup(false);
                                  }}
                                  sx={{ 
                                    fontSize: '0.7rem',
                                    borderColor: '#667eea',
                                    color: '#667eea',
                                    '&:hover': {
                                      backgroundColor: 'rgba(102, 126, 234, 0.1)',
                                    }
                                  }}
                                >
                                  진입시점으로 설정
                                </Button>
                                {pyramidingEntries.map((_, index) => (
                                  <Button
                                    key={index}
                                    size="small"
                                    variant="outlined"
                                    disabled={!entryPoint || parseFloat(entryPoint) <= 0}
                                    onClick={() => {
                                      connectLineToPyramiding(selectedLineId, index);
                                      setShowEntryPopup(false);
                                    }}
                                    sx={{ 
                                      fontSize: '0.7rem',
                                      borderColor: '#ff9800',
                                      color: '#ff9800',
                                      '&:hover': {
                                        backgroundColor: 'rgba(255, 152, 0, 0.1)',
                                      }
                                    }}
                                  >
                                    {index + 2}차 진입으로 설정
                                  </Button>
                                ))}
                              </MKBox>
                            </MKBox>
                          )}

                          {isDrawingMode && (
                            <MKBox sx={{ 
                              position: 'absolute', 
                              bottom: 8, 
                              left: 8, 
                              zIndex: 1000,
                              backgroundColor: 'rgba(255, 107, 53, 0.9)',
                              color: 'white',
                              borderRadius: 1,
                              p: 1
                            }}>
                              <MKTypography variant="caption" fontWeight="bold">
                                📍 차트를 클릭하여 수평선을 그으세요
                              </MKTypography>
                            </MKBox>
                          )}

                          <Chart 
                            ref={chartRef}
                            type="candlestick" 
                            data={chartData} 
                            options={chartOptions}
                          />
                        </MKBox>
                        
                        {/* 거래량 차트 */}
                        <MKBox sx={{ 
                          height: "100px",
                          backgroundColor: "#ffffff",
                          border: "1px solid #e0e0e0",
                          borderRadius: 1,
                          p: 0.5,
                          mb: 1
                        }}>
                          {volumeData && (
                            <Chart type="bar" data={volumeData} options={volumeOptions} />
                          )}
                        </MKBox>
                        
                        {/* 인덱스 차트 */}
                        {indexData.length > 0 && (
                          <MKBox sx={{ 
                            height: "250px",
                            backgroundColor: "#ffffff",
                            border: "1px solid #e0e0e0",
                            borderRadius: 1,
                            p: 0.5
                          }}>
                            <MKBox sx={{ 
                              p: 0.5, 
                              borderBottom: "1px solid #f0f0f0", 
                              mb: 0.5,
                              display: "flex",
                              justifyContent: "space-between",
                              alignItems: "center"
                            }}>
                              <MKBox>
                                {/* <MKTypography variant="subtitle1" fontWeight="bold" color="#2196f3">
                                  관련 인덱스
                                </MKTypography> */}
                                <MKTypography variant="caption" color="text.secondary">
                                  {selectedIndexCode && indexData.length > 0 
                                    ? `${indexData.find(idx => idx.code === selectedIndexCode)?.market || ''} • ${selectedIndexCode}`
                                    : '인덱스를 선택하세요'
                                  }
                                </MKTypography>
                              </MKBox>
                              
                              <FormControl size="small" sx={{ minWidth: 200 }}>
                                <InputLabel id="index-select-label">인덱스 선택</InputLabel>
                                <Select
                                  labelId="index-select-label"
                                  value={selectedIndexCode}
                                  label="인덱스 선택"
                                  onChange={handleIndexChange}
                                  sx={{
                                    backgroundColor: 'white',
                                    '& .MuiOutlinedInput-notchedOutline': {
                                      borderColor: '#2196f3',
                                    },
                                    '&:hover .MuiOutlinedInput-notchedOutline': {
                                      borderColor: '#1976d2',
                                    },
                                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                      borderColor: '#2196f3',
                                    },
                                  }}
                                >
                                  {indexData.map((index) => (
                                    <MenuItem key={index.code} value={index.code}>
                                      <MKBox sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <MKTypography variant="body2" fontWeight="bold">
                                          {index.name}
                                        </MKTypography>
                                        <MKTypography variant="caption" color="text.secondary">
                                          {index.market} • {index.code}
                                        </MKTypography>
                                      </MKBox>
                                    </MenuItem>
                                  ))}
                                </Select>
                              </FormControl>
                            </MKBox>
                            
                            {indexChartData && indexOhlcvData.length > 0 ? (
                              <MKBox sx={{ height: "calc(100% - 60px)" }}>
                                <Chart type="candlestick" data={indexChartData} options={indexChartOptions} />
                              </MKBox>
                            ) : (
                              <MKBox
                                sx={{
                                  height: "calc(100% - 80px)",
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  flexDirection: "column",
                                  color: "#666"
                                }}
                              >
                                <MKTypography variant="body1" mb={1}>
                                  {selectedIndexCode ? '인덱스 데이터를 로드하는 중...' : '인덱스를 선택하세요'}
                                </MKTypography>
                                {selectedIndexCode && <CircularProgress size={24} />}
                              </MKBox>
                            )}
                          </MKBox>
                        )}

                        {/* RS Rank 차트 */}
                        {analysisData.length > 0 && (
                          <MKBox sx={{ 
                            height: "300px",
                            backgroundColor: "#ffffff",
                            border: "1px solid #e0e0e0",
                            borderRadius: 1,
                            p: 0.5
                          }}>
                            <MKBox sx={{ 
                              p: 0.5, 
                              borderBottom: "1px solid #f0f0f0", 
                              mb: 0.5,
                              display: "flex",
                              justifyContent: "space-between",
                              alignItems: "center"
                            }}>
                              <MKBox>
                                <MKTypography variant="h6" fontWeight="bold" color="#667eea">
                                  RS Rank 추이
                                </MKTypography>
                                <MKTypography variant="caption" color="text.secondary">
                                  상대강도 순위 (0-100%)
                                </MKTypography>
                              </MKBox>
                            </MKBox>
                            
                            {rsRankData ? (
                              <MKBox sx={{ height: "calc(100% - 60px)" }}>
                                <Chart type="line" data={rsRankData} options={rsRankOptions} />
                              </MKBox>
                            ) : (
                              <MKBox
                                sx={{
                                  height: "calc(100% - 60px)",
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  flexDirection: "column",
                                  color: "#666"
                                }}
                              >
                                <MKTypography variant="body1">
                                  RS Rank 데이터를 로드하는 중...
                                </MKTypography>
                              </MKBox>
                            )}
                          </MKBox>
                        )}
                      </MKBox>
                    ) : (
                      <MKBox
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          height: "100%",
                          flexDirection: "column",
                          color: "#666"
                        }}
                      >
                        <MKTypography variant="h6" mb={1}>
                          {selectedStock.name}
                        </MKTypography>
                        <MKTypography variant="body2">
                          차트 데이터를 사용할 수 없습니다
                        </MKTypography>
                      </MKBox>
                    )}
                  </>
                )}
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
                          <Grid item xs={5}>
                            <MKTypography variant="subtitle2" color="white" fontWeight="bold">
                              종목명
                            </MKTypography>
                          </Grid>
                          <Grid item xs={2.5}>
                            <MKTypography variant="subtitle2" color="white" fontWeight="bold" textAlign="center">
                              RS순위
                            </MKTypography>
                          </Grid>
                          <Grid item xs={2.5}>
                            <MKTypography variant="subtitle2" color="white" fontWeight="bold" textAlign="center">
                              당기매출
                            </MKTypography>
                          </Grid>
                          <Grid item xs={2}>
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
                              <Grid item xs={5}>
                                <MKBox>
                                  <MKTypography 
                                    variant="body2" 
                                    fontWeight={selectedStock?.code === row.code ? "bold" : "medium"}
                                    color={selectedStock?.code === row.code ? "#667eea" : "text.primary"}
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
                                    color="text.secondary"
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
                              <Grid item xs={2.5}>
                                <MKBox display="flex" justifyContent="center" alignItems="center" gap={0.3}>
                                  {row['당기매출'] > 0 && (
                                    <ArrowUpward sx={{ fontSize: '10px', color: '#f44336' }} />
                                  )}
                                  {row['당기매출'] < 0 && (
                                    <ArrowDownward sx={{ fontSize: '10px', color: '#2196f3' }} />
                                  )}
                                  <MKTypography 
                                    variant="body2" 
                                    textAlign="center"
                                    color={row['당기매출'] > 0 ? '#f44336' : 
                                           row['당기매출'] < 0 ? '#2196f3' : 'text.secondary'}
                                    fontWeight="bold"
                                    sx={{ fontSize: '0.75rem' }}
                                  >
                                    {formatNumber(row['당기매출']) || '0'}
                                  </MKTypography>
                                </MKBox>
                              </Grid>
                              <Grid item xs={2}>
                                <MKBox display="flex" justifyContent="center" alignItems="center" gap={0.5}>
                                  {row['당기영업이익'] > 0 && (
                                    <ArrowUpward sx={{ fontSize: '12px', color: '#f44336' }} />
                                  )}
                                  {row['당기영업이익'] < 0 && (
                                    <ArrowDownward sx={{ fontSize: '12px', color: '#2196f3' }} />
                                  )}
                                  <MKTypography 
                                    variant="body2" 
                                    textAlign="center"
                                    color={row['당기영업이익'] > 0 ? '#f44336' : 
                                           row['당기영업이익'] < 0 ? '#2196f3' : 'text.secondary'}
                                    fontWeight="bold"
                                    sx={{ fontSize: '0.8rem' }}
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
                      {/* 헤더 */}
                      <MKBox sx={{ mb: 3, textAlign: 'center' }}>
                        <MKBox
                          sx={{
                            width: 48,
                            height: 48,
                            borderRadius: '50%',
                            background: 'linear-gradient(135deg, #ff6b35 0%, #f7931e 100%)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            mx: 'auto',
                            mb: 1,
                          }}
                        >
                          <MKTypography variant="h5" color="white">
                            🤖
                          </MKTypography>
                        </MKBox>
                        <MKTypography variant="h6" color="text.primary" fontWeight="bold">
                          자동매매 설정
                        </MKTypography>
                      </MKBox>

                      {/* 매매 방식 선택 */}
                      <MKBox sx={{ mb: 3 }}>
                        <MKTypography variant="subtitle2" fontWeight="bold" sx={{ mb: 1 }}>
                          매매 방식
                        </MKTypography>
                        <FormControl component="fieldset">
                          <RadioGroup
                            value={tradingMode}
                            onChange={handleTradingModeChange}
                            sx={{ 
                              '& .MuiFormControlLabel-root': {
                                margin: '0 16px 0 0',
                              },
                              '& .MuiRadio-root': {
                                color: '#667eea',
                                '&.Mui-checked': {
                                  color: '#667eea',
                                },
                              },
                            }}
                            row
                          >
                            <FormControlLabel value="manual" control={<Radio size="small" />} label="Manual" />
                            <FormControlLabel value="turtle" control={<Radio size="small" />} label="Turtle(ATR)" />
                          </RadioGroup>
                        </FormControl>
                      </MKBox>

                      {/* 설정 폼 */}
                      <MKBox sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                        {/* 진입시점 */}
                        <MKBox sx={{ position: 'relative' }}>
                          <TextField
                            label="진입시점 (원)"
                            value={entryPoint}
                            onChange={(e) => {
                              const adjustedValue = adjustToKRXTickSize(e.target.value);
                              setEntryPoint(adjustedValue.toString());
                            }}
                            size="small"
                            type="number"
                            inputProps={{ step: getKRXTickSize(entryPoint) }}
                            sx={{
                              width: '100%',
                              '& .MuiOutlinedInput-root': {
                                '&.Mui-focused fieldset': {
                                  borderColor: '#667eea',
                                },
                              },
                              '& .MuiInputLabel-root.Mui-focused': {
                                color: '#667eea',
                              },
                            }}
                          />
                          {horizontalLines.length > 0 && (
                            <MKBox sx={{ 
                              mt: 0.5,
                              p: 0.5,
                              backgroundColor: 'rgba(102, 126, 234, 0.1)',
                              borderRadius: 1,
                              border: '1px solid rgba(102, 126, 234, 0.3)'
                            }}>
                              <MKTypography variant="caption" color="#667eea" fontWeight="bold">
                                📈 차트에서 설정된 진입선: {horizontalLines.length}개
                              </MKTypography>
                            </MKBox>
                          )}
                        </MKBox>

                        {/* 최대손실 */}
                        <TextField
                          label="최대손실 (%)"
                          value={maxLoss}
                          onChange={(e) => setMaxLoss(e.target.value)}
                          size="small"
                          type="number"
                          sx={{
                            '& .MuiOutlinedInput-root': {
                              '&.Mui-focused fieldset': {
                                borderColor: '#667eea',
                              },
                            },
                            '& .MuiInputLabel-root.Mui-focused': {
                              color: '#667eea',
                            },
                          }}
                        />

                        {/* 손절 */}
                        <TextField
                          label={`손절 (${tradingMode === 'manual' ? '%' : 'ATR'})`}
                          value={stopLoss}
                          onChange={(e) => setStopLoss(e.target.value)}
                          size="small"
                          type="number"
                          sx={{
                            '& .MuiOutlinedInput-root': {
                              '&.Mui-focused fieldset': {
                                borderColor: '#667eea',
                              },
                            },
                            '& .MuiInputLabel-root.Mui-focused': {
                              color: '#667eea',
                            },
                          }}
                        />

                        {/* 익절 */}
                        <TextField
                          label={`익절 (${tradingMode === 'manual' ? '%' : 'ATR'})`}
                          value={takeProfit}
                          onChange={(e) => setTakeProfit(e.target.value)}
                          size="small"
                          type="number"
                          sx={{
                            '& .MuiOutlinedInput-root': {
                              '&.Mui-focused fieldset': {
                                borderColor: '#667eea',
                              },
                            },
                            '& .MuiInputLabel-root.Mui-focused': {
                              color: '#667eea',
                            },
                          }}
                        />

                        {/* 피라미딩 횟수 */}
                        <TextField
                          label="피라미딩횟수 (회)"
                          value={pyramidingCount}
                          onChange={handlePyramidingCountChange}
                          size="small"
                          type="number"
                          inputProps={{ min: 0, max: 6 }}
                          sx={{
                            '& .MuiOutlinedInput-root': {
                              '&.Mui-focused fieldset': {
                                borderColor: '#667eea',
                              },
                            },
                            '& .MuiInputLabel-root.Mui-focused': {
                              color: '#667eea',
                            },
                          }}
                        />

                        {/* 포지션 설정 */}
                        <MKBox>
                          <MKBox sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                            <MKTypography variant="subtitle2" fontWeight="bold">
                              포지션 설정
                            </MKTypography>
                            <MKTypography 
                              variant="caption" 
                              color={Math.abs(positionSum - 100) < 0.01 ? 'success.main' : 'error.main'}
                              fontWeight="bold"
                            >
                              합계: {positionSum.toFixed(1)}%
                            </MKTypography>
                          </MKBox>
                          {/* 1차 진입시점 (항상 표시) */}
                          <MKBox sx={{ display: 'flex', gap: 1, mb: 1 }}>
                            <TextField
                              label="1차 진입시점"
                              value={entryPoint}
                              onChange={(e) => {
                                const adjustedValue = adjustToKRXTickSize(e.target.value);
                                setEntryPoint(adjustedValue.toString());
                              }}
                              size="small"
                              type="number"
                              disabled={pyramidingCount > 0}
                              sx={{
                                flex: 1,
                                '& .MuiOutlinedInput-root': {
                                  '&.Mui-focused fieldset': {
                                    borderColor: '#667eea',
                                  },
                                },
                                '& .MuiInputLabel-root.Mui-focused': {
                                  color: '#667eea',
                                },
                              }}
                              InputProps={{
                                endAdornment: <MKTypography variant="caption" sx={{ mr: 1 }}>원</MKTypography>
                              }}
                            />
                            <TextField
                              label="포지션"
                              value={positions[0] || 100}
                              disabled
                              size="small"
                              type="number"
                              sx={{
                                width: '100px',
                                '& .MuiOutlinedInput-root': {
                                  '&.Mui-focused fieldset': {
                                    borderColor: '#667eea',
                                  },
                                },
                                '& .MuiInputLabel-root.Mui-focused': {
                                  color: '#667eea',
                                },
                              }}
                              InputProps={{
                                endAdornment: <MKTypography variant="caption" sx={{ mr: 1 }}>%</MKTypography>
                              }}
                            />
                          </MKBox>

                          {/* 2차 이상 진입시점들 (피라미딩 횟수만큼 표시) */}
                          {pyramidingEntries.map((entry, index) => (
                            <MKBox key={index} sx={{ display: 'flex', gap: 1, mb: 1 }}>
                              <TextField
                                label={`${index + 2}차 진입시점`}
                                value={entry}
                                onChange={(e) => handlePyramidingEntryChange(index, e.target.value)}
                                size="small"
                                type="text"
                                sx={{
                                  flex: 1,
                                  '& .MuiOutlinedInput-root': {
                                    '&.Mui-focused fieldset': {
                                      borderColor: '#667eea',
                                    },
                                  },
                                  '& .MuiInputLabel-root.Mui-focused': {
                                    color: '#667eea',
                                  },
                                }}
                                InputProps={{
                                  endAdornment: <MKTypography variant="caption" sx={{ mr: 1 }}>%</MKTypography>
                                }}
                              />
                              <TextField
                                label="포지션"
                                value={positions[index + 1] || 0}
                                disabled
                                size="small"
                                type="number"
                                sx={{
                                  width: '100px',
                                  '& .MuiOutlinedInput-root': {
                                    '&.Mui-focused fieldset': {
                                      borderColor: '#667eea',
                                    },
                                  },
                                  '& .MuiInputLabel-root.Mui-focused': {
                                    color: '#667eea',
                                  },
                                }}
                                InputProps={{
                                  endAdornment: <MKTypography variant="caption" sx={{ mr: 1 }}>%</MKTypography>
                                }}
                              />
                            </MKBox>
                          ))}
                          {Math.abs(positionSum - 100) >= 0.01 && (
                            <MKBox sx={{ 
                              p: 1, 
                              bgcolor: 'error.light', 
                              borderRadius: 1, 
                              border: '1px solid',
                              borderColor: 'error.main'
                            }}>
                              <MKTypography variant="caption" color="error.main" fontWeight="bold">
                                ⚠️ 포지션의 합이 100%가 되어야 합니다. (현재: {positionSum.toFixed(1)}%)
                              </MKTypography>
                            </MKBox>
                          )}
                        </MKBox>

                        {/* 실행 버튼 */}
                        <MKBox sx={{ mt: 2, display: 'flex', gap: 1 }}>
                          <Button
                            variant="contained"
                            sx={{
                              flex: 1,
                              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                              '&:hover': {
                                background: 'linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%)',
                              },
                            }}
                          >
                            설정 저장
                          </Button>
                          <Button
                            variant="outlined"
                            sx={{
                              flex: 1,
                              borderColor: '#667eea',
                              color: '#667eea',
                              '&:hover': {
                                borderColor: '#5a6fd8',
                                backgroundColor: 'rgba(102, 126, 234, 0.04)',
                              },
                            }}
                          >
                            초기화
                          </Button>
                        </MKBox>
                      </MKBox>
                    </MKBox>
                  )}
                </>
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
                  <MKTypography color="text.secondary">
                    데이터가 없습니다.
                  </MKTypography>
                </MKBox>
              )}
            </MKBox>
          </Grid>
        </Grid>
      </Box>

      {/* 재무제표 모달 */}
      <Dialog
        open={openFinancialModal}
        onClose={handleCloseFinancialModal}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 2,
            bgcolor: 'background.paper'
          }
        }}
      >
        <DialogTitle sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          pb: 1
        }}>
          <MKTypography variant="h6" fontWeight="bold">
            재무제표 {selectedStock && `- ${selectedStock.name} (${selectedStock.code})`}
          </MKTypography>
          <IconButton
            onClick={handleCloseFinancialModal}
            sx={{ color: 'text.secondary' }}
          >
            <Close />
          </IconButton>
        </DialogTitle>
        
        <DialogContent sx={{ pt: 1 }}>
          {financialLoading ? (
            <MKBox
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                height: "200px",
                flexDirection: "column"
              }}
            >
              <CircularProgress size={40} />
              <MKTypography variant="body2" mt={2} color="text.secondary">
                재무제표 데이터를 로드하는 중...
              </MKTypography>
            </MKBox>
          ) : financialData.length > 0 ? (
            <>
              {/* 손익계산서 */}
              <MKBox sx={{ mb: 3 }}>
                <MKTypography variant="h6" fontWeight="bold" sx={{ mb: 2, color: '#667eea' }}>
                  손익계산서
                </MKTypography>
                <TableContainer component={Paper} sx={{ boxShadow: 1, mb: 2 }}>
                  <Table size="small">
                    <TableHead>
                      <TableRow sx={{ bgcolor: 'grey.50', display: 'flex', width: '100%' }}>
                        <TableCell sx={{ 
                          fontWeight: 'bold', 
                          minWidth: 120, 
                          paddingRight: 3,
                          flex: 2,
                          display: 'flex',
                          alignItems: 'center'
                        }}>
                          항목
                        </TableCell>
                        {/* 최신 4개 분기를 년도-분기 순으로 내림차순 정렬 */}
                        {[...new Set(financialData.map(item => `${item.year} ${item.quarter}`))]
                          .sort((a, b) => {
                            const [yearA, quarterA] = a.split(' ');
                            const [yearB, quarterB] = b.split(' ');
                            if (yearA !== yearB) return yearB - yearA; // 년도 내림차순
                            // 분기 내림차순 (4Q > 3Q > 2Q > 1Q)
                            const quarterOrder = { '4Q': 4, '3Q': 3, '2Q': 2, '1Q': 1 };
                            return (quarterOrder[quarterB] || 0) - (quarterOrder[quarterA] || 0);
                          })
                          .slice(0, 4)
                          .map(period => (
                            <TableCell key={period} sx={{ 
                              fontWeight: 'bold', 
                              minWidth: 100,
                              flex: 1,
                              textAlign: 'right',
                              paddingRight: 2
                            }}>
                              {period}
                            </TableCell>
                          ))}
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {/* 손익계산서 항목들 */}
                      {[...new Set(financialData.filter(item => item.statement_type === '손익계산서').map(item => item.account_name))]
                        .map(accountName => (
                          <TableRow key={accountName} sx={{ '&:nth-of-type(odd)': { bgcolor: 'grey.25' }, display: 'flex', width: '100%' }}>
                            <TableCell sx={{ 
                              fontWeight: 'medium', 
                              minWidth: 120, 
                              paddingRight: 3,
                              flex: 2,
                              display: 'flex',
                              alignItems: 'center'
                            }}>
                              {accountName}
                            </TableCell>
                            {[...new Set(financialData.map(item => `${item.year} ${item.quarter}`))]
                              .sort((a, b) => {
                                const [yearA, quarterA] = a.split(' ');
                                const [yearB, quarterB] = b.split(' ');
                                if (yearA !== yearB) return yearB - yearA;
                                // 분기 내림차순 (4Q > 3Q > 2Q > 1Q)
                                const quarterOrder = { '4Q': 4, '3Q': 3, '2Q': 2, '1Q': 1 };
                                return (quarterOrder[quarterB] || 0) - (quarterOrder[quarterA] || 0);
                              })
                              .slice(0, 4)
                              .map(period => {
                                const [year, quarter] = period.split(' ');
                                const item = financialData.find(d => 
                                  d.year === year && 
                                  d.quarter === quarter && 
                                  d.account_name === accountName && 
                                  d.statement_type === '손익계산서'
                                );
                                return (
                                  <TableCell key={period} sx={{ 
                                    minWidth: 100,
                                    flex: 1,
                                    textAlign: 'right',
                                    paddingRight: 2
                                  }}>
                                    {item ? formatFinancialAmount(item.amount) : '-'}
                                  </TableCell>
                                );
                              })}
                          </TableRow>
                        ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </MKBox>

              {/* 재무상태표 */}
              <MKBox sx={{ mb: 2 }}>
                <MKTypography variant="h6" fontWeight="bold" sx={{ mb: 2, color: '#667eea' }}>
                  재무상태표
                </MKTypography>
                <TableContainer component={Paper} sx={{ boxShadow: 1 }}>
                  <Table size="small">
                    <TableHead>
                      <TableRow sx={{ bgcolor: 'grey.50', display: 'flex', width: '100%' }}>
                        <TableCell sx={{ 
                          fontWeight: 'bold', 
                          minWidth: 120,
                          paddingRight: 3,
                          flex: 2,
                          display: 'flex',
                          alignItems: 'center'
                        }}>
                          항목
                        </TableCell>
                        {/* 최신 4개 분기를 년도-분기 순으로 내림차순 정렬 */}
                        {[...new Set(financialData.map(item => `${item.year} ${item.quarter}`))]
                          .sort((a, b) => {
                            const [yearA, quarterA] = a.split(' ');
                            const [yearB, quarterB] = b.split(' ');
                            if (yearA !== yearB) return yearB - yearA; // 년도 내림차순
                            // 분기 내림차순 (4Q > 3Q > 2Q > 1Q)
                            const quarterOrder = { '4Q': 4, '3Q': 3, '2Q': 2, '1Q': 1 };
                            return (quarterOrder[quarterB] || 0) - (quarterOrder[quarterA] || 0);
                          })
                          .slice(0, 4)
                          .map(period => (
                            <TableCell key={period} sx={{ 
                              fontWeight: 'bold', 
                              minWidth: 100,
                              flex: 1,
                              textAlign: 'right',
                              paddingRight: 2
                            }}>
                              {period}
                            </TableCell>
                          ))}
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {[...new Set(financialData.filter(item => item.statement_type === '재무상태표').map(item => item.account_name))]
                        .map(accountName => (
                          <TableRow key={accountName} sx={{ '&:nth-of-type(odd)': { bgcolor: 'grey.25' }, display: 'flex', width: '100%' }}>
                            <TableCell sx={{ 
                              fontWeight: 'medium', 
                              minWidth: 120, 
                              paddingRight: 3,
                              flex: 2,
                              display: 'flex',
                              alignItems: 'center'
                            }}>
                              {accountName}
                            </TableCell>
                            {[...new Set(financialData.map(item => `${item.year} ${item.quarter}`))]
                              .sort((a, b) => {
                                const [yearA, quarterA] = a.split(' ');
                                const [yearB, quarterB] = b.split(' ');
                                if (yearA !== yearB) return yearB - yearA;
                                // 분기 내림차순 (4Q > 3Q > 2Q > 1Q)
                                const quarterOrder = { '4Q': 4, '3Q': 3, '2Q': 2, '1Q': 1 };
                                return (quarterOrder[quarterB] || 0) - (quarterOrder[quarterA] || 0);
                              })
                              .slice(0, 4)
                              .map(period => {
                                const [year, quarter] = period.split(' ');
                                const item = financialData.find(d => 
                                  d.year === year && 
                                  d.quarter === quarter && 
                                  d.account_name === accountName && 
                                  d.statement_type === '재무상태표'
                                );
                                return (
                                  <TableCell key={period} sx={{ 
                                    minWidth: 100,
                                    flex: 1,
                                    textAlign: 'right',
                                    paddingRight: 2
                                  }}>
                                    {item ? formatFinancialAmount(item.amount) : '-'}
                                  </TableCell>
                                );
                              })}
                          </TableRow>
                        ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </MKBox>
            </>
          ) : (
            <MKBox
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                height: "200px",
                flexDirection: "column"
              }}
            >
              <MKTypography variant="h6" color="text.secondary">
                재무제표 데이터가 없습니다
              </MKTypography>
              <MKTypography variant="body2" color="text.secondary" mt={1}>
                선택된 종목의 재무제표 정보를 찾을 수 없습니다
              </MKTypography>
            </MKBox>
          )}
          
          <MKBox sx={{ mt: 2, p: 1, bgcolor: 'info.light', borderRadius: 1 }}>
            <MKTypography variant="caption" color="info.dark">
              * 금액 단위: 원 (조/억/만 단위로 표시)
            </MKTypography>
          </MKBox>
        </DialogContent>
        
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={handleCloseFinancialModal} variant="contained" color="primary">
            닫기
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

export default Presentation;
