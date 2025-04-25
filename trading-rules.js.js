// Sistema de regras para day trading
const tradingRules = {
    // Configurações padrão
    defaultRules: {
        // Regras de entrada (compra)
        entry: [
            {
                id: 'rsi-oversold',
                name: 'RSI Sobrevendido',
                description: 'Entrar quando RSI cruzar abaixo do nível de sobrevenda',
                indicator: 'rsi',
                condition: 'crosses-below',
                value: 30,
                enabled: true
            },
            {
                id: 'ma-cross-up',
                name: 'Cruzamento MA para cima',
                description: 'Entrar quando média rápida cruzar acima da média lenta',
                indicator: 'ma-cross',
                condition: 'crosses-above',
                value: null,
                enabled: false
            },
            {
                id: 'bb-lower-touch',
                name: 'Toque na Banda Inferior',
                description: 'Entrar quando o preço tocar na banda inferior de Bollinger',
                indicator: 'bollinger',
                condition: 'touches-lower',
                value: null,
                enabled: false
            },
            {
                id: 'macd-cross-up',
                name: 'MACD Cruzamento para cima',
                description: 'Entrar quando a linha MACD cruzar acima da linha de sinal',
                indicator: 'macd',
                condition: 'crosses-above',
                value: null,
                enabled: false
            }
        ],
        
        // Regras de saída (venda)
        exit: [
            {
                id: 'rsi-overbought',
                name: 'RSI Sobrecomprado',
                description: 'Sair quando RSI cruzar acima do nível de sobrecompra',
                indicator: 'rsi',
                condition: 'crosses-above',
                value: 70,
                enabled: true
            },
            {
                id: 'ma-cross-down',
                name: 'Cruzamento MA para baixo',
                description: 'Sair quando média rápida cruzar abaixo da média lenta',
                indicator: 'ma-cross',
                condition: 'crosses-below',
                value: null,
                enabled: false
            },
            {
                id: 'bb-upper-touch',
                name: 'Toque na Banda Superior',
                description: 'Sair quando o preço tocar na banda superior de Bollinger',
                indicator: 'bollinger',
                condition: 'touches-upper',
                value: null,
                enabled: false
            },
            {
                id: 'macd-cross-down',
                name: 'MACD Cruzamento para baixo',
                description: 'Sair quando a linha MACD cruzar abaixo da linha de sinal',
                indicator: 'macd',
                condition: 'crosses-below',
                value: null,
                enabled: false
            }
        ],
        
        // Regras de stop loss
        stopLoss: {
            enabled: true,
            type: 'percent', // 'percent', 'fixed', 'atr'
            value: 2.0, // 2% abaixo do preço de entrada
            atrMultiplier: 2.0 // Se type for 'atr'
        },
        
        // Regras de take profit
        takeProfit: {
            enabled: true,
            type: 'percent', // 'percent', 'fixed', 'risk-reward'
            value: 3.0, // 3% acima do preço de entrada
            riskRewardRatio: 2.0 // Se type for 'risk-reward'
        }
    },
    
    // Estado atual do trading
    state: {
        inPosition: false,
        entryPrice: null,
        entryTime: null,
        stopLossPrice: null,
        takeProfitPrice: null,
        currentSymbol: null,
        positionType: null, // 'long' ou 'short'
        lastSignal: null
    },
    
    // Inicializar o sistema de regras
    initialize(config) {
        this.config = config;
        this.resetState();
    },
    
    // Resetar o estado
    resetState() {
        this.state = {
            inPosition: false,
            entryPrice: null,
            entryTime: null,
            stopLossPrice: null,
            takeProfitPrice: null,
            currentSymbol: null,
            positionType: null,
            lastSignal: null
        };
    },
    
    // Analisar dados de mercado e verificar regras
    analyze(marketData, indicators) {
        if (!marketData || marketData.length < 2) {
            return null;
        }
        
        // Obter candles atual e anterior
        const currentCandle = marketData[marketData.length - 1];
        const previousCandle = marketData[marketData.length - 2];
        
        // Atualizar símbolo atual
        this.state.currentSymbol = this.config.currentSymbol;
        
        // Verificar se já estamos em posição
        if (this.state.inPosition) {
            return this.checkExitRules(currentCandle, previousCandle, indicators);
        } else {
            return this.checkEntryRules(currentCandle, previousCandle, indicators);
        }
    },
    
    // Verificar regras de entrada
    checkEntryRules(currentCandle, previousCandle, indicators) {
        const signals = [];
        
        // Verificar cada regra de entrada ativa
        for (const rule of this.defaultRules.entry) {
            if (!rule.enabled) continue;
            
            let signal = null;
            
            switch (rule.id) {
                case 'rsi-oversold':
                    signal = this.checkRSIOversold(indicators.rsi, rule.value);
                    break;
                case 'ma-cross-up':
                    signal = this.checkMACrossUp(indicators.fastMA, indicators.slowMA);
                    break;
                case 'bb-lower-touch':
                    signal = this.checkBBLowerTouch(currentCandle, indicators.bollinger);
                    break;
                case 'macd-cross-up':
                    signal = this.checkMACDCrossUp(indicators.macd);
                    break;
            }
            
            if (signal) {
                signals.push({
                    type: 'entry',
                    rule: rule.name,
                    price: currentCandle.close,
                    time: currentCandle.timestamp,
                    description: rule.description
                });
            }
        }
        
        // Se tivermos sinais de entrada, entrar em posição
        if (signals.length > 0) {
            this.enterPosition(signals[0], currentCandle);
            return signals[0];
        }
        
        return null;
    },
    
    // Verificar regras de saída
    checkExitRules(currentCandle, previousCandle, indicators) {
        const signals = [];
        
        // Verificar stop loss e take profit
        if (this.state.positionType === 'long') {
            // Stop Loss
            if (this.defaultRules.stopLoss.enabled && 
                currentCandle.low <= this.state.stopLossPrice) {
                signals.push({
                    type: 'exit',
                    rule: 'Stop Loss',
                    price: this.state.stopLossPrice,
                    time: currentCandle.timestamp,
                    description: 'Saída por stop loss'
                });
            }
            
            // Take Profit
            if (this.defaultRules.takeProfit.enabled && 
                currentCandle.high >= this.state.takeProfitPrice) {
                signals.push({
                    type: 'exit',
                    rule: 'Take Profit',
                    price: this.state.takeProfitPrice,
                    time: currentCandle.timestamp,
                    description: 'Saída por take profit'
                });
            }
        }
        
        // Verificar cada regra de saída ativa
        for (const rule of this.defaultRules.exit) {
            if (!rule.enabled) continue;
            
            let signal = null;
            
            switch (rule.id) {
                case 'rsi-overbought':
                    signal = this.checkRSIOverbought(indicators.rsi, rule.value);
                    break;
                case 'ma-cross-down':
                    signal = this.checkMACrossDown(indicators.fastMA, indicators.slowMA);
                    break;
                case 'bb-upper-touch':
                    signal = this.checkBBUpperTouch(currentCandle, indicators.bollinger);
                    break;
                case 'macd-cross-down':
                    signal = this.checkMACDCrossDown(indicators.macd);
                    break;
            }
            
            if (signal) {
                signals.push({
                    type: 'exit',
                    rule: rule.name,
                    price: currentCandle.close,
                    time: currentCandle.timestamp,
                    description: rule.description
                });
            }
        }
        
        // Se tivermos sinais de saída, sair da posição
        if (signals.length > 0) {
            this.exitPosition(signals[0]);
            return signals[0];
        }
        
        return null;
    },
    
    // Entrar em posição
    enterPosition(signal, currentCandle) {
        this.state.inPosition = true;
        this.state.entryPrice = currentCandle.close;
        this.state.entryTime = currentCandle.timestamp;
        this.state.positionType = 'long'; // Por padrão, apenas posições long
        this.state.lastSignal = signal;
        
        // Calcular stop loss
        if (this.defaultRules.stopLoss.enabled) {
            if (this.defaultRules.stopLoss.type === 'percent') {
                const stopPercent = this.defaultRules.stopLoss.value / 100;
                this.state.stopLossPrice = this.state.entryPrice * (1 - stopPercent);
            } else if (this.defaultRules.stopLoss.type === 'fixed') {
                this.state.stopLossPrice = this.state.entryPrice - this.defaultRules.stopLoss.value;
            }
            // ATR stop loss seria calculado com base no indicador ATR
        }
        
        // Calcular take profit
        if (this.defaultRules.takeProfit.enabled) {
            if (this.defaultRules.takeProfit.type === 'percent') {
                const profitPercent = this.defaultRules.takeProfit.value / 100;
                this.state.takeProfitPrice = this.state.entryPrice * (1 + profitPercent);
            } else if (this.defaultRules.takeProfit.type === 'fixed') {
                this.state.takeProfitPrice = this.state.entryPrice + this.defaultRules.takeProfit.value;
            } else if (this.defaultRules.takeProfit.type === 'risk-reward') {
                const stopDistance = this.state.entryPrice - this.state.stopLossPrice;
                this.state.takeProfitPrice = this.state.entryPrice + (stopDistance * this.defaultRules.takeProfit.riskRewardRatio);
            }
        }
        
        return {
            type: 'entry',
            price: this.state.entryPrice,
            time: this.state.entryTime,
            stopLoss: this.state.stopLossPrice,
            takeProfit: this.state.takeProfitPrice
        };
    },
    
    // Sair da posição
    exitPosition(signal) {
        const result = {
            type: 'exit',
            entryPrice: this.state.entryPrice,
            exitPrice: signal.price,
            entryTime: this.state.entryTime,
            exitTime: signal.time,
            profit: this.state.positionType === 'long' ? 
                   signal.price - this.state.entryPrice : 
                   this.state.entryPrice - signal.price,
            profitPercent: this.state.positionType === 'long' ? 
                          ((signal.price - this.state.entryPrice) / this.state.entryPrice) * 100 : 
                          ((this.state.entryPrice - signal.price) / this.state.entryPrice) * 100,
            rule: signal.rule
        };
        
        // Resetar o estado
        this.resetState();
        
        return result;
    },
    
    // Verificadores de condições específicas
    
    // RSI sobrevendido
    checkRSIOversold(rsiData, threshold) {
        if (!rsiData || rsiData.length < 2) return null;
        
        const current = rsiData[rsiData.length - 1];
        const previous = rsiData[rsiData.length - 2];
        
        // RSI cruzou abaixo do nível de sobrevenda
        if (previous > threshold && current <= threshold) {
            return {
                indicator: 'RSI',
                condition: 'cruzou abaixo',
                value: threshold,
                current: current
            };
        }
        
        return null;
    },
    
    // RSI sobrecomprado
    checkRSIOverbought(rsiData, threshold) {
        if (!rsiData || rsiData.length < 2) return null;
        
        const current = rsiData[rsiData.length - 1];
        const previous = rsiData[rsiData.length - 2];
        
        // RSI cruzou acima do nível de sobrecompra
        if (previous < threshold && current >= threshold) {
            return {
                indicator: 'RSI',
                condition: 'cruzou acima',
                value: threshold,
                current: current
            };
        }
        
        return null;
    },
    
    // Cruzamento de médias móveis para cima
    checkMACrossUp(fastMA, slowMA) {
        if (!fastMA || !slowMA || fastMA.length < 2 || slowMA.length < 2) return null;
        
        const currentFast = fastMA[fastMA.length - 1];
        const previousFast = fastMA[fastMA.length - 2];
        const currentSlow = slowMA[slowMA.length - 1];
        const previousSlow = slowMA[slowMA.length - 2];
        
        // Média rápida cruzou acima da média lenta
        if (previousFast <= previousSlow && currentFast > currentSlow) {
            return {
                indicator: 'Médias Móveis',
                condition: 'cruzamento para cima',
                value: null,
                current: currentFast
            };
        }
        
        return null;
    },
    
    // Cruzamento de médias móveis para baixo
    checkMACrossDown(fastMA, slowMA) {
        if (!fastMA || !slowMA || fastMA.length < 2 || slowMA.length < 2) return null;
        
        const currentFast = fastMA[fastMA.length - 1];
        const previousFast = fastMA[fastMA.length - 2];
        const currentSlow = slowMA[slowMA.length - 1];
        const previousSlow = slowMA[slowMA.length - 2];
        
        // Média rápida cruzou abaixo da média lenta
        if (previousFast >= previousSlow && currentFast < currentSlow) {
            return {
                indicator: 'Médias Móveis',
                condition: 'cruzamento para baixo',
                value: null,
                current: currentFast
            };
        }
        
        return null;
    },
    
    // Preço toca na banda inferior de Bollinger
    checkBBLowerTouch(candle, bollinger) {
        if (!bollinger || !bollinger.lower || bollinger.lower.length === 0) return null;
        
        const lowerBand = bollinger.lower[bollinger.lower.length - 1];
        
        // Preço tocou ou cruzou a banda inferior
        if (candle.low <= lowerBand) {
            return {
                indicator: 'Bandas de Bollinger',
                condition: 'toque na banda inferior',
                value: lowerBand,
                current: candle.low
            };
        }
        
        return null;
    },
    
    // Preço toca na banda superior de Bollinger
    checkBBUpperTouch(candle, bollinger) {
        if (!bollinger || !bollinger.upper || bollinger.upper.length === 0) return null;
        
        const upperBand = bollinger.upper[bollinger.upper.length - 1];
        
        // Preço tocou ou cruzou a banda superior
        if (candle.high >= upperBand) {
            return {
                indicator: 'Bandas de Bollinger',
                condition: 'toque na banda superior',
                value: upperBand,
                current: candle.high
            };
        }
        
        return null;
    },
    
    // MACD cruza acima da linha de sinal
    checkMACDCrossUp(macdData) {
        if (!macdData || !macdData.macd || !macdData.signal || 
            macdData.macd.length < 2 || macdData.signal.length < 2) return null;
        
        const currentMACD = macdData.macd[macdData.macd.length - 1];
        const previousMACD = macdData.macd[macdData.macd.length - 2];
        const currentSignal = macdData.signal[macdData.signal.length - 1];
        const previousSignal = macdData.signal[macdData.signal.length - 2];
        
        // MACD cruzou acima da linha de sinal
        if (previousMACD <= previousSignal && currentMACD > currentSignal) {
            return {
                indicator: 'MACD',
                condition: 'cruzamento para cima',
                value: null,
                current: currentMACD
            };
        }
        
        return null;
    },
    
    // MACD cruza abaixo da linha de sinal
    checkMACDCrossDown(macdData) {
        if (!macdData || !macdData.macd || !macdData.signal || 
            macdData.macd.length < 2 || macdData.signal.length < 2) return null;
        
        const currentMACD = macdData.macd[macdData.macd.length - 1];
        const previousMACD = macdData.macd[macdData.macd.length - 2];
        const currentSignal = macdData.signal[macdData.signal.length - 1];
        const previousSignal = macdData.signal[macdData.signal.length - 2];
        
        // MACD cruzou abaixo da linha de sinal
        if (previousMACD >= previousSignal && currentMACD < currentSignal) {
            return {
                indicator: 'MACD',
                condition: 'cruzamento para baixo',
                value: null,
                current: currentMACD
            };
        }
        
        return null;
    }
};

// Exportar o módulo
window.tradingRules = tradingRules;
