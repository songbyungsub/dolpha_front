import React from 'react';
import {
  Grid,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Switch,
  IconButton,
  Chip,
  Button
} from '@mui/material';
import {
  ExpandMore,
  Delete,
  Refresh
} from '@mui/icons-material';
import MKBox from 'components/MKBox';
import MKTypography from 'components/MKTypography';

/**
 * 자동매매 아코디언 컴포넌트
 */
const AutotradingAccordion = ({
  autotradingList,
  expandedAccordion,
  onAccordionChange,
  onToggle,
  onDelete,
  onRefresh,
  onStockSelect,
  selectedStock,
  showSnackbar
}) => {

  const handleAccordionChange = (stockCode) => (event, isExpanded) => {
    onAccordionChange(isExpanded ? stockCode : null);
    if (isExpanded) {
      // 아코디언이 확장될 때 해당 주식 선택
      const stock = autotradingList.find(config => config.stock_code === stockCode);
      if (stock) {
        onStockSelect({
          code: stock.stock_code,
          name: stock.stock_name
        });
      }
    }
  };

  return (
    <MKBox>
      {/* 자동매매 목록 헤더 */}
      <MKBox sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <MKTypography variant="h6" fontWeight="bold" sx={{ color: 'info.main' }}>
          자동매매 설정 목록 ({autotradingList.length}개)
        </MKTypography>
        <IconButton 
          onClick={onRefresh}
          size="small"
          sx={{ 
            color: 'info.main',
            '&:hover': { backgroundColor: 'info.light' }
          }}
        >
          <Refresh />
        </IconButton>
      </MKBox>

      {/* 자동매매 설정이 없는 경우 */}
      {autotradingList.length === 0 ? (
        <MKBox 
          sx={{ 
            textAlign: 'center', 
            py: 4, 
            bgcolor: 'grey.50', 
            borderRadius: 2 
          }}
        >
          <MKTypography variant="body1" color="text.secondary">
            설정된 자동매매가 없습니다.
          </MKTypography>
          <MKTypography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            종목을 선택하고 설정을 저장해보세요.
          </MKTypography>
        </MKBox>
      ) : (
        /* 자동매매 설정 아코디언 목록 */
        <MKBox>
          {autotradingList.map((stockConfig, index) => (
            <Accordion
              key={stockConfig.stock_code}
              expanded={expandedAccordion === stockConfig.stock_code}
              onChange={handleAccordionChange(stockConfig.stock_code)}
              sx={{
                mb: 2,
                boxShadow: 2,
                '&:before': { display: 'none' },
                '&.Mui-expanded': { margin: '0 0 16px 0' }
              }}
            >
              <AccordionSummary
                expandIcon={<ExpandMore />}
                sx={{
                  backgroundColor: stockConfig.is_active ? 'success.light' : 'grey.100',
                  borderRadius: expandedAccordion === stockConfig.stock_code ? '4px 4px 0 0' : '4px',
                  '&:hover': {
                    backgroundColor: stockConfig.is_active ? 'success.main' : 'grey.200'
                  },
                  '& .MuiAccordionSummary-content': {
                    alignItems: 'center'
                  }
                }}
              >
                <Grid container alignItems="center" spacing={2}>
                  <Grid item xs={3}>
                    <MKTypography variant="subtitle1" fontWeight="bold" color="white">
                      {stockConfig.stock_name}
                    </MKTypography>
                    <MKTypography variant="caption" color="rgba(255,255,255,0.8)">
                      {stockConfig.stock_code}
                    </MKTypography>
                  </Grid>
                  
                  <Grid item xs={2}>
                    <Chip
                      label={stockConfig.trading_mode === 'manual' ? '수동' : '터틀'}
                      size="small"
                      color={stockConfig.trading_mode === 'manual' ? 'primary' : 'secondary'}
                      sx={{ color: 'white', fontWeight: 'bold' }}
                    />
                  </Grid>
                  
                  <Grid item xs={2}>
                    <MKTypography variant="caption" color="rgba(255,255,255,0.8)">
                      손절: {stockConfig.stop_loss}%
                    </MKTypography>
                  </Grid>
                  
                  <Grid item xs={2}>
                    <MKTypography variant="caption" color="rgba(255,255,255,0.8)">
                      익절: {stockConfig.take_profit}%
                    </MKTypography>
                  </Grid>
                  
                  <Grid item xs={2}>
                    <MKTypography variant="caption" color="rgba(255,255,255,0.8)">
                      피라미딩: {stockConfig.pyramiding_count}회
                    </MKTypography>
                  </Grid>
                  
                  <Grid item xs={1}>
                    <Chip
                      label={stockConfig.is_active ? '활성' : '비활성'}
                      size="small"
                      color={stockConfig.is_active ? 'success' : 'error'}
                      sx={{ 
                        color: 'white', 
                        fontWeight: 'bold',
                        fontSize: '0.7rem'
                      }}
                    />
                  </Grid>
                </Grid>
              </AccordionSummary>
              
              <AccordionDetails sx={{ bgcolor: 'grey.50', p: 3 }}>
                <Grid container spacing={3}>
                  {/* 활성화 토글 */}
                  <Grid item xs={12} sm={4}>
                    <MKBox sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <MKTypography variant="body2" fontWeight="medium">
                        활성화 상태
                      </MKTypography>
                      <Switch
                        checked={stockConfig.is_active}
                        onChange={() => onToggle(stockConfig.stock_code, stockConfig.stock_name, stockConfig.is_active)}
                        color="success"
                      />
                    </MKBox>
                  </Grid>
                  
                  {/* 포지션 크기 */}
                  <Grid item xs={12} sm={4}>
                    <MKTypography variant="body2" color="text.secondary">
                      포지션 크기: {stockConfig.position_size?.toLocaleString() || 0}원
                    </MKTypography>
                  </Grid>
                  
                  {/* 최대 손실 */}
                  <Grid item xs={12} sm={4}>
                    <MKTypography variant="body2" color="text.secondary">
                      최대 손실: {stockConfig.max_loss || 0}%
                    </MKTypography>
                  </Grid>
                  
                  {/* 피라미딩 정보 */}
                  {stockConfig.pyramiding_count > 0 && (
                    <Grid item xs={12}>
                      <MKBox sx={{ p: 2, bgcolor: 'info.light', borderRadius: 1 }}>
                        <MKTypography variant="subtitle2" fontWeight="bold" sx={{ mb: 1, color: 'info.main' }}>
                          피라미딩 설정
                        </MKTypography>
                        <MKTypography variant="body2" color="text.secondary">
                          진입시점: {stockConfig.pyramiding_entries?.join(', ') || '없음'}%
                        </MKTypography>
                        <MKTypography variant="body2" color="text.secondary">
                          포지션 비율: {stockConfig.positions?.map(p => `${p}%`).join(', ') || '없음'}
                        </MKTypography>
                      </MKBox>
                    </Grid>
                  )}
                  
                  {/* 액션 버튼들 */}
                  <Grid item xs={12}>
                    <MKBox sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1, mt: 2 }}>
                      <Button
                        variant="outlined"
                        size="small"
                        onClick={() => {
                          onStockSelect({
                            code: stockConfig.stock_code,
                            name: stockConfig.stock_name
                          });
                          showSnackbar('설정이 폼에 로드되었습니다.', 'info');
                        }}
                        sx={{ mr: 1 }}
                      >
                        편집
                      </Button>
                      <Button
                        variant="contained"
                        color="error"
                        size="small"
                        startIcon={<Delete />}
                        onClick={() => onDelete(stockConfig.stock_code, stockConfig.stock_name)}
                      >
                        삭제
                      </Button>
                    </MKBox>
                  </Grid>
                </Grid>
              </AccordionDetails>
            </Accordion>
          ))}
        </MKBox>
      )}
    </MKBox>
  );
};

export default AutotradingAccordion;