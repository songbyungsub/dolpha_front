import React, { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  CircularProgress,
  Button,
  IconButton,
} from "@mui/material";
import { Close } from "@mui/icons-material";
import MKBox from "components/MKBox";
import MKTypography from "components/MKTypography";
import { formatFinancialAmount } from "utils/formatters";

/**
 * 재무제표 모달 컴포넌트
 */
const FinancialModal = ({ open, onClose, selectedStock, financialData, loading, onOpen }) => {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2,
          bgcolor: "background.paper",
        },
      }}
    >
      <DialogTitle
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          pb: 1,
        }}
      >
        <MKTypography variant="h6" fontWeight="bold">
          재무제표 {selectedStock && `- ${selectedStock.name} (${selectedStock.code})`}
        </MKTypography>
        <IconButton onClick={onClose} color="default" sx={{ position: "absolute", right: 8, top: 8 }}>
          <Close />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ pt: 1 }}>
        {loading ? (
          <MKBox
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              height: "200px",
              flexDirection: "column",
            }}
          >
            <CircularProgress size={40} />
            <MKTypography variant="body2" mt={2} color="text">
              재무제표 데이터를 로드하는 중...
            </MKTypography>
          </MKBox>
        ) : financialData.length > 0 ? (
          <>
            {/* 손익계산서 */}
            <MKBox sx={{ mb: 3 }}>
              <MKTypography variant="h6" fontWeight="bold" sx={{ mb: 2, color: "info" }}>
                손익계산서
              </MKTypography>
              <TableContainer component={Paper} sx={{ boxShadow: 1, mb: 2 }}>
                <Table size="small">
                  <TableHead>
                    <TableRow sx={{ bgcolor: "grey.50", display: "flex", width: "100%" }}>
                      <TableCell
                        sx={{
                          fontWeight: "bold",
                          minWidth: 120,
                          paddingRight: 3,
                          flex: 2,
                          display: "flex",
                          alignItems: "center",
                        }}
                      >
                        항목
                      </TableCell>
                      {/* 최신 4개 분기를 년도-분기 순으로 내림차순 정렬 */}
                      {[...new Set(financialData.map((item) => `${item.year} ${item.quarter}`))]
                        .sort((a, b) => {
                          const [yearA, quarterA] = a.split(" ");
                          const [yearB, quarterB] = b.split(" ");
                          if (yearA !== yearB) return yearB - yearA; // 년도 내림차순
                          // 분기 내림차순 (4Q > 3Q > 2Q > 1Q)
                          const quarterOrder = { "4Q": 4, "3Q": 3, "2Q": 2, "1Q": 1 };
                          return (quarterOrder[quarterB] || 0) - (quarterOrder[quarterA] || 0);
                        })
                        .slice(0, 4)
                        .map((period) => (
                          <TableCell
                            key={period}
                            sx={{
                              fontWeight: "bold",
                              minWidth: 100,
                              flex: 1,
                              textAlign: "right",
                              paddingRight: 2,
                            }}
                          >
                            {period}
                          </TableCell>
                        ))}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {/* 손익계산서 항목들 */}
                    {[
                      ...new Set(
                        financialData
                          .filter((item) => item.statement_type === "손익계산서")
                          .map((item) => item.account_name)
                      ),
                    ].map((accountName) => (
                      <TableRow
                        key={accountName}
                        sx={{
                          "&:nth-of-type(odd)": { bgcolor: "grey.25" },
                          display: "flex",
                          width: "100%",
                        }}
                      >
                        <TableCell
                          sx={{
                            fontWeight: "medium",
                            minWidth: 120,
                            paddingRight: 3,
                            flex: 2,
                            display: "flex",
                            alignItems: "center",
                          }}
                        >
                          {accountName}
                        </TableCell>
                        {[...new Set(financialData.map((item) => `${item.year} ${item.quarter}`))]
                          .sort((a, b) => {
                            const [yearA, quarterA] = a.split(" ");
                            const [yearB, quarterB] = b.split(" ");
                            if (yearA !== yearB) return yearB - yearA;
                            // 분기 내림차순 (4Q > 3Q > 2Q > 1Q)
                            const quarterOrder = { "4Q": 4, "3Q": 3, "2Q": 2, "1Q": 1 };
                            return (quarterOrder[quarterB] || 0) - (quarterOrder[quarterA] || 0);
                          })
                          .slice(0, 4)
                          .map((period) => {
                            const [year, quarter] = period.split(" ");
                            const item = financialData.find(
                              (d) =>
                                d.year === year &&
                                d.quarter === quarter &&
                                d.account_name === accountName &&
                                d.statement_type === "손익계산서"
                            );
                            return (
                              <TableCell
                                key={period}
                                sx={{
                                  minWidth: 100,
                                  flex: 1,
                                  textAlign: "right",
                                  paddingRight: 2,
                                  color: item && item.amount < 0 ? "#1976d2" : "inherit",
                                  fontWeight: item && item.amount < 0 ? "bold" : "normal",
                                }}
                              >
                                {item ? formatFinancialAmount(item.amount) : "-"}
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
              <MKTypography variant="h6" fontWeight="bold" sx={{ mb: 2, color: "info" }}>
                재무상태표
              </MKTypography>
              <TableContainer component={Paper} sx={{ boxShadow: 1 }}>
                <Table size="small">
                  <TableHead>
                    <TableRow sx={{ bgcolor: "grey.50", display: "flex", width: "100%" }}>
                      <TableCell
                        sx={{
                          fontWeight: "bold",
                          minWidth: 120,
                          paddingRight: 3,
                          flex: 2,
                          display: "flex",
                          alignItems: "center",
                        }}
                      >
                        항목
                      </TableCell>
                      {/* 최신 4개 분기를 년도-분기 순으로 내림차순 정렬 */}
                      {[...new Set(financialData.map((item) => `${item.year} ${item.quarter}`))]
                        .sort((a, b) => {
                          const [yearA, quarterA] = a.split(" ");
                          const [yearB, quarterB] = b.split(" ");
                          if (yearA !== yearB) return yearB - yearA; // 년도 내림차순
                          // 분기 내림차순 (4Q > 3Q > 2Q > 1Q)
                          const quarterOrder = { "4Q": 4, "3Q": 3, "2Q": 2, "1Q": 1 };
                          return (quarterOrder[quarterB] || 0) - (quarterOrder[quarterA] || 0);
                        })
                        .slice(0, 4)
                        .map((period) => (
                          <TableCell
                            key={period}
                            sx={{
                              fontWeight: "bold",
                              minWidth: 100,
                              flex: 1,
                              textAlign: "right",
                              paddingRight: 2,
                            }}
                          >
                            {period}
                          </TableCell>
                        ))}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {[
                      ...new Set(
                        financialData
                          .filter((item) => item.statement_type === "재무상태표")
                          .map((item) => item.account_name)
                      ),
                    ].map((accountName) => (
                      <TableRow
                        key={accountName}
                        sx={{
                          "&:nth-of-type(odd)": { bgcolor: "grey.25" },
                          display: "flex",
                          width: "100%",
                        }}
                      >
                        <TableCell
                          sx={{
                            fontWeight: "medium",
                            minWidth: 120,
                            paddingRight: 3,
                            flex: 2,
                            display: "flex",
                            alignItems: "center",
                          }}
                        >
                          {accountName}
                        </TableCell>
                        {[...new Set(financialData.map((item) => `${item.year} ${item.quarter}`))]
                          .sort((a, b) => {
                            const [yearA, quarterA] = a.split(" ");
                            const [yearB, quarterB] = b.split(" ");
                            if (yearA !== yearB) return yearB - yearA;
                            // 분기 내림차순 (4Q > 3Q > 2Q > 1Q)
                            const quarterOrder = { "4Q": 4, "3Q": 3, "2Q": 2, "1Q": 1 };
                            return (quarterOrder[quarterB] || 0) - (quarterOrder[quarterA] || 0);
                          })
                          .slice(0, 4)
                          .map((period) => {
                            const [year, quarter] = period.split(" ");
                            const item = financialData.find(
                              (d) =>
                                d.year === year &&
                                d.quarter === quarter &&
                                d.account_name === accountName &&
                                d.statement_type === "재무상태표"
                            );
                            return (
                              <TableCell
                                key={period}
                                sx={{
                                  minWidth: 100,
                                  flex: 1,
                                  textAlign: "right",
                                  paddingRight: 2,
                                  color: item && item.amount < 0 ? "#1976d2" : "inherit",
                                  fontWeight: item && item.amount < 0 ? "bold" : "normal",
                                }}
                              >
                                {item ? formatFinancialAmount(item.amount) : "-"}
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
              flexDirection: "column",
            }}
          >
            <MKTypography variant="h6" color="text">
              재무제표 데이터가 없습니다
            </MKTypography>
            <MKTypography variant="body2" color="text" mt={1}>
              선택된 종목의 재무제표 정보를 찾을 수 없습니다
            </MKTypography>
          </MKBox>
        )}

        <MKBox sx={{ mt: 2, p: 1, bgcolor: "info.light", borderRadius: 1 }}>
          <MKTypography variant="caption" color="info">
            * 금액 단위: 원 (조/억/만 단위로 표시)
          </MKTypography>
        </MKBox>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose} variant="contained" color="primary">
          닫기
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default FinancialModal;
