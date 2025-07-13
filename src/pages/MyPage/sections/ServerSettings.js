/*
=========================================================
* Material Kit 2 React - MyPage Server Settings Section
=========================================================
*/

// @mui material components
import Container from "@mui/material/Container";
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import Alert from "@mui/material/Alert";
import CircularProgress from "@mui/material/CircularProgress";
import Divider from "@mui/material/Divider";

// Material Kit 2 React components
import MKBox from "components/MKBox";
import MKTypography from "components/MKTypography";

import { useState, useEffect } from "react";

function ServerSettings() {
  const [serverInfo, setServerInfo] = useState({
    ip: "",
    port: "8080",
  });
  const [connectionStatus, setConnectionStatus] = useState("unknown"); // unknown, testing, connected, failed
  const [loading, setLoading] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);
  const [lastConnectionTime, setLastConnectionTime] = useState(null);

  useEffect(() => {
    // 저장된 서버 정보 불러오기
    loadServerSettings();
  }, []);

  const loadServerSettings = async () => {
    try {
      const apiBaseUrl = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8000';
      
      const response = await fetch(`${apiBaseUrl}/api/mypage/server-settings`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          // TODO: AuthContext에서 JWT 토큰 가져와서 헤더에 추가
          // 'Authorization': `Bearer ${token}`,
        },
        // credentials: 'include', // 임시로 제거
      });

      if (response.ok) {
        const data = await response.json();
        setServerInfo({
          ip: data.autobot_server_ip || "",
          port: data.autobot_server_port ? String(data.autobot_server_port) : "8080",
        });
        setLastConnectionTime(data.last_connection);
        setConnectionStatus(data.server_status === 'online' ? 'connected' : 
                          data.server_status === 'offline' ? 'unknown' : 'failed');
      } else {
        console.error("서버 설정 로드 실패:", response.status);
      }
    } catch (error) {
      console.error("서버 설정 로드 실패:", error);
    }
  };

  const testConnection = async () => {
    if (!serverInfo.ip || !serverInfo.port) {
      alert("IP 주소와 포트를 입력해주세요.");
      return;
    }

    setLoading(true);
    setConnectionStatus("testing");

    try {
      const apiBaseUrl = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8000';
      
      const response = await fetch(`${apiBaseUrl}/api/mypage/server-connection-test`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // TODO: AuthContext에서 JWT 토큰 가져와서 헤더에 추가
          // 'Authorization': `Bearer ${token}`,
        },
        // credentials: 'include', // 임시로 제거
        body: JSON.stringify({
          ip: serverInfo.ip,
          port: parseInt(serverInfo.port),
        }),
      });

      const result = await response.json();
      
      if (result.success) {
        setConnectionStatus("connected");
        setLastConnectionTime(new Date().toLocaleString());
        alert("서버 연결 성공!");
      } else {
        setConnectionStatus("failed");
        alert("서버 연결 실패: " + result.error);
      }
    } catch (error) {
      setConnectionStatus("failed");
      alert("서버 연결 실패: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const saveSettings = async () => {
    if (!serverInfo.ip || !serverInfo.port) {
      alert("IP 주소와 포트를 입력해주세요.");
      return;
    }

    setSaveLoading(true);

    try {
      const apiBaseUrl = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8000';
      
      const response = await fetch(`${apiBaseUrl}/api/mypage/server-settings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // TODO: AuthContext에서 JWT 토큰 가져와서 헤더에 추가
          // 'Authorization': `Bearer ${token}`,
        },
        // credentials: 'include', // 임시로 제거
        body: JSON.stringify({
          autobot_server_ip: serverInfo.ip,
          autobot_server_port: parseInt(serverInfo.port),
        }),
      });

      const result = await response.json();
      
      if (result.success) {
        alert("서버 설정이 저장되었습니다!");
      } else {
        alert("서버 설정 저장 실패: " + result.error);
      }
    } catch (error) {
      console.error("서버 설정 저장 실패:", error);
      alert("서버 설정 저장에 실패했습니다: " + error.message);
    } finally {
      setSaveLoading(false);
    }
  };

  const getStatusChip = () => {
    switch (connectionStatus) {
      case "connected":
        return <Chip label="연결됨" color="success" size="small" />;
      case "failed":
        return <Chip label="연결 실패" color="error" size="small" />;
      case "testing":
        return <Chip label="테스트 중..." color="warning" size="small" />;
      default:
        return <Chip label="알 수 없음" color="default" size="small" />;
    }
  };

  return (
    <MKBox component="section" py={2}>
      <Container>
        <Grid container spacing={3} justifyContent="center">
          <Grid item xs={12} md={8}>
            <Card sx={{ p: 4 }}>
              <MKTypography variant="h5" mb={2}>
                Autobot 서버 설정
              </MKTypography>
              <MKTypography variant="body2" color="text" mb={3}>
                개인 자동매매 서버의 IP 주소와 포트를 설정하세요.
              </MKTypography>

              {connectionStatus === "failed" && (
                <Alert severity="error" sx={{ mb: 3 }}>
                  서버 연결에 실패했습니다. IP 주소와 포트를 확인해주세요.
                </Alert>
              )}

              {connectionStatus === "connected" && (
                <Alert severity="success" sx={{ mb: 3 }}>
                  서버가 정상적으로 연결되었습니다.
                </Alert>
              )}

              <Grid container spacing={3}>
                <Grid item xs={12} md={8}>
                  <TextField
                    fullWidth
                    label="서버 IP 주소"
                    placeholder="예: 192.168.1.100"
                    value={serverInfo.ip}
                    onChange={(e) =>
                      setServerInfo({ ...serverInfo, ip: e.target.value })
                    }
                    variant="outlined"
                    helperText="autobot 서버가 실행 중인 컴퓨터의 IP 주소"
                  />
                </Grid>
                <Grid item xs={12} md={4}>
                  <TextField
                    fullWidth
                    label="포트"
                    value={serverInfo.port}
                    onChange={(e) =>
                      setServerInfo({ ...serverInfo, port: e.target.value })
                    }
                    variant="outlined"
                    helperText="기본값: 8080"
                  />
                </Grid>
              </Grid>

              <Divider sx={{ my: 3 }} />

              <MKBox display="flex" alignItems="center" justifyContent="space-between" mb={2}>
                <MKTypography variant="h6">연결 상태</MKTypography>
                {getStatusChip()}
              </MKBox>

              {lastConnectionTime && (
                <MKTypography variant="body2" color="text" mb={3}>
                  마지막 연결: {lastConnectionTime}
                </MKTypography>
              )}

              <MKBox display="flex" gap={2} mt={4}>
                <Button
                  variant="outlined"
                  onClick={testConnection}
                  disabled={loading}
                  sx={{
                    borderColor: "#667eea",
                    color: "#667eea",
                    "&:hover": {
                      borderColor: "#5a6fd8",
                      backgroundColor: "rgba(102, 126, 234, 0.04)",
                    },
                  }}
                >
                  {loading ? (
                    <>
                      <CircularProgress size={16} sx={{ mr: 1 }} />
                      연결 테스트 중...
                    </>
                  ) : (
                    "연결 테스트"
                  )}
                </Button>
                <Button
                  variant="contained"
                  onClick={saveSettings}
                  disabled={saveLoading}
                  sx={{
                    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                    color: "white",
                    "&:hover": {
                      background: "linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%)",
                    },
                  }}
                >
                  {saveLoading ? (
                    <>
                      <CircularProgress size={16} sx={{ mr: 1, color: "white" }} />
                      저장 중...
                    </>
                  ) : (
                    "설정 저장"
                  )}
                </Button>
              </MKBox>
            </Card>
          </Grid>
        </Grid>
      </Container>
    </MKBox>
  );
}

export default ServerSettings;