import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from 'contexts/AuthContext';
import MKBox from 'components/MKBox';
import MKTypography from 'components/MKTypography';

const ProtectedRoute = ({ children }) => {
  const { user, isAuthenticated, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      alert('로그인이 필요한 페이지입니다.');
      navigate('/pages/authentication/sign-in');
    }
  }, [isAuthenticated, loading, navigate]);

  // 로딩 중
  if (loading) {
    return (
      <MKBox
        minHeight="100vh"
        width="100%"
        sx={{
          backgroundImage: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          display: "grid",
          placeItems: "center",
        }}
      >
        <MKTypography variant="h4" color="white">
          로그인 상태 확인 중...
        </MKTypography>
      </MKBox>
    );
  }

  // 인증되지 않음
  if (!isAuthenticated) {
    return (
      <MKBox
        minHeight="100vh"
        width="100%"
        sx={{
          backgroundImage: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          display: "grid",
          placeItems: "center",
        }}
      >
        <MKTypography variant="h4" color="white">
          로그인이 필요합니다. 리다이렉트 중...
        </MKTypography>
      </MKBox>
    );
  }

  // 인증됨 - 실제 컴포넌트 렌더링
  return children;
};

export default ProtectedRoute;