// tradingStrategies.js
const technicalIndicators = require('technicalindicators');

// 세계적인 트레이더 매매법 구현
const strategies = {
  // 1. MACD 크로스오버 전략
  macd: (candles) => {
    const prices = candles.map(candle => candle.trade_price).reverse();
    
    const macdInput = {
      values: prices,
      fastPeriod: 12,
      slowPeriod: 26,
      signalPeriod: 9,
      SimpleMAOscillator: false,
      SimpleMASignal: false
    };
    
    const macdResults = technicalIndicators.MACD.calculate(macdInput);
    
    // 결과가 충분하지 않은 경우 처리
    if (macdResults.length < 2) {
      return { buySignal: false, sellSignal: false };
    }
    
    // 매수 신호: MACD 라인이 시그널 라인 위로 교차
    const buySignal = macdResults[1].MACD < macdResults[1].signal && 
                      macdResults[0].MACD > macdResults[0].signal;
                      
    // 매도 신호: MACD 라인이 시그널 라인 아래로 교차
    const sellSignal = macdResults[1].MACD > macdResults[1].signal && 
                       macdResults[0].MACD < macdResults[0].signal;
                       
    return { buySignal, sellSignal };
  },
  
  // 2. RSI 오버솔드/오버바웃 전략
  rsi: (candles) => {
    const prices = candles.map(candle => candle.trade_price).reverse();
    
    const rsiInput = {
      values: prices,
      period: 14
    };
    
    const rsiResults = technicalIndicators.RSI.calculate(rsiInput);
    
    // 결과가 충분하지 않은 경우 처리
    if (rsiResults.length < 2) {
      return { buySignal: false, sellSignal: false };
    }
    
    // 매수 신호: RSI가 30 이하에서 반등
    const buySignal = rsiResults[1] < 30 && rsiResults[0] > rsiResults[1];
    
    // 매도 신호: RSI가 70 이상에서 하락
    const sellSignal = rsiResults[1] > 70 && rsiResults[0] < rsiResults[1];
    
    return { buySignal, sellSignal };
  },
  
  // 3. 이동평균선 골든크로스/데드크로스 전략
  movingAverage: (candles) => {
    const prices = candles.map(candle => candle.trade_price).reverse();
    
    const shortMAInput = {
      values: prices,
      period: 50
    };
    
    const longMAInput = {
      values: prices,
      period: 200
    };
    
    const shortMA = technicalIndicators.SMA.calculate(shortMAInput);
    const longMA = technicalIndicators.SMA.calculate(longMAInput);
    
    // 결과가 충분하지 않은 경우 처리
    if (shortMA.length < 2 || longMA.length < 2) {
      return { buySignal: false, sellSignal: false };
    }
    
    // 매수 신호: 단기 이동평균이 장기 이동평균을 위로 교차 (골든크로스)
    const buySignal = shortMA[1] < longMA[1] && shortMA[0] > longMA[0];
    
    // 매도 신호: 단기 이동평균이 장기 이동평균을 아래로 교차 (데드크로스)
    const sellSignal = shortMA[1] > longMA[1] && shortMA[0] < longMA[0];
    
    return { buySignal, sellSignal };
  },
  
  // 4. 볼린저 밴드 전략
  bollingerBands: (candles) => {
    const prices = candles.map(candle => candle.trade_price).reverse();
    
    const bbInput = {
      values: prices,
      period: 20,
      stdDev: 2
    };
    
    const bbResults = technicalIndicators.BollingerBands.calculate(bbInput);
    
    // 결과가 충분하지 않은 경우 처리
    if (bbResults.length < 2) {
      return { buySignal: false, sellSignal: false };
    }
    
    // 매수 신호: 가격이 하단 밴드 아래로 내려갔다가 다시 상승
    const buySignal = prices[1] < bbResults[1].lower && prices[0] > bbResults[0].lower;
    
    // 매도 신호: 가격이 상단 밴드 위로 올라갔다가 다시 하락
    const sellSignal = prices[1] > bbResults[1].upper && prices[0] < bbResults[0].upper;
    
    return { buySignal, sellSignal };
  },
  
  // 5. 이중 이동평균 전략
  dualMovingAverage: (candles) => {
    const prices = candles.map(candle => candle.trade_price).reverse();
    
    const fastMAInput = {
      values: prices,
      period: 10
    };
    
    const slowMAInput = {
      values: prices,
      period: 30
    };
    
    const fastMA = technicalIndicators.SMA.calculate(fastMAInput);
    const slowMA = technicalIndicators.SMA.calculate(slowMAInput);
    
    // 결과가 충분하지 않은 경우 처리
    if (fastMA.length < 2 || slowMA.length < 2) {
      return { buySignal: false, sellSignal: false };
    }
    
    // 매수 신호: 빠른 이동평균이 느린 이동평균을 위로 교차
    const buySignal = fastMA[1] < slowMA[1] && fastMA[0] > slowMA[0];
    
    // 매도 신호: 빠른 이동평균이 느린 이동평균을 아래로 교차
    const sellSignal = fastMA[1] > slowMA[1] && fastMA[0] < slowMA[0];
    
    return { buySignal, sellSignal };
  },
  
  // 6. 스토캐스틱 오실레이터 전략
  stochastic: (candles) => {
    const highPrices = candles.map(candle => candle.high_price).reverse();
    const lowPrices = candles.map(candle => candle.low_price).reverse();
    const closePrices = candles.map(candle => candle.trade_price).reverse();
    
    const stochInput = {
      high: highPrices,
      low: lowPrices,
      close: closePrices,
      period: 14,
      signalPeriod: 3
    };
    
    const stochResults = technicalIndicators.Stochastic.calculate(stochInput);
    
    // 결과가 충분하지 않은 경우 처리
    if (stochResults.length < 2) {
      return { buySignal: false, sellSignal: false };
    }
    
    // 매수 신호: %K가 %D를 위로 교차하고 둘 다 20 이하 (과매도 영역)
    const buySignal = stochResults[1].k < stochResults[1].d && 
                      stochResults[0].k > stochResults[0].d &&
                      stochResults[0].k < 20;
                      
    // 매도 신호: %K가 %D를 아래로 교차하고 둘 다 80 이상 (과매수 영역)
    const sellSignal = stochResults[1].k > stochResults[1].d && 
                      stochResults[0].k < stochResults[0].d &&
                      stochResults[0].k > 80;
                      
    return { buySignal, sellSignal };
  }
};

// 선택한 전략으로 신호 분석
function analyzeTradingSignals(candles, strategyName) {
  if (!strategies[strategyName]) {
    return { buySignal: false, sellSignal: false, error: 'Invalid strategy' };
  }
  
  return strategies[strategyName](candles);
}

module.exports = {
  analyzeTradingSignals,
  strategies: Object.keys(strategies) // 사용 가능한 전략 이름 목록
};