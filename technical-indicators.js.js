// Biblioteca de indicadores técnicos para análise de mercado
const technicalIndicators = {
    // RSI - Relative Strength Index
    calculateRSI(prices, period = 14) {
        if (prices.length < period + 1) {
            return [];
        }
        
        const rsiValues = [];
        let gains = 0;
        let losses = 0;
        
        // Calcular ganhos e perdas iniciais
        for (let i = 1; i <= period; i++) {
            const change = prices[i] - prices[i - 1];
            if (change >= 0) {
                gains += change;
            } else {
                losses -= change;
            }
        }
        
        // Calcular RS e RSI iniciais
        let avgGain = gains / period;
        let avgLoss = losses / period;
        let rs = avgLoss > 0 ? avgGain / avgLoss : 100;
        let rsi = 100 - (100 / (1 + rs));
        rsiValues.push(rsi);
        
        // Calcular RSI para os períodos restantes
        for (let i = period + 1; i < prices.length; i++) {
            const change = prices[i] - prices[i - 1];
            let currentGain = 0;
            let currentLoss = 0;
            
            if (change >= 0) {
                currentGain = change;
            } else {
                currentLoss = -change;
            }
            
            // Usar média móvel exponencial para suavizar
            avgGain = ((avgGain * (period - 1)) + currentGain) / period;
            avgLoss = ((avgLoss * (period - 1)) + currentLoss) / period;
            
            rs = avgLoss > 0 ? avgGain / avgLoss : 100;
            rsi = 100 - (100 / (1 + rs));
            rsiValues.push(rsi);
        }
        
        return rsiValues;
    },
    
    // Médias Móveis - SMA (Simple Moving Average)
    calculateSMA(prices, period = 20) {
        if (prices.length < period) {
            return [];
        }
        
        const smaValues = [];
        
        for (let i = period - 1; i < prices.length; i++) {
            let sum = 0;
            for (let j = 0; j < period; j++) {
                sum += prices[i - j];
            }
            smaValues.push(sum / period);
        }
        
        return smaValues;
    },
    
    // Médias Móveis - EMA (Exponential Moving Average)
    calculateEMA(prices, period = 20) {
        if (prices.length < period) {
            return [];
        }
        
        const emaValues = [];
        const multiplier = 2 / (period + 1);
        
        // Calcular SMA inicial
        let sum = 0;
        for (let i = 0; i < period; i++) {
            sum += prices[i];
        }
        let ema = sum / period;
        emaValues.push(ema);
        
        // Calcular EMA para os períodos restantes
        for (let i = period; i < prices.length; i++) {
            ema = (prices[i] - ema) * multiplier + ema;
            emaValues.push(ema);
        }
        
        return emaValues;
    },
    
    // Bandas de Bollinger
    calculateBollingerBands(prices, period = 20, deviation = 2) {
        if (prices.length < period) {
            return {
                upper: [],
                middle: [],
                lower: []
            };
        }
        
        const upper = [];
        const middle = [];
        const lower = [];
        
        for (let i = period - 1; i < prices.length; i++) {
            let sum = 0;
            for (let j = 0; j < period; j++) {
                sum += prices[i - j];
            }
            const sma = sum / period;
            
            let sumSquaredDeviations = 0;
            for (let j = 0; j < period; j++) {
                sumSquaredDeviations += Math.pow(prices[i - j] - sma, 2);
            }
            const standardDeviation = Math.sqrt(sumSquaredDeviations / period);
            
            middle.push(sma);
            upper.push(sma + (standardDeviation * deviation));
            lower.push(sma - (standardDeviation * deviation));
        }
        
        return {
            upper,
            middle,
            lower
        };
    },
    
    // MACD (Moving Average Convergence Divergence)
    calculateMACD(prices, fastPeriod = 12, slowPeriod = 26, signalPeriod = 9) {
        if (prices.length < slowPeriod + signalPeriod) {
            return {
                macd: [],
                signal: [],
                histogram: []
            };
        }
        
        // Calcular EMA rápida e lenta
        const fastEMA = this.calculateEMA(prices, fastPeriod);
        const slowEMA = this.calculateEMA(prices, slowPeriod);
        
        // Ajustar arrays para o mesmo comprimento
        const macdLine = [];
        for (let i = 0; i < slowEMA.length; i++) {
            const fastIndex = i + (fastEMA.length - slowEMA.length);
            if (fastIndex >= 0) {
                macdLine.push(fastEMA[fastIndex] - slowEMA[i]);
            }
        }
        
        // Calcular linha de sinal (EMA do MACD)
        const signalLine = this.calculateEMA(macdLine, signalPeriod);
        
        // Calcular histograma (MACD - Sinal)
        const histogram = [];
        for (let i = 0; i < signalLine.length; i++) {
            const macdIndex = i + (macdLine.length - signalLine.length);
            histogram.push(macdLine[macdIndex] - signalLine[i]);
        }
        
        return {
            macd: macdLine,
            signal: signalLine,
            histogram: histogram
        };
    },
    
    // Estocástico
    calculateStochastic(highPrices, lowPrices, closePrices, period = 14, smoothK = 3, smoothD = 3) {
        if (closePrices.length < period) {
            return {
                k: [],
                d: []
            };
        }
        
        const rawK = [];
        
        // Calcular %K bruto
        for (let i = period - 1; i < closePrices.length; i++) {
            let highestHigh = -Infinity;
            let lowestLow = Infinity;
            
            for (let j = 0; j < period; j++) {
                highestHigh = Math.max(highestHigh, highPrices[i - j]);
                lowestLow = Math.min(lowestLow, lowPrices[i - j]);
            }
            
            const currentClose = closePrices[i];
            const k = ((currentClose - lowestLow) / (highestHigh - lowestLow)) * 100;
            rawK.push(k);
        }
        
        // Suavizar %K
        const k = this.calculateSMA(rawK, smoothK);
        
        // Calcular %D (média móvel de %K)
        const d = this.calculateSMA(k, smoothD);
        
        return {
            k,
            d
        };
    },
    
    // ATR (Average True Range)
    calculateATR(highPrices, lowPrices, closePrices, period = 14) {
        if (closePrices.length < period + 1) {
            return [];
        }
        
        const trueRanges = [];
        
        // Calcular True Range para cada período
        for (let i = 1; i < closePrices.length; i++) {
            const previousClose = closePrices[i - 1];
            const currentHigh = highPrices[i];
            const currentLow = lowPrices[i];
            
            const tr1 = currentHigh - currentLow;
            const tr2 = Math.abs(currentHigh - previousClose);
            const tr3 = Math.abs(currentLow - previousClose);
            
            const trueRange = Math.max(tr1, tr2, tr3);
            trueRanges.push(trueRange);
        }
        
        // Calcular ATR inicial (média simples dos primeiros N períodos)
        let sum = 0;
        for (let i = 0; i < period; i++) {
            sum += trueRanges[i];
        }
        
        const atrValues = [];
        let atr = sum / period;
        atrValues.push(atr);
        
        // Calcular ATR para os períodos restantes (média móvel exponencial)
        for (let i = period; i < trueRanges.length; i++) {
            atr = ((atr * (period - 1)) + trueRanges[i]) / period;
            atrValues.push(atr);
        }
        
        return atrValues;
    },
    
    // Fibonacci Retracement
    calculateFibonacciLevels(highPrice, lowPrice) {
        const range = highPrice - lowPrice;
        
        return {
            level0: highPrice,                    // 0%
            level236: highPrice - range * 0.236,  // 23.6%
            level382: highPrice - range * 0.382,  // 38.2%
            level50: highPrice - range * 0.5,     // 50%
            level618: highPrice - range * 0.618,  // 61.8%
            level786: highPrice - range * 0.786,  // 78.6%
            level100: lowPrice                    // 100%
        };
    },
    
    // Detectar padrões de candles
    detectCandlePatterns(openPrices, highPrices, lowPrices, closePrices) {
        if (openPrices.length < 3 || highPrices.length < 3 || 
            lowPrices.length < 3 || closePrices.length < 3) {
            return [];
        }
        
        const patterns = [];
        const lastIndex = closePrices.length - 1;
        
        // Doji
        if (this.isDoji(openPrices[lastIndex], closePrices[lastIndex], highPrices[lastIndex], lowPrices[lastIndex])) {
            patterns.push({
                name: 'Doji',
                type: 'neutral',
                description: 'Indica indecisão no mercado'
            });
        }
        
        // Martelo (Hammer)
        if (this.isHammer(openPrices[lastIndex], closePrices[lastIndex], highPrices[lastIndex], lowPrices[lastIndex])) {
            patterns.push({
                name: 'Martelo',
                type: 'bullish',
                description: 'Possível reversão de baixa para alta'
            });
        }
        
        // Estrela Cadente (Shooting Star)
        if (this.isShootingStar(openPrices[lastIndex], closePrices[lastIndex], highPrices[lastIndex], lowPrices[lastIndex])) {
            patterns.push({
                name: 'Estrela Cadente',
                type: 'bearish',
                description: 'Possível reversão de alta para baixa'
            });
        }
        
        // Engolfo de Alta (Bullish Engulfing)
        if (this.isBullishEngulfing(openPrices[lastIndex-1], closePrices[lastIndex-1], 
                                   openPrices[lastIndex], closePrices[lastIndex])) {
            patterns.push({
                name: 'Engolfo de Alta',
                type: 'bullish',
                description: 'Forte sinal de reversão de baixa para alta'
            });
        }
        
        // Engolfo de Baixa (Bearish Engulfing)
        if (this.isBearishEngulfing(openPrices[lastIndex-1], closePrices[lastIndex-1], 
                                   openPrices[lastIndex], closePrices[lastIndex])) {
            patterns.push({
                name: 'Engolfo de Baixa',
                type: 'bearish',
                description: 'Forte sinal de reversão de alta para baixa'
            });
        }
        
        return patterns;
    },
    
    // Funções auxiliares para detecção de padrões
    
    // Verificar se é um Doji
    isDoji(open, close, high, low) {
        const bodySize = Math.abs(open - close);
        const totalRange = high - low;
        
        // Um Doji tem corpo muito pequeno em relação ao range total
        return bodySize <= totalRange * 0.05;
    },
    
    // Verificar se é um Martelo (Hammer)
    isHammer(open, close, high, low) {
        const bodySize = Math.abs(open - close);
        const totalRange = high - low;
        const upperShadow = high - Math.max(open, close);
        const lowerShadow = Math.min(open, close) - low;
        
        // Martelo tem sombra inferior longa e sombra superior curta
        return bodySize <= totalRange * 0.3 && 
               upperShadow <= bodySize * 0.5 && 
               lowerShadow >= bodySize * 2;
    },
    
    // Verificar se é uma Estrela Cadente (Shooting Star)
    isShootingStar(open, close, high, low) {
        const bodySize = Math.abs(open - close);
        const totalRange = high - low;
        const upperShadow = high - Math.max(open, close);
        const lowerShadow = Math.min(open, close) - low;
        
        // Estrela Cadente tem sombra superior longa e sombra inferior curta
        return bodySize <= totalRange * 0.3 && 
               upperShadow >= bodySize * 2 && 
               lowerShadow <= bodySize * 0.5;
    },
    
    // Verificar se é um Engolfo de Alta (Bullish Engulfing)
    isBullishEngulfing(prevOpen, prevClose, currOpen, currClose) {
        // Vela anterior de baixa (vermelha) e atual de alta (verde)
        return prevClose < prevOpen && currClose > currOpen && 
               currOpen < prevClose && currClose > prevOpen;
    },
    
    // Verificar se é um Engolfo de Baixa (Bearish Engulfing)
    isBearishEngulfing(prevOpen, prevClose, currOpen, currClose) {
        // Vela anterior de alta (verde) e atual de baixa (vermelha)
        return prevClose > prevOpen && currClose < currOpen && 
               currOpen > prevClose && currClose < prevOpen;
    }
};

// Exportar o módulo
window.technicalIndicators = technicalIndicators;
