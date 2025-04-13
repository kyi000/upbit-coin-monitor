// upbitApi.js
const axios = require('axios');
const crypto = require('crypto');
const querystring = require('querystring');
const jwt = require('jsonwebtoken');
const WebSocket = require('ws');

// Upbit API 키 설정 (환경 변수로 관리)
const ACCESS_KEY = process.env.ACCESS_KEY || '';
const SECRET_KEY = process.env.SECRET_KEY || '';

// Upbit API 기본 URL
const BASE_URL = 'https://api.upbit.com/v1';

// API 요청에 인증 정보 추가
function signRequest(query) {
  const hash = crypto.createHash('sha512');
  const queryHash = hash.update(query, 'utf-8').digest('hex');
  
  const payload = {
    access_key: ACCESS_KEY,
    nonce: new Date().getTime(),
    query_hash: queryHash,
    query_hash_alg: 'SHA512'
  };
  
  const token = jwt.sign(payload, SECRET_KEY);
  return `Bearer ${token}`;
}

// 모든 마켓 정보 가져오기
async function getMarkets() {
  try {
    const response = await axios.get(`${BASE_URL}/market/all`);
    return response.data.filter(market => market.market.startsWith('KRW-'));
  } catch (error) {
    console.error('마켓 정보 가져오기 실패:', error);
    throw error;
  }
}

// 특정 마켓의 캔들 데이터 가져오기
async function getCandles(market, timeframe) {
  try {
    let url;
    if (timeframe === 'day') {
      url = `${BASE_URL}/candles/days?market=${market}&count=200`;
    } else if (timeframe === 'week') {
      url = `${BASE_URL}/candles/weeks?market=${market}&count=200`;
    } else if (timeframe === 'month') {
      url = `${BASE_URL}/candles/months?market=${market}&count=200`;
    } else {
      url = `${BASE_URL}/candles/minutes/${timeframe}?market=${market}&count=200`;
    }
    
    const response = await axios.get(url);
    return response.data;
  } catch (error) {
    console.error(`${market} 캔들 데이터 가져오기 실패:`, error);
    throw error;
  }
}

// 호가 정보 가져오기
async function getOrderbook(markets) {
  try {
    const marketsParam = markets.join(',');
    const response = await axios.get(`${BASE_URL}/orderbook?markets=${marketsParam}`);
    return response.data;
  } catch (error) {
    console.error('호가 정보 가져오기 실패:', error);
    throw error;
  }
}

// 계정 잔액 정보 가져오기
async function getBalance() {
  try {
    // API 키가 없으면 더미 데이터 반환
    if (!ACCESS_KEY || !SECRET_KEY) {
      return {
        krw: 10000000, // 1천만원
        total: 10500000, // 1천50만원
        profit_rate: 5.0 // 수익률 5%
      };
    }
    
    const url = `${BASE_URL}/accounts`;
    const token = signRequest('');
    
    const response = await axios.get(url, {
      headers: { Authorization: token }
    });
    
    // 응답 데이터 가공
    const accounts = response.data;
    const krwAccount = accounts.find(account => account.currency === 'KRW');
    const krwBalance = krwAccount ? parseFloat(krwAccount.balance) : 0;
    
    // 다른 화폐 자산 계산
    let totalBalance = krwBalance;
    for (const account of accounts) {
      if (account.currency !== 'KRW' && parseFloat(account.balance) > 0) {
        try {
          // 현재 시세 조회
          const ticker = await axios.get(`${BASE_URL}/ticker?markets=KRW-${account.currency}`);
          const price = ticker.data[0].trade_price;
          totalBalance += parseFloat(account.balance) * price;
        } catch (error) {
          console.error(`${account.currency} 시세 조회 실패:`, error);
        }
      }
    }
    
    // 수익률 계산 (예시로 초기 투자 금액을 5천만원으로 가정)
    const initialInvestment = 50000000;
    const profitRate = ((totalBalance - initialInvestment) / initialInvestment) * 100;
    
    return {
      krw: krwBalance,
      total: totalBalance,
      profit_rate: profitRate
    };
  } catch (error) {
    console.error('잔액 정보 가져오기 실패:', error);
    // 오류 시 더미 데이터 반환
    return {
      krw: 10000000,
      total: 10500000,
      profit_rate: 5.0
    };
  }
}

module.exports = {
  getMarkets,
  getCandles,
  getOrderbook,
  getBalance
};