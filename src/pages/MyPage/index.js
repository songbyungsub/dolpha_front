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
import Container from "@mui/material/Container";
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";

// Material Kit 2 React components
import MKBox from "components/MKBox";
import MKTypography from "components/MKTypography";

// Material Kit 2 React examples
import DefaultNavbar from "examples/Navbars/DefaultNavbar";
import DefaultFooter from "examples/Footers/DefaultFooter";

// Routes
import routes from "routes";
import footerRoutes from "footer.routes";

// MyPage sections
import ServerSettings from "./sections/ServerSettings";
import Profile from "./sections/Profile";

import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";

function MyPage() {
  const [activeTab, setActiveTab] = useState(0);
  const location = useLocation();

  // 다른 페이지에서 특정 탭으로 이동한 경우 처리
  useEffect(() => {
    if (location.state && typeof location.state.activeTab === 'number') {
      setActiveTab(location.state.activeTab);
    }
  }, [location.state]);

  const handleTabChange = (_, newValue) => {
    setActiveTab(newValue);
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 0:
        return <Profile />;
      case 1:
        return <ServerSettings />;
      default:
        return <Profile />;
    }
  };

  return (
    <>
      <DefaultNavbar
        routes={routes}
        action={{
          type: "external",
          route: "https://www.creative-tim.com/product/material-kit-react",
          label: "free download",
          color: "info",
        }}
        sticky
      />
      <MKBox
        minHeight="75vh"
        width="100%"
        sx={{
          backgroundImage: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          backgroundSize: "cover",
          backgroundPosition: "top",
          display: "grid",
          placeItems: "center",
        }}
      >
        <Container>
          <Grid container item xs={12} lg={7} justifyContent="center" mx="auto">
            <MKTypography
              variant="h1"
              color="white"
              mt={-6}
              mb={1}
              sx={({ breakpoints, typography: { size } }) => ({
                [breakpoints.down("md")]: {
                  fontSize: size["3xl"],
                },
              })}
            >
              마이페이지
            </MKTypography>
            <MKTypography
              variant="body1"
              color="white"
              textAlign="center"
              px={{ xs: 6, lg: 12 }}
              mt={1}
            >
              자동매매 서버 설정 및 개인정보를 관리하세요
            </MKTypography>
          </Grid>
        </Container>
      </MKBox>
      <Card
        sx={{
          p: 2,
          mx: { xs: 2, lg: 3 },
          mt: -8,
          mb: 4,
          backgroundColor: ({ palette: { white }, functions: { rgba } }) => rgba(white.main, 0.8),
          backdropFilter: "saturate(200%) blur(30px)",
          boxShadow: ({ boxShadows: { xxl } }) => xxl,
        }}
      >
        <MKBox component="section" py={6}>
          <Container>
            <Grid container spacing={3} justifyContent="center">
              <Grid item xs={12}>
                <MKBox mb={3}>
                  <Tabs
                    value={activeTab}
                    onChange={handleTabChange}
                    centered
                    sx={{
                      "& .MuiTabs-indicator": {
                        backgroundColor: "#667eea",
                      },
                      "& .MuiTab-root": {
                        color: "#666",
                        fontWeight: 500,
                        "&.Mui-selected": {
                          color: "#667eea",
                          fontWeight: 600,
                        },
                      },
                    }}
                  >
                    <Tab label="프로필" />
                    <Tab label="서버 설정" />
                  </Tabs>
                </MKBox>
                <MKBox>{renderTabContent()}</MKBox>
              </Grid>
            </Grid>
          </Container>
        </MKBox>
      </Card>
      <MKBox pt={6} px={1} mt={6}>
        <DefaultFooter content={footerRoutes} />
      </MKBox>
    </>
  );
}

export default MyPage;