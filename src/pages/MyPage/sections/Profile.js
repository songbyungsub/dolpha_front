/*
=========================================================
* Material Kit 2 React - MyPage Profile Section
=========================================================
*/

// @mui material components
import Container from "@mui/material/Container";
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import Avatar from "@mui/material/Avatar";
import Divider from "@mui/material/Divider";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";

// Material Kit 2 React components
import MKBox from "components/MKBox";
import MKTypography from "components/MKTypography";

import { useState, useEffect } from "react";
import { useAuth } from "contexts/AuthContext";

function Profile() {
  const [userInfo, setUserInfo] = useState({
    name: "",
    email: "",
    profilePicture: "",
    joinDate: "",
  });
  const { user, authenticatedFetch } = useAuth();

  useEffect(() => {
    const loadUserProfile = async () => {
      try {
        const baseUrl = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8000';
        const response = await authenticatedFetch(`${baseUrl}/api/mypage/profile`);
        
        if (!response.ok) {
          throw new Error(`API 요청 실패: ${response.status}`);
        }
        
        const data = await response.json();
        const userData = data.user;
        
        setUserInfo({
          name: `${userData.first_name || ''} ${userData.last_name || ''}`.trim() || userData.username,
          email: userData.email,
          profilePicture: userData.profile_picture || '',
          joinDate: userData.date_joined ? new Date(userData.date_joined).toLocaleDateString('ko-KR') : '',
        });
      } catch (error) {
        // 에러 시 AuthContext의 사용자 정보 사용
        if (user) {
          setUserInfo({
            name: `${user.first_name || ''} ${user.last_name || ''}`.trim() || user.username,
            email: user.email,
            profilePicture: user.profile_picture || '',
            joinDate: user.date_joined ? new Date(user.date_joined).toLocaleDateString('ko-KR') : '',
          });
        }
      }
    };
    
    if (user) {
      loadUserProfile();
    }
  }, [user, authenticatedFetch]);

  const handleSave = async () => {
    try {
      // 현재 Google 로그인 프로필은 읽기 전용이므로 업데이트를 지원하지 않음
      alert('Google 로그인 사용자의 프로필 정보는 Google 계정에서 관리됩니다.');
    } catch (error) {
      alert('프로필 업데이트에 실패했습니다.');
    }
  };

  return (
    <MKBox component="section" py={2}>
      <Container>
        <Grid container spacing={3} justifyContent="center">
          <Grid item xs={12} md={8}>
            <Card sx={{ p: 4 }}>
              <MKBox display="flex" alignItems="center" mb={3}>
                <Avatar
                  src={userInfo.profilePicture}
                  sx={{ width: 80, height: 80, mr: 3 }}
                >
                  {userInfo.name ? userInfo.name[0] : "U"}
                </Avatar>
                <MKBox>
                  <MKTypography variant="h4" mb={1}>
                    {userInfo.name}
                  </MKTypography>
                  <MKTypography variant="body2" color="text" mb={0.5}>
                    {userInfo.email}
                  </MKTypography>
                  <MKTypography variant="caption" color="text">
                    가입일: {userInfo.joinDate}
                  </MKTypography>
                </MKBox>
              </MKBox>

              <Divider sx={{ my: 3 }} />

              <MKTypography variant="h6" mb={2}>
                기본 정보
              </MKTypography>

              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="이름"
                    value={userInfo.name}
                    onChange={(e) =>
                      setUserInfo({ ...userInfo, name: e.target.value })
                    }
                    variant="outlined"
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="이메일"
                    value={userInfo.email}
                    onChange={(e) =>
                      setUserInfo({ ...userInfo, email: e.target.value })
                    }
                    variant="outlined"
                    disabled
                  />
                </Grid>
              </Grid>

              <MKBox mt={4} display="flex" justifyContent="flex-end">
                <Button
                  variant="contained"
                  onClick={handleSave}
                  sx={{
                    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                    color: "white",
                    "&:hover": {
                      background: "linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%)",
                    },
                  }}
                >
                  저장하기
                </Button>
              </MKBox>
            </Card>
          </Grid>
        </Grid>
      </Container>
    </MKBox>
  );
}

export default Profile;