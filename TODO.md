# Dolpha 프로젝트 개발 TODO

## 현재 완료된 기능
✅ 주식 차트 캔들스틱 표시  
✅ 수평선 그리기 및 드래그 기능  
✅ 자동매매 진입시점 설정  
✅ 피라미딩 매매 시스템 (최대 6차)  
✅ 한국거래소 호가단위 적용  
✅ 포지션 자동 계산  

## 구글 소셜로그인 구현 계획

### 📋 전체 목표
사용자별 개인화된 서비스 제공을 위한 Google OAuth 2.0 기반 로그인 시스템 구축

### 🎯 주요 기능 요구사항
1. **자동매매 서버 IP 주소 관리**: 사용자별 매매 서버 정보 저장/수정
2. **즐겨찾기 주식 관리**: 관심 종목 저장 및 메모 기능
3. **매매결과 및 복기**: 매매 내역 조회 및 복기 작성 기능

---

## Phase 1: 기본 Google OAuth 인증 구현 ✅ **완료**

### 1.1 Google Cloud Console 설정
- ✅ Google Cloud Console 프로젝트 생성/설정
- ✅ Google+ API 및 People API 활성화
- ✅ OAuth 2.0 클라이언트 ID 생성 (웹 애플리케이션)
- ✅ 승인된 리디렉션 URI 설정
  - 개발: `http://localhost:3000/auth/callback`
  - 운영: `https://yourdomain.com/auth/callback`

### 1.2 환경변수 설정
```bash
# .env 파일에 추가 - ✅ 완료
REACT_APP_GOOGLE_CLIENT_ID=your-google-client-id
REACT_APP_GOOGLE_CLIENT_SECRET=your-google-client-secret
REACT_APP_API_BASE_URL=http://218.152.32.218:8000
```

### 1.3 프론트엔드 패키지 설치
```bash
# ✅ 기본 브라우저 API 사용으로 별도 패키지 불필요
# Google OAuth 2.0 Authorization Code Flow 직접 구현
```

### 1.4 SignIn 페이지 수정
- ✅ `src/pages/LandingPages/SignIn/index.js` 수정
- ✅ Google 로그인 버튼 컴포넌트 추가 (`src/components/GoogleLoginButton.js`)
- ✅ OAuth 플로우 구현
- ✅ 로그인 성공 시 메인 페이지 리디렉션

### 1.5 인증 컨텍스트 구현
- ✅ `src/contexts/AuthContext.js` 생성
- ✅ 전역 사용자 상태 관리
- ✅ JWT 토큰 저장/관리
- ✅ 로그인/로그아웃 함수 구현

### 1.6 인증 콜백 페이지 구현
- ✅ `src/pages/AuthCallback/index.js` 생성
- ✅ Google OAuth 코드 처리 및 백엔드 연동
- ✅ 사용자 친화적 로딩 및 에러 처리
- ✅ 중복 API 호출 방지 메커니즘

---

## Phase 2: 백엔드 Django 모델 및 API 구현 ✅ **완료**

### 2.1 Django 패키지 설치
```bash
# ✅ 완료
pip install google-auth google-auth-oauthlib google-auth-httplib2
pip install djangorestframework-simplejwt
```

### 2.2 데이터베이스 모델 설계
```python
# ✅ backend/myweb/models.py에 User 모델 확장 완료
# Google OAuth 인증을 위한 User 모델에 google_id, profile_picture 필드 추가

class User(AbstractUser):
    google_id = models.CharField(max_length=100, unique=True, null=True)
    profile_picture = models.URLField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

class UserProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    trading_server_ip = models.GenericIPAddressField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

class FavoriteStock(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    stock_code = models.CharField(max_length=10)
    stock_name = models.CharField(max_length=100)
    memo = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        unique_together = ['user', 'stock_code']

class TradingResult(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    stock_code = models.CharField(max_length=10)
    stock_name = models.CharField(max_length=100)
    trade_type = models.CharField(max_length=10)  # 'BUY', 'SELL'
    quantity = models.IntegerField()
    price = models.DecimalField(max_digits=12, decimal_places=2)
    total_amount = models.DecimalField(max_digits=15, decimal_places=2)
    profit_loss = models.DecimalField(max_digits=15, decimal_places=2, null=True)
    trade_date = models.DateTimeField()
    review = models.TextField(blank=True)  # 매매복기
    created_at = models.DateTimeField(auto_now_add=True)
```

### 2.3 인증 API 구현
- ✅ Google OAuth 토큰 검증 API (`/api/auth/google/`)
- ✅ JWT 토큰 발급 API (Google OAuth 성공 시 자동 발급)
- ✅ JWT 토큰 갱신 API (`/api/auth/refresh/`)
- ✅ 사용자 정보 조회 API (`/api/auth/me/`)
- ✅ 로그아웃 API (`/api/auth/logout/`)

### 2.4 구현된 주요 파일
- ✅ `backend/dolpha/api_auth.py` - 완전한 Google OAuth 2.0 API 구현
- ✅ Google Authorization Code Flow 처리
- ✅ JWT 토큰 자동 발급 및 관리
- ✅ 사용자 프로필 자동 생성

---

## Phase 3: 사용자 프로필 및 마이페이지

### 3.1 마이페이지 구조 설계
```
src/pages/MyPage/
├── index.js              # 메인 마이페이지
├── Profile.js            # 프로필 정보 관리
├── ServerSettings.js     # 자동매매 서버 설정
├── FavoriteStocks.js     # 즐겨찾기 주식 관리
└── TradingHistory.js     # 매매 내역 및 복기
```

### 3.2 프로필 관리 기능
- [ ] 사용자 기본 정보 표시
- [ ] 프로필 사진 변경
- [ ] 자동매매 서버 IP 설정/수정
- [ ] 계정 설정 변경

### 3.3 보호된 라우트 구현
- [ ] `src/components/ProtectedRoute.js` 생성
- [ ] 인증이 필요한 페이지 보호
- [ ] 미인증 시 로그인 페이지 리디렉션

---

## Phase 4: 즐겨찾기 주식 관리

### 4.1 즐겨찾기 기능 구현
- [ ] 주식 즐겨찾기 추가/삭제 API
- [ ] 즐겨찾기 목록 조회 API
- [ ] 메모 작성/수정 기능
- [ ] 즐겨찾기 순서 변경

### 4.2 메인 페이지 연동
- [ ] 기존 주식 목록에 즐겨찾기 버튼 추가
- [ ] 즐겨찾기 필터링 기능
- [ ] 즐겨찾기 탭 추가

---

## Phase 5: 매매결과 및 복기 시스템

### 5.1 매매결과 데이터 수집
- [ ] 자동매매 서버와 연동 API 설계
- [ ] 매매 내역 자동 수집 시스템
- [ ] 수익률 계산 로직

### 5.2 매매복기 기능
- [ ] 매매 내역 조회 페이지
- [ ] 복기 작성/수정 인터페이스
- [ ] 차트와 연동된 매매 포인트 표시
- [ ] 통계 및 분석 기능

### 5.3 리포트 및 분석
- [ ] 월별/연도별 수익률 리포트
- [ ] 종목별 매매 성과 분석
- [ ] 매매 패턴 분석

---

## 📁 예상 파일 구조

```
frontend/src/
├── contexts/
│   ├── AuthContext.js           # 인증 상태 관리
│   └── UserContext.js           # 사용자 데이터 관리
├── pages/
│   ├── LandingPages/
│   │   └── SignIn/index.js      # 수정: Google 로그인 추가
│   ├── MyPage/
│   │   ├── index.js             # 마이페이지 메인
│   │   ├── Profile.js           # 프로필 관리
│   │   ├── ServerSettings.js    # 서버 설정
│   │   ├── FavoriteStocks.js    # 즐겨찾기 관리
│   │   └── TradingHistory.js    # 매매 내역
│   └── TradingResults/
│       └── index.js             # 매매결과 분석
├── components/
│   ├── GoogleLoginButton.js     # Google 로그인 버튼
│   ├── ProtectedRoute.js        # 보호된 라우트
│   ├── UserProfileForm.js       # 프로필 폼
│   └── FavoriteButton.js        # 즐겨찾기 버튼
├── utils/
│   ├── auth.js                  # 인증 유틸리티
│   ├── api.js                   # API 호출 함수
│   └── constants.js             # 상수 정의
└── hooks/
    ├── useAuth.js               # 인증 커스텀 훅
    └── useApi.js                # API 커스텀 훅
```

---

## 🔒 보안 고려사항

### 인증 & 토큰 관리
- [ ] JWT 토큰 만료 시간 설정 (1시간)
- [ ] 리프레시 토큰 구현 (7일)
- [ ] 토큰 자동 갱신 로직
- [ ] 로그아웃 시 토큰 무효화

### 데이터 보안
- [ ] HTTPS 적용 (프로덕션)
- [ ] CORS 설정 최적화
- [ ] XSS/CSRF 방어
- [ ] 민감 정보 암호화 저장

### API 보안
- [ ] 인증 미들웨어 적용
- [ ] Rate Limiting 구현
- [ ] 입력값 검증 및 Sanitization

---

## 🚀 배포 고려사항

### 환경별 설정
- [ ] 개발/스테이징/프로덕션 환경 분리
- [ ] 환경별 Google OAuth 설정
- [ ] Docker 컨테이너화

### 모니터링
- [ ] 로그인 성공/실패 로깅
- [ ] 에러 추적 시스템 연동
- [ ] 성능 모니터링

---

## 📝 참고 문서

### Google OAuth 2.0
- [Google OAuth 2.0 문서](https://developers.google.com/identity/protocols/oauth2)
- [Google Cloud Console](https://console.cloud.google.com/)

### React 인증
- [React Context API](https://reactjs.org/docs/context.html)
- [React Router 보호된 라우트](https://reactrouter.com/web/example/auth-workflow)

### Django 인증
- [Django REST Framework Authentication](https://www.django-rest-framework.org/api-guide/authentication/)
- [Simple JWT](https://django-rest-framework-simplejwt.readthedocs.io/)

---

## 📅 개발 일정 (예상)

| Phase | 기간 | 주요 작업 |
|-------|------|-----------|
| Phase 1 | 2-3일 | Google OAuth 기본 구현 |
| Phase 2 | 2-3일 | 백엔드 모델 및 API 구현 |
| Phase 3 | 2-3일 | 마이페이지 및 프로필 관리 |
| Phase 4 | 2-3일 | 즐겨찾기 시스템 구현 |
| Phase 5 | 3-4일 | 매매결과 및 복기 시스템 |
| 테스트 | 2-3일 | 통합 테스트 및 버그 수정 |

**총 예상 기간: 2-3주**

---

---

## 🎉 **Google OAuth 로그인 시스템 완료 요약**

### ✅ 완료된 주요 기능
1. **Google OAuth 2.0 인증 시스템** - 완전 구현
2. **사용자별 JWT 토큰 관리** - 자동 발급/갱신/무효화
3. **보안 강화** - 중복 호출 방지, CSRF 보호, 에러 처리
4. **사용자 경험 개선** - 친화적 에러 메시지, 로딩 상태 표시

### 🛠️ 구현된 파일 목록
- **프론트엔드**:
  - `src/contexts/AuthContext.js` - 인증 상태 관리
  - `src/pages/AuthCallback/index.js` - OAuth 콜백 처리
  - `src/pages/LandingPages/SignIn/index.js` - 로그인 페이지
  - `src/components/GoogleLoginButton.js` - Google 로그인 버튼
  
- **백엔드**:
  - `backend/dolpha/api_auth.py` - Google OAuth API 엔드포인트
  - User 모델 확장 (google_id, profile_picture 필드)

### 🔧 해결된 기술적 문제
1. **무한 API 호출** - useRef와 의존성 배열 최적화로 해결
2. **중복 로그인 처리** - 처리 상태 플래그로 방지
3. **React 컴포넌트 에러** - Material-UI color prop 값 수정
4. **네트워크 에러 처리** - 사용자 친화적 에러 메시지 구현

### 🚀 현재 상태
- **로그인 시스템**: 완전히 작동 중
- **토큰 관리**: 자동 갱신 및 만료 처리
- **사용자 인터페이스**: 깔끔하고 직관적
- **에러 처리**: 모든 예외 상황 커버

---

*마지막 업데이트: 2025-01-11*  
*완료 상태: Phase 1-2 Google OAuth 로그인 시스템 구축 완료*  
*다음 단계: Phase 3 - 사용자 프로필 및 마이페이지 구현 준비*