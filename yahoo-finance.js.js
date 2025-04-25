// Integração com a API do Yahoo Finance
const yahooFinance = {
    // Configurações da API
    apiBaseUrl: 'https://query1.finance.yahoo.com/v8/finance/chart/',
    
    // Obter dados de um símbolo específico
    async getChartData(symbol, interval = '15m', range = '1d') {
        try {
            // Converter símbolos para o formato do Yahoo Finance
            const yahooSymbol = this.convertSymbol(symbol);
            
            // Construir URL da API
            const url = `${this.apiBaseUrl}${yahooSymbol}?interval=${interval}&range=${range}&includePrePost=false`;
            
            // Fazer a requisição
            const response = await fetch(url);
            
            if (!response.ok) {
                throw new Error(`Erro na API do Yahoo Finance: ${response.status}`);
            }
            
            const data = await response.json();
            
            // Processar os dados recebidos
            return this.processChartData(data, symbol);
        } catch (error) {
            console.error('Erro ao obter dados do Yahoo Finance:', error);
            // Em caso de erro, retornar dados simulados para não quebrar a aplicação
            return this.getSimulatedData(symbol, interval, range);
        }
    },
    
    // Converter símbolos para o formato do Yahoo Finance
    convertSymbol(symbol) {
        // Criptomoedas
        if (symbol.endsWith('USDT')) {
            // Converter BTCUSDT para BTC-USD
            return symbol.replace('USDT', '-USD');
        }
        
        // Forex
        if (symbol === 'EURUSD') return 'EURUSD=X';
        if (symbol === 'GBPUSD') return 'GBPUSD=X';
        if (symbol === 'USDJPY') return 'USDJPY=X';
        if (symbol === 'AUDUSD') return 'AUDUSD=X';
        if (symbol === 'USDCAD') return 'USDCAD=X';
        
        // Caso não seja um símbolo especial, retornar como está
        return symbol;
    },
    
    // Processar dados recebidos da API
    processChartData(apiData, originalSymbol) {
        // Verificar se temos dados válidos
        if (!apiData || !apiData.chart || !apiData.chart.result || apiData.chart.result.length === 0) {
            console.error('Dados inválidos recebidos da API');
            return this.getSimulatedData(originalSymbol);
        }
        
        const result = apiData.chart.result[0];
        const quote = result.indicators.quote[0];
        const timestamps = result.timestamp;
        
        // Verificar se temos todos os dados necessários
        if (!timestamps || !quote || !quote.open || !quote.high || !quote.low || !quote.close) {
            console.error('Dados incompletos recebidos da API');
            return this.getSimulatedData(originalSymbol);
        }
        
        // Construir objeto de dados formatado
        const data = {
            symbol: originalSymbol,
            interval: result.meta.dataGranularity || '15m',
            candles: []
        };
        
        // Converter timestamps e dados de preço em candles
        for (let i = 0; i < timestamps.length; i++) {
            // Pular pontos com dados nulos
            if (quote.open[i] === null || quote.high[i] === null || 
                quote.low[i] === null || quote.close[i] === null) {
                continue;
            }
            
            data.candles.push({
                timestamp: new Date(timestamps[i] * 1000), // Converter de segundos para milissegundos
                open: quote.open[i],
                high: quote.high[i],
                low: quote.low[i],
                close: quote.close[i],
                volume: quote.volume[i] || 0
            });
        }
        
        return data;
    },
    
    // Gerar dados simulados em caso de falha na API
    getSimulatedData(symbol, interval = '15m', range = '1d') {
        console.log('Gerando dados simulados para', symbol);
        
        const now = new Date();
        const data = {
            symbol: symbol,
            interval: interval,
            candles: []
        };
        
        // Determinar o número de candles com base no intervalo e range
        let candleCount = 100;
        let intervalMinutes = 15;
        
        if (interval === '1m') intervalMinutes = 1;
        else if (interval === '5m') intervalMinutes = 5;
        else if (interval === '15m') intervalMinutes = 15;
        else if (interval === '30m') intervalMinutes = 30;
        else if (interval === '60m' || interval === '1h') intervalMinutes = 60;
        else if (interval === '1d') intervalMinutes = 1440;
        
        // Determinar preço base com base no símbolo
        let basePrice = 100;
        
        if (symbol.includes('BTC')) basePrice = 50000;
        else if (symbol.includes('ETH')) basePrice = 3000;
        else if (symbol.includes('SOL')) basePrice = 100;
        else if (symbol.includes('BNB')) basePrice = 400;
        else if (symbol.includes('ADA')) basePrice = 1.2;
        else if (symbol.includes('EUR')) basePrice = 1.1;
        else if (symbol.includes('GBP')) basePrice = 1.3;
        else if (symbol.includes('JPY')) basePrice = 0.009;
        else if (symbol.includes('AUD')) basePrice = 0.7;
        else if (symbol.includes('CAD')) basePrice = 0.8;
        
        // Adicionar alguma variação aleatória ao preço base
        basePrice = basePrice * (0.95 + Math.random() * 0.1);
        
        // Gerar candles
        for (let i = 0; i < candleCount; i++) {
            const timestamp = new Date(now.getTime() - (candleCount - i) * intervalMinutes * 60 * 1000);
            
            // Gerar preços simulados com alguma volatilidade
            const volatility = symbol.includes('BTC') ? 0.02 : 0.01;
            const changePercent = (Math.random() - 0.5) * volatility;
            
            const open = i === 0 ? basePrice : data.candles[i-1].close;
            const close = open * (1 + changePercent);
            const high = Math.max(open, close) * (1 + Math.random() * 0.005);
            const low = Math.min(open, close) * (1 - Math.random() * 0.005);
            const volume = Math.floor(Math.random() * 1000) + 100;
            
            data.candles.push({
                timestamp: timestamp,
                open: open,
                high: high,
                low: low,
                close: close,
                volume: volume
            });
        }
        
        return data;
    },
    
    // Obter notícias relacionadas a um símbolo
    async getNews(symbol) {
        try {
            // Em uma implementação real, aqui seria feita uma chamada para a API de notícias
            // Como estamos simulando, vamos retornar notícias fictícias
            
            const newsItems = [
                {
                    title: `Análise técnica: ${symbol} mostra sinais de reversão`,
                    source: 'CryptoAnalyst',
                    time: new Date(),
                    url: '#'
                },
                {
                    title: `Especialistas preveem alta para ${symbol} nos próximos dias`,
                    source: 'MarketWatch',
                    time: new Date(Date.now() - 3600000), // 1 hora atrás
                    url: '#'
                },
                {
                    title: `Volume de negociação de ${symbol} atinge recorde mensal`,
                    source: 'TradingView',
                    time: new Date(Date.now() - 7200000), // 2 horas atrás
                    url: '#'
                }
            ];
            
            return newsItems;
        } catch (error) {
            console.error('Erro ao obter notícias:', error);
            return [];
        }
    }
};

// Exportar o módulo
window.yahooFinance = yahooFinance;
