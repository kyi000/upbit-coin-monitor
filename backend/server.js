// server.js
const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const cors = require('cors');
const { getMarkets, getCandles, getOrderbook } = require('./upbitApi');
const { analyzeTradingSignals } = require('./tradingStrategies');
const { setupWebsocket } = require('./websocketHandler');
require('dotenv').config();

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

// 미들웨어 설정
app.use(cors());
app.use(express.json());

// 클라이언트 연결 관리
const clients = new Set();

// WebSocket 연결 설정
wss.on('connection', (ws) => {
  clients.add(ws);
  console.log('새 클라이언트가 연결되었습니다.');

  ws.on('message', (message) => {
    const data = JSON.parse(message);
    console.log('받은 메시지:', data);
    
    // 클라이언트 요청 처리 (전략 변경, 시간프레임 변경 등)
    if (data.type === 'changeStrategy') {
      // 전략 변경 로직
      activeStrategy = data.strategy;
      console.log(`전략 변경: ${activeStrategy}`);
    } else if (data.type === 'changeTimeframe') {
      // 시간프레임 변경 로직
      activeTimeframe = data.timeframe;
      console.log(`시간프레임 변경: ${activeTimeframe}`);
    }
  });

  ws.on('close', () => {
    clients.delete(ws);
    console.log('클라이언트 연결이 종료되었습니다.');
  });

  // 초기 마켓 정보 전송
  getMarkets().then(markets => {
    ws.send(JSON.stringify({
      type: 'markets',
      data: markets
    }));
  });
});

// Upbit API 관련 엔드포인트
app.get('/api/markets', async (req, res) => {
  try {
    const markets = await getMarkets();
    res.json(markets);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/candles/:market/:timeframe', async (req, res) => {
  try {
    const { market, timeframe } = req.params;
    const candles = await getCandles(market, timeframe);
    res.json(candles);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 실시간 데이터 업데이트 및 신호 분석
const updateInterval = 5000; // 5초마다 업데이트 (API 제한 준수)
let activeTimeframe = '5'; // 기본 5분봉
let activeStrategy = 'macd'; // 기본 전략

// 실시간 데이터 업데이트 함수
async function updateData() {
  try {
    const markets = await getMarkets();
    
    // 모든 마켓에 대한 캔들 데이터 가져오기 (API 호출 제한 준수)
    for (let i = 0; i < markets.length; i += 10) { // 한 번에 10개씩 처리
      const batch = markets.slice(i, i + 10);
      const batchPromises = batch.map(market => 
        getCandles(market.market, activeTimeframe)
          .then(candles => {
            // 트레이딩 신호 분석
            const signals = analyzeTradingSignals(candles, activeStrategy);
            return { market: market.market, signals };
          })
          .catch(err => {
            console.error(`${market.market} 데이터 가져오기 실패:`, err);
            return { market: market.market, signals: { error: true } };
          })
      );
      
      const batchResults = await Promise.all(batchPromises);
      
      // 모든 클라이언트에 신호 브로드캐스트
      const signalMessage = JSON.stringify({
        type: 'signals',
        data: batchResults
      });
      
      clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(signalMessage);
        }
      });
      
      // API 제한 준수를 위한 지연
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  } catch (error) {
    console.error('데이터 업데이트 중 오류:', error);
  }
  
  // 다음 업데이트 예약
  setTimeout(updateData, updateInterval);
}

// 웹소켓 설정 및 데이터 스트림 시작
setupWebsocket();
updateData();

// 서버 시작
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`서버가 포트 ${PORT}에서 실행 중입니다.`);
});