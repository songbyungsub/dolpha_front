/*
=========================================================
* Material Kit 2 React - MyPage Trading Configs Section
=========================================================
*/

// @mui material components
import Container from "@mui/material/Container";
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import Chip from "@mui/material/Chip";
import IconButton from "@mui/material/IconButton";
import Switch from "@mui/material/Switch";
import Button from "@mui/material/Button";

// @mui icons
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import RefreshIcon from "@mui/icons-material/Refresh";

// Material Kit 2 React components
import MKBox from "components/MKBox";
import MKTypography from "components/MKTypography";

import { useState, useEffect } from "react";

function TradingConfigs() {
  const [configs, setConfigs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTradingConfigs();
  }, []);

  const loadTradingConfigs = async () => {
    setLoading(true);
    try {
      // TODO: Django backend API 호출하여 사용자의 자동매매 설정 불러오기
      // 임시 데이터
      setConfigs([
        {
          id: 1,
          stock_code: "005930",
          stock_name: "삼성전자",
          trading_mode: "turtle",
          max_loss: 10.0,
          stop_loss: 5.0,
          take_profit: 15.0,
          pyramiding_count: 3,
          is_active: true,
          created_at: "2025-01-12 09:30:00",
          updated_at: "2025-01-12 10:15:00",
        },
        {
          id: 2,
          stock_code: "035420",
          stock_name: "NAVER",
          trading_mode: "manual",
          max_loss: 8.0,
          stop_loss: 4.0,
          take_profit: 12.0,
          pyramiding_count: 2,
          is_active: false,
          created_at: "2025-01-11 14:20:00",
          updated_at: "2025-01-11 14:20:00",
        },
      ]);
    } catch (error) {
      console.error("자동매매 설정 로드 실패:", error);
    } finally {
      setLoading(false);
    }
  };

  const toggleConfig = async (configId, currentStatus) => {
    try {
      // TODO: Django backend API 호출하여 설정 활성화/비활성화
      console.log(`설정 ${configId} 토글: ${!currentStatus}`);
      
      // 임시로 로컬 상태 업데이트
      setConfigs(configs.map(config => 
        config.id === configId 
          ? { ...config, is_active: !currentStatus }
          : config
      ));
      
      alert(`설정이 ${!currentStatus ? '활성화' : '비활성화'}되었습니다.`);
    } catch (error) {
      console.error("설정 토글 실패:", error);
      alert("설정 변경에 실패했습니다.");
    }
  };

  const deleteConfig = async (configId) => {
    if (!window.confirm("정말로 이 설정을 삭제하시겠습니까?")) {
      return;
    }

    try {
      // TODO: Django backend API 호출하여 설정 삭제
      console.log(`설정 ${configId} 삭제`);
      
      // 임시로 로컬 상태 업데이트
      setConfigs(configs.filter(config => config.id !== configId));
      
      alert("설정이 삭제되었습니다.");
    } catch (error) {
      console.error("설정 삭제 실패:", error);
      alert("설정 삭제에 실패했습니다.");
    }
  };

  const getTradingModeChip = (mode) => {
    return mode === "turtle" ? (
      <Chip label="Turtle(ATR)" color="info" size="small" />
    ) : (
      <Chip label="Manual" color="default" size="small" />
    );
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("ko-KR", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <MKBox component="section" py={2}>
      <Container>
        <Grid container spacing={3} justifyContent="center">
          <Grid item xs={12}>
            <Card sx={{ p: 4 }}>
              <MKBox display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                <MKBox>
                  <MKTypography variant="h5" mb={1}>
                    자동매매 설정 관리
                  </MKTypography>
                  <MKTypography variant="body2" color="text">
                    현재 등록된 자동매매 설정을 확인하고 관리하세요.
                  </MKTypography>
                </MKBox>
                <Button
                  variant="outlined"
                  onClick={loadTradingConfigs}
                  startIcon={<RefreshIcon />}
                  sx={{
                    borderColor: "#667eea",
                    color: "#667eea",
                    "&:hover": {
                      borderColor: "#5a6fd8",
                      backgroundColor: "rgba(102, 126, 234, 0.04)",
                    },
                  }}
                >
                  새로고침
                </Button>
              </MKBox>

              {loading ? (
                <MKBox textAlign="center" py={4}>
                  <MKTypography variant="body1">설정을 불러오는 중...</MKTypography>
                </MKBox>
              ) : configs.length === 0 ? (
                <MKBox textAlign="center" py={4}>
                  <MKTypography variant="body1" color="text">
                    등록된 자동매매 설정이 없습니다.
                  </MKTypography>
                  <MKTypography variant="body2" color="text" mt={1}>
                    Presentation 페이지에서 자동매매 설정을 등록해보세요.
                  </MKTypography>
                </MKBox>
              ) : (
                <TableContainer component={Paper}>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>종목</TableCell>
                        <TableCell>매매모드</TableCell>
                        <TableCell align="center">최대손실(%)</TableCell>
                        <TableCell align="center">손절(%)</TableCell>
                        <TableCell align="center">익절(%)</TableCell>
                        <TableCell align="center">피라미딩</TableCell>
                        <TableCell align="center">활성화</TableCell>
                        <TableCell align="center">최종수정</TableCell>
                        <TableCell align="center">작업</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {configs.map((config) => (
                        <TableRow key={config.id}>
                          <TableCell>
                            <MKBox>
                              <MKTypography variant="subtitle2" fontWeight="bold">
                                {config.stock_name}
                              </MKTypography>
                              <MKTypography variant="caption" color="text">
                                {config.stock_code}
                              </MKTypography>
                            </MKBox>
                          </TableCell>
                          <TableCell>{getTradingModeChip(config.trading_mode)}</TableCell>
                          <TableCell align="center">{config.max_loss}%</TableCell>
                          <TableCell align="center">{config.stop_loss}%</TableCell>
                          <TableCell align="center">{config.take_profit}%</TableCell>
                          <TableCell align="center">{config.pyramiding_count}회</TableCell>
                          <TableCell align="center">
                            <Switch
                              checked={config.is_active}
                              onChange={() => toggleConfig(config.id, config.is_active)}
                              color="primary"
                            />
                          </TableCell>
                          <TableCell align="center">
                            <MKTypography variant="caption">
                              {formatDate(config.updated_at)}
                            </MKTypography>
                          </TableCell>
                          <TableCell align="center">
                            <IconButton
                              size="small"
                              onClick={() => console.log("편집:", config.id)}
                              sx={{ color: "#667eea", mr: 1 }}
                            >
                              <EditIcon />
                            </IconButton>
                            <IconButton
                              size="small"
                              onClick={() => deleteConfig(config.id)}
                              sx={{ color: "#f44336" }}
                            >
                              <DeleteIcon />
                            </IconButton>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </Card>
          </Grid>
        </Grid>
      </Container>
    </MKBox>
  );
}

export default TradingConfigs;