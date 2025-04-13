# Upbit 실시간 코인 모니터링 시스템

Upbit 거래소의 모든 코인을 실시간으로 모니터링하고 매수/매도 신호를 히트맵으로 시각화하는 웹 기반 애플리케이션입니다.

## 주요 기능

- 전체 코인 히트맵 시각화 (기본 녹색, 매수신호 붉은색)
- 세계적인 트레이더의 10가지 매매법 기반 신호 생성
- 다양한 시간 프레임 선택 가능 (1분, 3분, 5분, 15분, 30분, 1시간, 4시간, 일봉, 주봉, 월봉)
- 코인 클릭 시 상세 차트 및 기술적 지표 표시
- 실시간 잔액 및 수익률 표시
- API 호출 제한 준수를 위한 최적화

## 기술 스택

- **백엔드**: Node.js, Express, WebSocket
- **프론트엔드**: React, Lightweight-charts
- **데이터 분석**: TechnicalIndicators 라이브러리

## 설치 방법

### 사전 요구사항

- Node.js 14 이상
- npm 또는 yarn
- Upbit API 키 (선택사항, 잔액 확인 시 필요)

### 설치 과정

1. 저장소 클론
   ```bash
   git clone https://github.com/kyi000/upbit-coin-monitor.git
   cd upbit-coin-monitor
   ```

2. 백엔드 설치 및 실행
   ```bash
   cd backend
   npm install
   # Upbit API 키 설정 (선택사항)
   # .env 파일을 생성하고 다음 내용 추가:
   # ACCESS_KEY=your_access_key
   # SECRET_KEY=your_secret_key
   npm start
   ```

3. 프론트엔드 설치 및 실행
   ```bash
   cd ../frontend
   npm install
   npm start
   ```

4. 웹 브라우저에서 `http://localhost:3000` 접속

## Docker를 이용한 설치 (대체 방법)

```bash
# Docker Compose 사용
docker-compose up -d
```

## 사용 방법

1. 웹 인터페이스에서 희망하는 매매 전략을 선택합니다.
2. 분석에 사용할 시간 프레임을 선택합니다.
3. 히트맵에서 빨간색으로 표시된 코인은 매수 신호를, 파란색으로 표시된 코인은 매도 신호를 나타냅니다.
4. 코인을 클릭하면 상세 차트와 기술적 지표를 확인할 수 있습니다.
5. 오른쪽 패널에서 실시간 매수/매도 신호를 확인할 수 있습니다.

## 구현된 트레이딩 전략

1. MACD 크로스오버
2. RSI 오버솔드/오버바웃
3. 이동평균선 골든크로스/데드크로스
4. 볼린저 밴드 반전
5. 이중 이동평균 전략
6. 스토캐스틱 오실레이터

## 라이센스

MIT

## 기여 방법

1. 이 저장소를 포크합니다.
2. 새 기능 브랜치를 만듭니다 (`git checkout -b feature/amazing-feature`)
3. 변경사항을 커밋합니다 (`git commit -m 'Add some amazing feature'`)
4. 브랜치에 푸시합니다 (`git push origin feature/amazing-feature`)
5. Pull Request를 생성합니다.
