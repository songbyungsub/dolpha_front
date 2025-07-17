import React from "react";
import Grid from "@mui/material/Grid";
import Chip from "@mui/material/Chip";
import MKBox from "components/MKBox";
import MKTypography from "components/MKTypography";
import { formatNumber } from "utils/formatters";

function StockList({ stockData, selectedStock, onStockClick }) {
  return (
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
            onClick={() => onStockClick(row)}
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
                    fontWeight="bold"
                    sx={{ 
                      fontSize: '0.75rem',
                      color: row['당기매출'] < 0 ? '#1976d2' : 'inherit',
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
                    fontWeight="bold"
                    sx={{ 
                      fontSize: '0.8rem',
                      color: row['당기영업이익'] < 0 ? '#1976d2' : 'inherit',
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
  );
}

export default StockList;