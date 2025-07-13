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

function Profile() {
  const [userInfo, setUserInfo] = useState({
    name: "",
    email: "",
    profilePicture: "",
    joinDate: "",
  });

  useEffect(() => {
    // TODO: AuthContext에서 사용자 정보 가져오기
    // 임시 데이터
    setUserInfo({
      name: "홍길동",
      email: "test@example.com",
      profilePicture: "",
      joinDate: "2024-01-01",
    });
  }, []);

  const handleSave = () => {
    // TODO: 프로필 업데이트 API 호출
    console.log("프로필 저장:", userInfo);
    alert("프로필이 저장되었습니다.");
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