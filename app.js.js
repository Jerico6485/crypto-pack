// Arquivo principal da aplicação
document.addEventListener('DOMContentLoaded', function() {
    // Inicializar módulos
    initializeApp();
});

// Inicializar a aplicação
function initializeApp() {
    console.log('Inicializando Crypto Forex Trader...');
    
    // Inicializar gerenciador de configurações
    window.settingsManager.initialize();
    
    // Inicializar sistema de notificações WhatsApp
    window.whatsappNotifications.initialize({
        whatsappNumber: document.getElementById('whatsapp-number').value
    });
    
    // Inicializar sistema de regras de trading
    window.tradingRules.initialize({
        currentSymbol: 'BTCUSDT'
    });
    
    // Configurar eventos da interface
    setupUIEvents();
    
    // Carregar lista de mercados
    loadMarketList();
    
    // Carregar dados iniciais
    loadMarketData('BTCUSDT', '15m');
    
    // Iniciar atualização automática
    startAutoRefresh();
    
    console.log('Aplicação inicializada com sucesso!');
}

// Configurar eventos da interface
function setupUIEvents() {
    // Botão de salvar configurações rápidas
    const saveSettingsBtn = document.getElementById('save-settings');
    if (saveSettingsBtn) {
        saveSettingsBtn.addEventListener('click', function() {
            const whatsappNumber = document.getElementById('whatsapp-number').value;
            window.whatsappNotifications.updateConfig({
                whatsappNumber: whatsappNumber
            });
            
            window.settingsManager.saveSettings({
                whatsapp: {
                    number: whatsappNumber
                }
            });
            
            alert('Número de WhatsApp salvo com sucesso!');
        });
    }
    
    // Botão de abrir modal de configurações
    const openSettingsModalBtn = document.getElementById('open-settings-modal');
    if (openSettingsModalBtn) {
        openSettingsModalBtn.addEventListener('click', function() {
            window.settingsManager.openSettingsModal();
        });
    }
    
    // Botão de fechar modal de configurações
    const closeSettingsModalBtn = document.getElementById('close-settings-modal');
    if (closeSettingsModalBtn) {
        closeSettingsModalBtn.addEventListener('click', function() {
            window.settingsManager.closeSettingsModal();
        });
    }
    
    // Botão de salvar configurações do modal
    const saveSettingsFormBtn = document.getElementById('save-settings-form');
    if (saveSettingsFormBtn) {
        saveSettingsFormBtn.addEventListener('click', function() {
            window.settingsManager.saveSettingsFromForm();
        });
    }
    
    // Botão de resetar configurações
    const resetSettingsBtn = document.getElementById('reset-settings');
    if (resetSettingsBtn) {
        resetSettingsBtn.addEventListener('click', function() {
            if (confirm('Tem certeza que deseja resetar todas as configurações para o padrão?')) {
                window.settingsManager.resetSettings();
                window.settingsManager.populateSettingsForm();
                alert('Configurações resetadas com sucesso!');
            }
        });
    }
    
    // Botões de tipo de mercado
    const marketTypeButtons = document.querySelectorAll('.market-type');
    marketTypeButtons.forEach(button => {
        button.addEventListener('click', function() {
            // Remover classe active de todos os botões
            marketTypeButtons.forEach(btn => btn.classList.remove('active'));
            
            // Adicionar classe active ao botão clicado
            this.classList.add('active');
            
            // Carregar lista de mercados do tipo selecionado
            const marketType = this.getAttribute('data-type');
            loadMarketList(marketType);
        });
    });
    
    // Botões de timeframe
    const timeframeButtons = document.querySelectorAll('.timeframe');
    timeframeButtons.forEach(button => {
        button.addEventListener('click', function() {
            // Remover classe active de todos os botões
            timeframeButtons.forEach(btn => btn.classList.remove('active'));
            
            // Adicionar classe active ao botão clicado
            this.classList.add('active');
            
            // Carregar dados do timeframe selecionado
            const minutes = this.getAttribute('data-minutes');
            const currentSymbol = document.getElementById('current-symbol').textContent;
            
            let interval;
            if (minutes === '1') interval = '1m';
            else if (minutes === '5') interval = '5m';
            else if (minutes === '15') interval = '15m';
            else if (minutes === '30') interval = '30m';
            else if (minutes === '60') interval = '1h';
            else if (minutes === '240') interval = '4h';
            else if (minutes === '1440') interval = '1d';
            
            loadMarketData(currentSymbol, interval);
        });
    });
    
    // Configurar eventos para indicadores
    setupIndicatorEvents();
}

// Configurar eventos para indicadores
function setupIndicatorEvents() {
    // RSI
    const rsiIndicator = document.getElementById('rsi-indicator');
    const rsiPeriod = document.getElementById('rsi-period');
    const rsiOverbought = document.getElementById('rsi-overbought');
    const rsiOversold = document.getElementById('rsi-oversold');
    
    if (rsiIndicator) {
        rsiIndicator.addEventListener('change', function() {
            window.settingsManager.saveSettings({
                indicators: {
                    rsi: {
                        enabled: this.checked
                    }
                }
            });
            
            // Recarregar dados para atualizar indicadores
            const currentSymbol = document.getElementById('current-symbol').textContent;
            const activeTimeframe = document.querySelector('.timeframe.active');
            const interval = activeTimeframe ? activeTimeframe.getAttribute('data-minutes') : '15';
            
            loadMarketData(currentSymbol, interval + 'm');
        });
    }
    
    if (rsiPeriod) {
        rsiPeriod.addEventListener('change', function() {
            window.settingsManager.saveSettings({
                indicators: {
                    rsi: {
                        period: parseInt(this.value)
                    }
                }
            });
            
            // Recarregar dados para atualizar indicadores
            const currentSymbol = document.getElementById('current-symbol').textContent;
            const activeTimeframe = document.querySelector('.timeframe.active');
            const interval = activeTimeframe ? activeTimeframe.getAttribute('data-minutes') : '15';
            
            loadMarketData(currentSymbol, interval + 'm');
        });
    }
    
    if (rsiOverbought) {
        rsiOverbought.addEventListener('change', function() {
            window.settingsManager.saveSettings({
                indicators: {
                    rsi: {
                        overbought: parseInt(this.value)
                    }
                }
            });
            
            // Recarregar dados para atualizar indicadores
            const currentSymbol = document.getElementById('current-symbol').textContent;
            const activeTimeframe = document.querySelector('.timeframe.active');
            const interval = activeTimeframe ? activeTimeframe.getAttribute('data-minutes') : '15';
            
            loadMarketData(currentSymbol, interval + 'm');
        });
    }
    
    if (rsiOversold) {
        rsiOversold.addEventListener('change', function() {
            window.settingsManager.saveSettings({
                indicators: {
                    rsi: {
                        oversold: parseInt(this.value)
                    }
                }
            });
            
            // Recarregar dados para atualizar indicadores
            const currentSymbol = document.getElementById('current-symbol').textContent;
            const activeTimeframe = document.querySelector('.timeframe.active');
            const interval = activeTimeframe ? activeTimeframe.getAttribute('data-minutes') : '15';
            
            loadMarketData(currentSymbol, interval + 'm');
        });
    }
    
    // Configurar eventos para outros indicadores (MA, Bollinger, etc.)
    // ...
}

// Carregar lista de mercados
function loadMarketList(marketType = 'crypto') {
    const marketList = document.getElementById('market-list');
    if (!marketList) return;
    
    // Limpar lista atual
    marketList.innerHTML = '';
    
    // Obter lista de símbolos com base no tipo de mercado
    let symbols = [];
    
    if (marketType === 'crypto') {
        symbols = window.settingsManager.currentSettings.market.cryptoSymbols;
    } else if (marketType === 'forex') {
        symbols = window.settingsManager.currentSettings.market.forexSymbols;
    }
    
    // Adicionar cada símbolo à lista
    symbols.forEach(symbol => {
        const marketItem = document.createElement('div');
        marketItem.className = 'market-item';
        marketItem.setAttribute('data-symbol', symbol);
        
        // Verificar se é o símbolo atual
        if (symbol === window.settingsManager.currentSettings.market.defaultSymbol) {
            marketItem.classList.add('active');
        }
        
        marketItem.innerHTML = `
            <span class="market-name">${symbol}</span>
            <span class="market-price">--</span>
        `;
        
        // Adicionar evento de clique
        marketItem.addEventListener('click', function() {
            // Remover classe active de todos os itens
            const items = document.querySelectorAll('.market-item');
            items.forEach(item => item.classList.remove('active'));
            
            // Adicionar classe active ao item clicado
            this.classList.add('active');
            
            // Carregar dados do símbolo selecionado
            const symbol = this.getAttribute('data-symbol');
            const activeTimeframe = document.querySelector('.timeframe.active');
            const interval = activeTimeframe ? activeTimeframe.getAttribute('data-minutes') : '15';
            
            loadMarketData(symbol, interval + 'm');
        });
        
        marketList.appendChild(marketItem);
    });
    
    // Simular preços para cada símbolo
    simulateMarketPrices();
}

// Simular preços para cada símbolo na lista
function simulateMarketPrices() {
    const marketItems = document.querySelectorAll('.market-item');
    
    marketItems.forEach(item => {
        const symbol = item.getAttribute('data-symbol');
        let basePrice = 100;
        
        // Determinar preço base com base no símbolo
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
        const price = basePrice * (0.95 + Math.random() * 0.1);
        
        // Atualizar preço no item
        const priceElement = item.querySelector('.market-price');
        if (priceElement) {
            priceElement.textContent = price.toFixed(price < 1 ? 4 : 2);
        }
    });
}

// Carregar dados de mercado
async function loadMarketData(symbol, interval = '15m') {
    console.log(`Carregando dados de ${symbol} com intervalo ${interval}...`);
    
    // Atualizar símbolo atual na interface
    document.getElementById('current-symbol').textContent = symbol;
    
    try {
        // Obter dados do Yahoo Finance
        const data = await window.yahooFinance.getChartData(symbol, interval);
        
        // Atualizar preço atual
        if (data.candles.length > 0) {
            const lastCandle = data.candles[data.candles.length - 1];
            const currentPrice = lastCandle.close;
            const previousClose = data.candles.length > 1 ? data.candles[data.candles.length - 2].close : lastCandle.open;
            const priceChange = currentPrice - previousClose;
            const priceChangePercent = (priceChange / previousClose) * 100;
            
            document.getElementById('current-price').textContent = currentPrice.toFixed(currentPrice < 1 ? 4 : 2);
            
            const priceChangeElement = document.getElementById('price-change');
            priceChangeElement.textContent = `${priceChange >= 0 ? '+' : ''}${priceChange.toFixed(2)} (${priceChangePercent.toFixed(2)}%)`;
            priceChangeElement.className = priceChange >= 0 ? 'price-up' : 'price-down';
        }
        
        // Renderizar gráfico
        renderChart(data);
        
        // Calcular indicadores
        calculateIndicators(data);
        
        // Analisar dados com regras de trading
        analyzeMarketData(data);
        
        // Carregar notícias
        loadNews(symbol);
        
    } catch (error) {
        console.error('Erro ao carregar dados de mercado:', error);
        alert('Erro ao carregar dados de mercado. Tente novamente mais tarde.');
    }
}

// Renderizar gráfico
function renderChart(data) {
    const chartContainer = document.getElementById('chart');
    if (!chartContainer) return;
    
    // Limpar gráfico existente
    chartContainer.innerHTML = '';
    
    // Criar canvas para o gráfico
    const canvas = document.createElement('canvas');
    chartContainer.appendChild(canvas);
    
    // Preparar dados para o gráfico
    const chartData = data.candles.map(candle => ({
        x: candle.timestamp,
        o: candle.open,
        h: candle.high,
        l: candle.low,
        c: candle.close
    }));
    
    // Criar gráfico com Chart.js
    const ctx = canvas.getContext('2d');
    const chart = new Chart(ctx, {
        type: 'candlestick',
        data: {
            datasets: [{
                label: data.symbol,
                data: chartData,
                color: {
                    up: 'rgba(76, 175, 80, 1)',
                    down: 'rgba(244, 67, 54, 1)',
                    unchanged: 'rgba(100, 100, 100, 1)',
                }
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                x: {
                    type: 'time',
                    time: {
                        unit: 'day',
                        displayFormats: {
                            day: 'dd/MM'
                        }
                    },
                    grid: {
                        color: 'rgba(255, 255, 255, 0.1)'
                    },
                    ticks: {
                        color: 'rgba(255, 255, 255, 0.7)'
                    }
                },
                y: {
                    grid: {
                        color: 'rgba(255, 255, 255, 0.1)'
                    },
                    ticks: {
                        color: 'rgba(255, 255, 255, 0.7)'
                    }
                }
            },
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const point = context.raw;
                            return [
                                `Abertura: ${point.o}`,
                                `Máxima: ${point.h}`,
                                `Mínima: ${point.l}`,
                                `Fechamento: ${point.c}`
                            ];
                        }
                    }
                }
            }
        }
    });
    
    // Armazenar referência ao gráfico para atualizações futuras
    window.currentChart = chart;
}

// Calcular indicadores
function calculateIndicators(data) {
    // Extrair preços de fechamento
    const closePrices = data.candles.map(candle => candle.close);
    const highPrices = data.candles.map(candle => candle.high);
    const lowPrices = data.candles.map(candle => candle.low);
    const openPrices = data.candles.map(candle => candle.open);
    
    // Obter configurações de indicadores
    const settings = window.settingsManager.currentSettings;
    
    // Calcular RSI
    if (settings.indicators.rsi.enabled) {
        const rsiValues = window.technicalIndicators.calculateRSI(
            closePrices, 
            settings.indicators.rsi.period
        );
        
        // Renderizar gráfico de RSI
        renderRSIChart(rsiValues, settings.indicators.rsi.overbought, settings.indicators.rsi.oversold);
    } else {
        // Limpar gráfico de RSI se desativado
        const rsiChart = document.getElementById('rsi-chart');
        if (rsiChart) rsiChart.innerHTML = '';
    }
    
    // Calcular outros indicadores conforme necessário
    // ...
    
    // Retornar todos os indicadores calculados
    return {
        rsi: window.technicalIndicators.calculateRSI(closePrices, settings.indicators.rsi.period),
        fastMA: settings.indicators.ma.enabled ? 
                (settings.indicators.ma.type === 'sma' ? 
                 window.technicalIndicators.calculateSMA(closePrices, settings.indicators.ma.fast) : 
                 window.technicalIndicators.calculateEMA(closePrices, settings.indicators.ma.fast)) : 
                [],
        slowMA: settings.indicators.ma.enabled ? 
                (settings.indicators.ma.type === 'sma' ? 
                 window.technicalIndicators.calculateSMA(closePrices, settings.indicators.ma.slow) : 
                 window.technicalIndicators.calculateEMA(closePrices, settings.indicators.ma.slow)) : 
                [],
        bollinger: settings.indicators.bollinger.enabled ? 
                  window.technicalIndicators.calculateBollingerBands(
                      closePrices, 
                      settings.indicators.bollinger.period, 
                      settings.indicators.bollinger.deviation
                  ) : 
                  { upper: [], middle: [], lower: [] },
        macd: settings.indicators.macd.enabled ? 
              window.technicalIndicators.calculateMACD(
                  closePrices, 
                  settings.indicators.macd.fastPeriod, 
                  settings.indicators.macd.slowPeriod, 
                  settings.indicators.macd.signalPeriod
              ) : 
              { macd: [], signal: [], histogram: [] }
    };
}

// Renderizar gráfico de RSI
function renderRSIChart(rsiValues, overbought = 70, oversold = 30) {
    const rsiChart = document.getElementById('rsi-chart');
    if (!rsiChart) return;
    
    // Limpar gráfico existente
    rsiChart.innerHTML = '';
    
    // Criar canvas para o gráfico
    const canvas = document.createElement('canvas');
    rsiChart.appendChild(canvas);
    
    // Preparar dados para o gráfico
    const labels = Array.from({ length: rsiValues.length }, (_, i) => i);
    
    // Criar gráfico com Chart.js
    const ctx = canvas.getContext('2d');
    const chart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'RSI',
                data: rsiValues,
                borderColor: 'rgba(255, 159, 64, 1)',
                borderWidth: 1,
                fill: false
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                x: {
                    display: false
                },
                y: {
                    min: 0,
                    max: 100,
                    grid: {
                        color: 'rgba(255, 255, 255, 0.1)'
                    },
                    ticks: {
                        color: 'rgba(255, 255, 255, 0.7)'
                    }
                }
            },
            plugins: {
                annotation: {
                    annotations: {
                        overboughtLine: {
                            type: 'line',
                            yMin: overbought,
                            yMax: overbought,
                            borderColor: 'rgba(244, 67, 54, 0.5)',
                            borderWidth: 1,
                            borderDash: [5, 5]
                        },
                        oversoldLine: {
                            type: 'line',
                            yMin: oversold,
                            yMax: oversold,
                            borderColor: 'rgba(76, 175, 80, 0.5)',
                            borderWidth: 1,
                            borderDash: [5, 5]
                        }
                    }
                }
            }
        }
    });
    
    // Armazenar referência ao gráfico para atualizações futuras
    window.rsiChart = chart;
}

// Analisar dados de mercado com regras de trading
function analyzeMarketData(data) {
    // Calcular indicadores
    const indicators = calculateIndicators(data);
    
    // Analisar dados com regras de trading
    const signal = window.tradingRules.analyze(data.candles, indicators);
    
    // Se tiver sinal, adicionar ao painel de alertas
    if (signal) {
        addAlertToPanel(signal, data.symbol);
        
        // Enviar notificação WhatsApp se for um sinal de entrada ou saída
        if (signal.type === 'entry') {
            window.whatsappNotifications.sendEntrySignal(
                data.symbol,
                signal.price,
                signal.rule,
                signal.time
            );
        } else if (signal.type === 'exit') {
            window.whatsappNotifications.sendExitSignal(
                data.symbol,
                signal.entryPrice,
                signal.exitPrice,
                signal.profit,
                signal.profitPercent,
                signal.rule,
                signal.time
            );
        }
    }
}

// Adicionar alerta ao painel
function addAlertToPanel(signal, symbol) {
    const alertsList = document.getElementById('alerts-list');
    if (!alertsList) return;
    
    // Criar elemento de alerta
    const alertItem = document.createElement('div');
    alertItem.className = `alert-item ${signal.type === 'entry' ? 'alert-buy' : 'alert-sell'}`;
    
    // Formatar timestamp
    const timestamp = new Date(signal.time);
    const formattedTime = timestamp.toLocaleTimeString('pt-BR');
    
    // Conteúdo do alerta
    if (signal.type === 'entry') {
        alertItem.innerHTML = `
            <div class="alert-info">
                <strong>COMPRA:</strong> ${symbol} @ ${signal.price.toFixed(2)}
                <div class="alert-rule">${signal.rule}</div>
            </div>
            <div class="alert-time">${formattedTime}</div>
        `;
    } else {
        const profitClass = signal.profit >= 0 ? 'price-up' : 'price-down';
        alertItem.innerHTML = `
            <div class="alert-info">
                <strong>VENDA:</strong> ${symbol} @ ${signal.price.toFixed(2)}
                <div class="alert-rule">${signal.rule}</div>
                <div class="alert-profit ${profitClass}">
                    ${signal.profit >= 0 ? '+' : ''}${signal.profit.toFixed(2)} (${signal.profitPercent.toFixed(2)}%)
                </div>
            </div>
            <div class="alert-time">${formattedTime}</div>
        `;
    }
    
    // Adicionar ao início da lista
    alertsList.insertBefore(alertItem, alertsList.firstChild);
    
    // Limitar número de alertas (manter os 10 mais recentes)
    while (alertsList.children.length > 10) {
        alertsList.removeChild(alertsList.lastChild);
    }
}

// Carregar notícias
async function loadNews(symbol) {
    try {
        // Obter notícias do Yahoo Finance
        const news = await window.yahooFinance.getNews(symbol);
        
        // Atualizar painel de notícias
        const newsList = document.getElementById('news-list');
        if (!newsList) return;
        
        // Limpar lista atual
        newsList.innerHTML = '';
        
        // Adicionar cada notícia à lista
        news.forEach(item => {
            const newsItem = document.createElement('div');
            newsItem.className = 'news-item';
            
            // Formatar timestamp
            const timestamp = new Date(item.time);
            const formattedTime = timestamp.toLocaleTimeString('pt-BR');
            
            newsItem.innerHTML = `
                <h4>${item.title}</h4>
                <div class="news-meta">
                    <span class="news-source">${item.source}</span>
                    <span class="news-time">${formattedTime}</span>
                </div>
            `;
            
            // Adicionar evento de clique para enviar notificação
            newsItem.addEventListener('click', function() {
                if (confirm('Enviar esta notícia como alerta para o WhatsApp?')) {
                    window.whatsappNotifications.sendNewsAlert(
                        item.title,
                        item.source,
                        item.time
                    );
                    alert('Notícia enviada para o WhatsApp!');
                }
            });
            
            newsList.appendChild(newsItem);
        });
        
    } catch (error) {
        console.error('Erro ao carregar notícias:', error);
    }
}

// Iniciar atualização automática
function startAutoRefresh() {
    // Verificar se a atualização automática está ativada
    if (!window.settingsManager.currentSettings.general.autoRefresh) return;
    
    // Definir intervalo de atualização
    const interval = window.settingsManager.currentSettings.general.refreshInterval * 1000;
    
    // Iniciar timer
    window.refreshTimer = setInterval(() => {
        // Obter símbolo e timeframe atuais
        const currentSymbol = document.getElementById('current-symbol').textContent;
        const activeTimeframe = document.querySelector('.timeframe.active');
        const timeframeMinutes = activeTimeframe ? activeTimeframe.getAttribute('data-minutes') : '15';
        
        // Converter minutos para formato de intervalo
        let interval;
        if (timeframeMinutes === '1') interval = '1m';
        else if (timeframeMinutes === '5') interval = '5m';
        else if (timeframeMinutes === '15') interval = '15m';
        else if (timeframeMinutes === '30') interval = '30m';
        else if (timeframeMinutes === '60') interval = '1h';
        else if (timeframeMinutes === '240') interval = '4h';
        else if (timeframeMinutes === '1440') interval = '1d';
        
        // Recarregar dados
        loadMarketData(currentSymbol, interval);
        
    }, interval);
}

// Parar atualização automática
function stopAutoRefresh() {
    if (window.refreshTimer) {
        clearInterval(window.refreshTimer);
        window.refreshTimer = null;
    }
}
