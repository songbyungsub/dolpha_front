import React, { useState, useEffect, useRef } from 'react';
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

// @mui material components
import Box from "@mui/material/Box";
import CircularProgress from "@mui/material/CircularProgress";
import IconButton from "@mui/material/IconButton";
import Close from "@mui/icons-material/Close";
import Delete from "@mui/icons-material/Delete";
import ToggleButton from "@mui/material/ToggleButton";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import Tooltip from "@mui/material/Tooltip";
import Button from "@mui/material/Button";

// Material Kit 2 React components
import MKBox from "components/MKBox";
import MKTypography from "components/MKTypography";

// Utils
import { formatNumber, getKRXTickSize, adjustToKRXTickSize } from "utils/formatters";

// Register Chart.js components
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

const ChartContainer = ({
  ohlcvData = [],
  analysisData = [],
  indexOhlcvData = [],
  indexData = [],
  selectedIndexCode = '',
  selectedStock = {},
  entryPoint = '',
  pyramidingEntries = [],
  activeTab = 0,
  onIndexChange = () => {},
  onEntryPointChange = () => {},
  onPyramidingEntryChange = () => {},
  onShowSnackbar = () => {}
}) => {
  // Chart state
  const [chartLoading, setChartLoading] = useState(false);
  const [horizontalLines, setHorizontalLines] = useState([]);
  const [isDrawingMode, setIsDrawingMode] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [dragLineId, setDragLineId] = useState(null);
  const [selectedLineId, setSelectedLineId] = useState(null);
  const [showEntryPopup, setShowEntryPopup] = useState(false);

  // Chart reference
  const chartRef = useRef(null);

  // Drag state reference for immediate access
  const dragStateRef = useRef({
    isDragging: false,
    dragLineId: null
  });

  // Update drag state refs when state changes
  useEffect(() => {
    dragStateRef.current = {
      isDragging,
      dragLineId
    };
  }, [isDragging, dragLineId]);

  // Candlestick color dynamic application
  useEffect(() => {
    if (chartRef.current && ohlcvData.length > 0) {
      const chart = chartRef.current;
      
      try {
        // Find candlestick dataset and update colors
        const candlestickDataset = chart.data.datasets.find(dataset => dataset.type === 'candlestick');
        if (candlestickDataset) {
          // Set color properties
          candlestickDataset.backgroundColors = {
            up: '#f44336',
            down: '#2196f3',
            unchanged: '#757575'
          };
          candlestickDataset.borderColors = {
            up: '#f44336',
            down: '#2196f3',
            unchanged: '#757575'
          };
          chart.update('active');
        }
      } catch (error) {
        console.warn('Chart color update failed:', error);
      }
    }
  }, [ohlcvData]);

  // Chart data creation functions
  const createCandlestickData = (ohlcvData, analysisData) => {
    if (!ohlcvData || ohlcvData.length === 0) return null;

    const datasets = [
      {
        label: '캔들스틱',
        type: 'candlestick',
        data: ohlcvData.map((item, index) => {
          // Handle halted trading days: if open, high, low are 0 but close > 0, use close for all
          const isHalted = (item.open === 0 || item.high === 0 || item.low === 0) && item.close > 0;
          return {
            x: index,
            o: isHalted ? item.close : item.open,
            h: isHalted ? item.close : item.high,
            l: isHalted ? item.close : item.low,
            c: item.close
          };
        }),
        backgroundColors: {
          up: '#f44336',
          down: '#2196f3',
          unchanged: '#757575'
        },
        borderColors: {
          up: '#f44336',
          down: '#2196f3',
          unchanged: '#757575'
        }
      }
    ];

    // Add horizontal lines to datasets
    horizontalLines.forEach((line, index) => {
      const indexRange = ohlcvData.length > 0 ? [0, ohlcvData.length - 1] : [0, 1];

      datasets.push({
        label: `진입선 ${index + 1}`,
        type: 'line',
        data: [
          { x: indexRange[0], y: line.value },
          { x: indexRange[1], y: line.value }
        ],
        borderColor: line.color,
        backgroundColor: 'transparent',
        borderWidth: 2,
        pointRadius: 0,
        pointHoverRadius: 0,
        tension: 0,
        lineId: line.id,
        showLine: true,
        borderDash: line.type === 'pyramiding' ? [5, 5] : []
      });
    });

    return { datasets };
  };

  const createIndexCandlestickData = (indexOhlcvData) => {
    if (!indexOhlcvData || indexOhlcvData.length === 0) return null;

    return {
      datasets: [
        {
          label: '인덱스 캔들스틱',
          type: 'candlestick',
          data: indexOhlcvData.map((item, index) => {
            const isHalted = (item.open === 0 || item.high === 0 || item.low === 0) && item.close > 0;
            return {
              x: index,
              o: isHalted ? item.close : item.open,
              h: isHalted ? item.close : item.high,
              l: isHalted ? item.close : item.low,
              c: item.close
            };
          }),
          backgroundColors: {
            up: '#f44336',
            down: '#2196f3',
            unchanged: '#757575'
          },
          borderColors: {
            up: '#f44336',
            down: '#2196f3',
            unchanged: '#757575'
          }
        }
      ]
    };
  };

  const createVolumeData = (ohlcvData) => {
    if (!ohlcvData || ohlcvData.length === 0) return null;

    return {
      datasets: [
        {
          label: '거래량',
          type: 'bar',
          data: ohlcvData.map((item, index) => ({
            x: index,
            y: item.volume || 0
          })),
          backgroundColor: ohlcvData.map(item => 
            item.close >= item.open ? 'rgba(244, 67, 54, 0.6)' : 'rgba(33, 150, 243, 0.6)'
          ),
          borderColor: ohlcvData.map(item => 
            item.close >= item.open ? '#f44336' : '#2196f3'
          ),
          borderWidth: 1
        }
      ]
    };
  };

  const createRSRankData = (analysisData) => {
    if (!analysisData || analysisData.length === 0) return null;

    return {
      datasets: [
        {
          label: 'RS Rank',
          type: 'line',
          data: analysisData
            .filter(item => item.rsRank !== null && item.rsRank !== undefined && !isNaN(item.rsRank))
            .map((item, index) => ({
              x: index,
              y: item.rsRank
            })),
          borderColor: '#f44336',
          backgroundColor: 'transparent',
          borderWidth: 2,
          pointRadius: 3,
          pointHoverRadius: 5,
          tension: 0.1
        },
        {
          label: 'RS Rank 기준선',
          type: 'line',
          data: [
            { x: 0, y: 80 },
            { x: analysisData.length - 1, y: 80 }
          ],
          borderColor: '#ff9800',
          backgroundColor: 'transparent',
          borderWidth: 1,
          pointRadius: 0,
          pointHoverRadius: 0,
          tension: 0,
          borderDash: [5, 5]
        }
      ]
    };
  };

  // Event handlers for horizontal lines
  const handleAddHorizontalLine = (yValue) => {
    const newLine = {
      id: Date.now(),
      value: adjustToKRXTickSize(yValue),
      color: '#667eea',
      isDragging: false,
      type: 'entry'
    };
    setHorizontalLines(prev => [...prev, newLine]);
    
    if (activeTab === 0) {
      onEntryPointChange(yValue.toString());
    }
    
    if (chartRef.current) {
      chartRef.current.update('active');
    }
  };

  const handleUpdateHorizontalLine = (id, newValue) => {
    setHorizontalLines(prev => 
      prev.map(line => line.id === id ? { ...line, value: newValue } : line)
    );
    
    const line = horizontalLines.find(line => line.id === id);
    if (line) {
      if (line.type === 'entry') {
        onEntryPointChange(newValue.toString());
      } else if (line.type === 'pyramiding') {
        const lineIndex = horizontalLines.findIndex(l => l.id === id && l.type === 'pyramiding');
        if (lineIndex >= 0) {
          const baseEntryPrice = parseFloat(entryPoint);
          if (baseEntryPrice && baseEntryPrice > 0) {
            const percentage = ((newValue - baseEntryPrice) / baseEntryPrice * 100).toFixed(2);
            const percentageStr = percentage > 0 ? `+${percentage}` : percentage.toString();
            onPyramidingEntryChange(lineIndex, percentageStr);
          } else {
            onPyramidingEntryChange(lineIndex, newValue.toString());
          }
        }
      }
    }
    
    if (chartRef.current) {
      chartRef.current.update('active');
    }
  };

  const handleDeleteHorizontalLine = (id) => {
    setHorizontalLines(prev => prev.filter(line => line.id !== id));
    if (chartRef.current) {
      chartRef.current.update('active');
    }
  };

  const toggleDrawingMode = () => {
    setIsDrawingMode(!isDrawingMode);
  };

  // Mouse event handlers for line dragging
  const handleLabelClick = (lineId, event) => {
    event.preventDefault();
    event.stopPropagation();
    
    if (selectedLineId === lineId) {
      setShowEntryPopup(!showEntryPopup);
    } else {
      setSelectedLineId(lineId);
      setShowEntryPopup(true);
    }
  };

  const handleLabelMouseDown = (lineId, event) => {
    event.preventDefault();
    
    const handleMouseMove = () => {
      dragStateRef.current = {
        isDragging: true,
        dragLineId: lineId
      };
      setIsDragging(true);
      setDragLineId(lineId);
      
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      
      document.addEventListener('mousemove', handleGlobalMouseMove);
      document.addEventListener('mouseup', handleGlobalMouseUp);
    };

    const handleMouseUp = () => {
      if (!dragStateRef.current.isDragging) {
        handleLabelClick(lineId, event);
      }
      
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
    
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  const handleGlobalMouseMove = (event) => {
    const { isDragging: refIsDragging, dragLineId: refDragLineId } = dragStateRef.current;
    
    if (refIsDragging && refDragLineId && chartData && ohlcvData.length > 0) {
      try {
        const chartCanvas = document.querySelector('canvas');
        
        if (chartCanvas) {
          const rect = chartCanvas.getBoundingClientRect();
          const y = event.clientY - rect.top;
          
          const yScale = chartData.datasets[0]?.data || [];
          if (yScale.length === 0) return;

          const chartHeight = 350;
          const normalizedY = Math.max(0, Math.min(1, (y - 30) / (chartHeight - 60)));
          
          const maxPrice = Math.max(...ohlcvData.map(item => Math.max(item.high, item.close, item.open, item.low)));
          const minPrice = Math.min(...ohlcvData.map(item => Math.min(item.low, item.close, item.open, item.high)));
          const priceRange = maxPrice - minPrice;
          
          const newValue = maxPrice - (normalizedY * priceRange);
          const adjustedValue = adjustToKRXTickSize(newValue);
          
          setHorizontalLines(prev => 
            prev.map(line => line.id === refDragLineId ? { ...line, value: adjustedValue } : line)
          );
        }
      } catch (error) {
        console.warn('Error during line dragging:', error);
      }
    }
  };

  const handleGlobalMouseUp = () => {
    const { isDragging: refIsDragging, dragLineId: refDragLineId } = dragStateRef.current;
    
    if (refIsDragging && refDragLineId) {
      const line = horizontalLines.find(line => line.id === refDragLineId);
      if (line) {
        if (line.type === 'entry') {
          onEntryPointChange(line.value.toString());
        } else if (line.type === 'pyramiding') {
          const lineIndex = horizontalLines.findIndex(l => l.id === refDragLineId && l.type === 'pyramiding');
          if (lineIndex >= 0) {
            const baseEntryPrice = parseFloat(entryPoint);
            if (baseEntryPrice && baseEntryPrice > 0) {
              const percentage = ((line.value - baseEntryPrice) / baseEntryPrice * 100).toFixed(2);
              const percentageStr = percentage > 0 ? `+${percentage}` : percentage.toString();
              onPyramidingEntryChange(lineIndex, percentageStr);
            } else {
              onPyramidingEntryChange(lineIndex, line.value.toString());
            }
          }
        }
      }
    }
    
    setIsDragging(false);
    setDragLineId(null);
    dragStateRef.current = {
      isDragging: false,
      dragLineId: null
    };
    
    document.removeEventListener('mousemove', handleGlobalMouseMove);
    document.removeEventListener('mouseup', handleGlobalMouseUp);
  };

  // Connect line to entry point
  const connectLineToEntry = (lineId) => {
    const line = horizontalLines.find(l => l.id === lineId);
    if (line) {
      const adjustedPrice = adjustToKRXTickSize(line.value);
      onEntryPointChange(adjustedPrice.toString());
      setHorizontalLines(prev => 
        prev.map(l => 
          l.id === lineId ? { ...l, type: 'entry', color: '#667eea' } : l
        )
      );
    }
  };

  const connectLineToPyramiding = (lineId) => {
    const line = horizontalLines.find(l => l.id === lineId);
    if (!line) return;
    
    const baseEntryPrice = parseFloat(entryPoint);
    if (!baseEntryPrice || baseEntryPrice <= 0) {
      onShowSnackbar('1차 진입시점을 먼저 설정해주세요.', 'warning');
      return;
    }
    
    const adjustedPrice = adjustToKRXTickSize(line.value);
    const percentage = ((adjustedPrice - baseEntryPrice) / baseEntryPrice * 100).toFixed(2);
    const percentageStr = percentage > 0 ? `+${percentage}` : percentage.toString();
    
    onPyramidingEntryChange(pyramidingEntries.length, percentageStr);
    
    setHorizontalLines(prev => 
      prev.map(l => 
        l.id === lineId ? { ...l, type: 'pyramiding', color: '#ff9800' } : l
      )
    );
  };

  // Create chart data
  const chartData = createCandlestickData(ohlcvData, analysisData);
  const volumeData = createVolumeData(ohlcvData);
  const indexChartData = createIndexCandlestickData(indexOhlcvData);
  const rsRankData = createRSRankData(analysisData);

  // Chart options
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
          let dataY;
          
          if (event.native && chart.canvas && chart.scales.y) {
            const rect = chart.canvas.getBoundingClientRect();
            const y = event.native.clientY - rect.top;
            dataY = chart.scales.y.getValueForPixel(y);
          } else {
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
          if (ohlcvData.length > 0) {
            const lastPrice = ohlcvData[ohlcvData.length - 1].close;
            handleAddHorizontalLine(lastPrice);
            setIsDrawingMode(false);
          }
        }
      }
    },
    onHover: (event, elements, chart) => {
      if (event.native && event.native.target) {
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
      }
    },
    scales: {
      x: {
        type: 'category',
        labels: ohlcvData.map(item => new Date(item.date).toLocaleDateString('ko-KR', { month: 'numeric', day: 'numeric' })),
        grid: {
          display: true,
          color: 'rgba(0,0,0,0.05)',
        },
        ticks: {
          autoSkip: true,
          autoSkipPadding: 10,
          maxTicksLimit: 8,
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
        afterDataLimits: function(scale) {
          scale.max = scale.max * 1.02;
          scale.min = scale.min * 0.98;
        }
      }
    },
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        mode: 'nearest',
        intersect: false,
        callbacks: {
          title: function(context) {
            const index = context[0].dataIndex;
            if (ohlcvData[index]) {
              return new Date(ohlcvData[index].date).toLocaleDateString('ko-KR');
            }
            return '';
          },
          label: function(context) {
            const datasetLabel = context.dataset.label;
            if (datasetLabel === '캔들스틱') {
              const data = context.raw;
              return [
                `시가: ${new Intl.NumberFormat('ko-KR').format(data.o)}`,
                `고가: ${new Intl.NumberFormat('ko-KR').format(data.h)}`,
                `저가: ${new Intl.NumberFormat('ko-KR').format(data.l)}`,
                `종가: ${new Intl.NumberFormat('ko-KR').format(data.c)}`
              ];
            }
            return `${datasetLabel}: ${new Intl.NumberFormat('ko-KR').format(context.parsed.y)}`;
          }
        }
      }
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
        type: 'category',
        labels: indexOhlcvData.map(item => new Date(item.date).toLocaleDateString('ko-KR', { month: 'numeric', day: 'numeric' })),
        grid: {
          display: true,
          color: 'rgba(0,0,0,0.05)',
        },
        ticks: {
          autoSkip: true,
          autoSkipPadding: 10,
          maxTicksLimit: 8,
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
        afterDataLimits: function(scale) {
          scale.max = scale.max * 1.02;
          scale.min = scale.min * 0.98;
        }
      }
    },
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        mode: 'nearest',
        intersect: false,
        callbacks: {
          title: function(context) {
            const index = context[0].dataIndex;
            if (indexOhlcvData[index]) {
              return new Date(indexOhlcvData[index].date).toLocaleDateString('ko-KR');
            }
            return '';
          },
          label: function(context) {
            const data = context.raw;
            return [
              `시가: ${new Intl.NumberFormat('ko-KR').format(data.o)}`,
              `고가: ${new Intl.NumberFormat('ko-KR').format(data.h)}`,
              `저가: ${new Intl.NumberFormat('ko-KR').format(data.l)}`,
              `종가: ${new Intl.NumberFormat('ko-KR').format(data.c)}`
            ];
          }
        }
      }
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
        type: 'category',
        labels: ohlcvData.map(item => new Date(item.date).toLocaleDateString('ko-KR', { month: 'numeric', day: 'numeric' })),
        grid: {
          display: true,
          color: 'rgba(0,0,0,0.05)',
        },
        ticks: {
          autoSkip: true,
          autoSkipPadding: 10,
          maxTicksLimit: 8,
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
            return new Intl.NumberFormat('ko-KR').format(value);
          }
        }
      }
    },
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        mode: 'nearest',
        intersect: false,
        callbacks: {
          title: function(context) {
            const index = context[0].dataIndex;
            if (ohlcvData[index]) {
              return new Date(ohlcvData[index].date).toLocaleDateString('ko-KR');
            }
            return '';
          },
          label: function(context) {
            return `거래량: ${new Intl.NumberFormat('ko-KR').format(context.parsed.y)}`;
          }
        }
      }
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
        type: 'category',
        labels: analysisData.map(item => new Date(item.date).toLocaleDateString('ko-KR', { month: 'numeric', day: 'numeric' })),
        grid: {
          display: true,
          color: 'rgba(0,0,0,0.05)',
        },
        ticks: {
          autoSkip: true,
          autoSkipPadding: 10,
          maxTicksLimit: 8,
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
        }
      }
    },
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        mode: 'nearest',
        intersect: false,
        callbacks: {
          title: function(context) {
            const index = context[0].dataIndex;
            if (analysisData[index]) {
              return new Date(analysisData[index].date).toLocaleDateString('ko-KR');
            }
            return '';
          },
          label: function(context) {
            return `RS Rank: ${context.parsed.y}`;
          }
        }
      }
    }
  };

  return (
    <MKBox sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
      {/* Chart controls */}
      <MKBox sx={{ 
        display: "flex", 
        justifyContent: "space-between", 
        alignItems: "center", 
        mb: 1, 
        px: 1 
      }}>
        <MKBox sx={{ display: "flex", gap: 1, alignItems: "center" }}>
          <Tooltip title={isDrawingMode ? "수평선 그리기 종료" : "수평선 그리기 시작"}>
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
              📏
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
      </MKBox>

      {/* Main chart content */}
      <MKBox sx={{ position: "relative", flex: 1 }}>
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
            <CircularProgress size={40} sx={{ mb: 2 }} />
            <MKTypography variant="body2" color="text">
              차트를 로드하는 중...
            </MKTypography>
          </MKBox>
        ) : chartData && ohlcvData.length > 0 ? (
          <>
            {/* Horizontal line labels */}
            {horizontalLines.map((line) => {
              let linePosition = 175;
              
              if (chartRef.current) {
                const chartInstance = chartRef.current;
                if (chartInstance.scales && chartInstance.scales.y) {
                  const yScale = chartInstance.scales.y;
                  try {
                    const pixelPosition = yScale.getPixelForValue(line.value);
                    if (!isNaN(pixelPosition)) {
                      linePosition = pixelPosition - 12;
                    }
                  } catch (error) {
                    const yScale = chartData ? chartData.datasets[0]?.data : [];
                    if (yScale.length > 0) {
                      const maxPrice = Math.max(...ohlcvData.map(item => Math.max(item.high, item.close, item.open, item.low)));
                      const minPrice = Math.min(...ohlcvData.map(item => Math.min(item.low, item.close, item.open, item.high)));
                      const priceRange = maxPrice - minPrice;
                      const chartHeight = 350;
                      linePosition = ((maxPrice - line.value) / priceRange) * (chartHeight - 60) + 30 - 12;
                    }
                  }
                } else {
                  const yScale = chartData ? chartData.datasets[0]?.data : [];
                  if (yScale.length > 0) {
                    const maxPrice = Math.max(...ohlcvData.map(item => Math.max(item.high, item.close, item.open, item.low)));
                    const minPrice = Math.min(...ohlcvData.map(item => Math.min(item.low, item.close, item.open, item.high)));
                    const priceRange = maxPrice - minPrice;
                    const chartHeight = 350;
                    linePosition = ((maxPrice - line.value) / priceRange) * (chartHeight - 60) + 30 - 12;
                  }
                }
              }

              return (
                <MKBox
                  key={line.id}
                  sx={{
                    position: 'absolute',
                    top: `${linePosition}px`,
                    right: 8,
                    zIndex: 1000,
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
                      fontWeight: 'bold',
                      color: isDragging && dragLineId === line.id 
                        ? 'white'
                        : selectedLineId === line.id 
                          ? 'white' 
                          : 'text.primary',
                      minWidth: '60px',
                      userSelect: 'none'
                    }}
                  >
                    {new Intl.NumberFormat('ko-KR').format(line.value)}
                  </MKTypography>
                  
                  <IconButton
                    size="small"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteHorizontalLine(line.id);
                    }}
                    sx={{
                      p: 0.25,
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

            {/* Entry popup */}
            {showEntryPopup && selectedLineId && (
              <MKBox sx={{
                position: 'absolute',
                top: 20,
                right: 20,
                zIndex: 1001,
                backgroundColor: 'white',
                border: '1px solid #ddd',
                borderRadius: 2,
                p: 2,
                boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                minWidth: 200
              }}>
                <MKBox sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                  <MKTypography variant="subtitle2" fontWeight="bold">
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
                    sx={{ fontSize: '11px', py: 0.5 }}
                  >
                    1차 진입시점으로 설정
                  </Button>
                  <Button
                    size="small"
                    variant="outlined"
                    onClick={() => {
                      connectLineToPyramiding(selectedLineId);
                      setShowEntryPopup(false);
                    }}
                    sx={{ fontSize: '11px', py: 0.5 }}
                  >
                    피라미딩 진입시점으로 설정
                  </Button>
                </MKBox>
              </MKBox>
            )}

            {/* Drawing mode indicator */}
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
                  차트 클릭으로 수평선 추가
                </MKTypography>
              </MKBox>
            )}

            {/* Main candlestick chart */}
            <MKBox sx={{ 
              height: "350px",
              backgroundColor: "#ffffff",
              border: "1px solid #e0e0e0",
              borderRadius: 1,
              p: 0.5,
              mb: 1
            }}>
              <Chart 
                ref={chartRef}
                type="candlestick" 
                data={chartData} 
                options={chartOptions}
              />
            </MKBox>
            
            {/* Volume chart */}
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
            
            {/* Index chart */}
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
                    <MKTypography variant="caption" color="text">
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
                      onChange={onIndexChange}
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
                          {index.name} ({index.market})
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </MKBox>
                
                {indexChartData && indexOhlcvData.length > 0 ? (
                  <MKBox sx={{ height: "calc(100% - 80px)" }}>
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

            {/* RS Rank chart */}
            {analysisData.length > 0 && (
              <MKBox sx={{ 
                height: "300px",
                backgroundColor: "#ffffff",
                border: "1px solid #e0e0e0",
                borderRadius: 1,
                p: 0.5
              }}>
                {rsRankData ? (
                  <MKBox sx={{ height: "100%" }}>
                    <Chart type="line" data={rsRankData} options={rsRankOptions} />
                  </MKBox>
                ) : (
                  <MKBox
                    sx={{
                      height: "100%",
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
          </>
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
      </MKBox>
    </MKBox>
  );
};

export default ChartContainer;