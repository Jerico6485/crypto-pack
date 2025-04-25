// Módulo de configurações da aplicação
const settingsManager = {
    // Configurações padrão
    defaultSettings: {
        // Configurações gerais
        general: {
            theme: 'dark',
            language: 'pt-BR',
            autoRefresh: true,
            refreshInterval: 60 // segundos
        },
        
        // Configurações de WhatsApp
        whatsapp: {
            number: '55 3195747126',
            notifyEntry: true,
            notifyExit: true,
            notifyNews: false
        },
        
        // Configurações de mercado
        market: {
            defaultType: 'crypto',
            defaultSymbol: 'BTCUSDT',
            defaultTimeframe: '15m',
            cryptoSymbols: ['BTCUSDT', 'ETHUSDT', 'SOLUSDT', 'BNBUSDT', 'ADAUSDT'],
            forexSymbols: ['EURUSD', 'USDJPY', 'GBPUSD', 'AUDUSD', 'USDCAD']
        },
        
        // Configurações de indicadores
        indicators: {
            rsi: {
                enabled: true,
                period: 14,
                overbought: 70,
                oversold: 30
            },
            ma: {
                enabled: false,
                fast: 9,
                slow: 21,
                type: 'ema' // 'sma' ou 'ema'
            },
            bollinger: {
                enabled: false,
                period: 20,
                deviation: 2
            },
            macd: {
                enabled: false,
                fastPeriod: 12,
                slowPeriod: 26,
                signalPeriod: 9
            }
        },
        
        // Configurações de regras de trading
        tradingRules: {
            entry: {
                condition: 'rsi-below',
                value: 30
            },
            exit: {
                condition: 'rsi-above',
                value: 70
            },
            stopLoss: {
                enabled: true,
                type: 'percent',
                value: 2.0
            },
            takeProfit: {
                enabled: true,
                type: 'percent',
                value: 3.0
            }
        }
    },
    
    // Configurações atuais
    currentSettings: {},
    
    // Inicializar configurações
    initialize() {
        // Tentar carregar configurações salvas
        const savedSettings = localStorage.getItem('cryptoForexSettings');
        
        if (savedSettings) {
            try {
                this.currentSettings = JSON.parse(savedSettings);
                console.log('Configurações carregadas do localStorage');
            } catch (error) {
                console.error('Erro ao carregar configurações:', error);
                this.currentSettings = {...this.defaultSettings};
            }
        } else {
            // Usar configurações padrão
            this.currentSettings = {...this.defaultSettings};
            console.log('Usando configurações padrão');
        }
        
        // Aplicar configurações à interface
        this.applySettingsToUI();
        
        return this.currentSettings;
    },
    
    // Salvar configurações
    saveSettings(newSettings) {
        // Mesclar configurações atuais com as novas
        this.currentSettings = {...this.currentSettings, ...newSettings};
        
        // Salvar no localStorage
        localStorage.setItem('cryptoForexSettings', JSON.stringify(this.currentSettings));
        console.log('Configurações salvas no localStorage');
        
        // Aplicar configurações à interface
        this.applySettingsToUI();
        
        return this.currentSettings;
    },
    
    // Resetar configurações para o padrão
    resetSettings() {
        this.currentSettings = {...this.defaultSettings};
        localStorage.setItem('cryptoForexSettings', JSON.stringify(this.currentSettings));
        console.log('Configurações resetadas para o padrão');
        
        // Aplicar configurações à interface
        this.applySettingsToUI();
        
        return this.currentSettings;
    },
    
    // Aplicar configurações à interface
    applySettingsToUI() {
        // Aplicar tema
        document.body.className = this.currentSettings.general.theme;
        
        // Aplicar configurações de WhatsApp
        if (window.whatsappNotifications) {
            window.whatsappNotifications.updateConfig({
                whatsappNumber: this.currentSettings.whatsapp.number,
                notifyEntry: this.currentSettings.whatsapp.notifyEntry,
                notifyExit: this.currentSettings.whatsapp.notifyExit,
                notifyNews: this.currentSettings.whatsapp.notifyNews
            });
        }
        
        // Disparar evento de configurações atualizadas
        const event = new CustomEvent('settings-updated', {
            detail: {
                settings: this.currentSettings
            }
        });
        
        document.dispatchEvent(event);
    },
    
    // Abrir modal de configurações
    openSettingsModal() {
        const modal = document.getElementById('settings-modal');
        if (modal) {
            // Preencher campos do modal com as configurações atuais
            this.populateSettingsForm();
            modal.style.display = 'flex';
        }
    },
    
    // Fechar modal de configurações
    closeSettingsModal() {
        const modal = document.getElementById('settings-modal');
        if (modal) {
            modal.style.display = 'none';
        }
    },
    
    // Preencher formulário de configurações
    populateSettingsForm() {
        // WhatsApp
        const whatsappNumber = document.getElementById('settings-whatsapp-number');
        const notifyEntry = document.getElementById('settings-notify-entry');
        const notifyExit = document.getElementById('settings-notify-exit');
        const notifyNews = document.getElementById('settings-notify-news');
        
        if (whatsappNumber) whatsappNumber.value = this.currentSettings.whatsapp.number;
        if (notifyEntry) notifyEntry.checked = this.currentSettings.whatsapp.notifyEntry;
        if (notifyExit) notifyExit.checked = this.currentSettings.whatsapp.notifyExit;
        if (notifyNews) notifyNews.checked = this.currentSettings.whatsapp.notifyNews;
        
        // Indicadores
        const rsiEnabled = document.getElementById('settings-rsi-enabled');
        const rsiPeriod = document.getElementById('settings-rsi-period');
        const rsiOverbought = document.getElementById('settings-rsi-overbought');
        const rsiOversold = document.getElementById('settings-rsi-oversold');
        
        if (rsiEnabled) rsiEnabled.checked = this.currentSettings.indicators.rsi.enabled;
        if (rsiPeriod) rsiPeriod.value = this.currentSettings.indicators.rsi.period;
        if (rsiOverbought) rsiOverbought.value = this.currentSettings.indicators.rsi.overbought;
        if (rsiOversold) rsiOversold.value = this.currentSettings.indicators.rsi.oversold;
        
        // Regras de trading
        const entryCondition = document.getElementById('settings-entry-condition');
        const entryValue = document.getElementById('settings-entry-value');
        const exitCondition = document.getElementById('settings-exit-condition');
        const exitValue = document.getElementById('settings-exit-value');
        
        if (entryCondition) entryCondition.value = this.currentSettings.tradingRules.entry.condition;
        if (entryValue) entryValue.value = this.currentSettings.tradingRules.entry.value;
        if (exitCondition) exitCondition.value = this.currentSettings.tradingRules.exit.condition;
        if (exitValue) exitValue.value = this.currentSettings.tradingRules.exit.value;
        
        // Stop Loss e Take Profit
        const stopLossEnabled = document.getElementById('settings-stop-loss-enabled');
        const stopLossType = document.getElementById('settings-stop-loss-type');
        const stopLossValue = document.getElementById('settings-stop-loss-value');
        const takeProfitEnabled = document.getElementById('settings-take-profit-enabled');
        const takeProfitType = document.getElementById('settings-take-profit-type');
        const takeProfitValue = document.getElementById('settings-take-profit-value');
        
        if (stopLossEnabled) stopLossEnabled.checked = this.currentSettings.tradingRules.stopLoss.enabled;
        if (stopLossType) stopLossType.value = this.currentSettings.tradingRules.stopLoss.type;
        if (stopLossValue) stopLossValue.value = this.currentSettings.tradingRules.stopLoss.value;
        if (takeProfitEnabled) takeProfitEnabled.checked = this.currentSettings.tradingRules.takeProfit.enabled;
        if (takeProfitType) takeProfitType.value = this.currentSettings.tradingRules.takeProfit.type;
        if (takeProfitValue) takeProfitValue.value = this.currentSettings.tradingRules.takeProfit.value;
    },
    
    // Salvar configurações do formulário
    saveSettingsFromForm() {
        // WhatsApp
        const whatsappNumber = document.getElementById('settings-whatsapp-number');
        const notifyEntry = document.getElementById('settings-notify-entry');
        const notifyExit = document.getElementById('settings-notify-exit');
        const notifyNews = document.getElementById('settings-notify-news');
        
        // Indicadores
        const rsiEnabled = document.getElementById('settings-rsi-enabled');
        const rsiPeriod = document.getElementById('settings-rsi-period');
        const rsiOverbought = document.getElementById('settings-rsi-overbought');
        const rsiOversold = document.getElementById('settings-rsi-oversold');
        
        // Regras de trading
        const entryCondition = document.getElementById('settings-entry-condition');
        const entryValue = document.getElementById('settings-entry-value');
        const exitCondition = document.getElementById('settings-exit-condition');
        const exitValue = document.getElementById('settings-exit-value');
        
        // Stop Loss e Take Profit
        const stopLossEnabled = document.getElementById('settings-stop-loss-enabled');
        const stopLossType = document.getElementById('settings-stop-loss-type');
        const stopLossValue = document.getElementById('settings-stop-loss-value');
        const takeProfitEnabled = document.getElementById('settings-take-profit-enabled');
        const takeProfitType = document.getElementById('settings-take-profit-type');
        const takeProfitValue = document.getElementById('settings-take-profit-value');
        
        // Criar objeto de novas configurações
        const newSettings = {
            whatsapp: {
                number: whatsappNumber ? whatsappNumber.value : this.currentSettings.whatsapp.number,
                notifyEntry: notifyEntry ? notifyEntry.checked : this.currentSettings.whatsapp.notifyEntry,
                notifyExit: notifyExit ? notifyExit.checked : this.currentSettings.whatsapp.notifyExit,
                notifyNews: notifyNews ? notifyNews.checked : this.currentSettings.whatsapp.notifyNews
            },
            indicators: {
                rsi: {
                    enabled: rsiEnabled ? rsiEnabled.checked : this.currentSettings.indicators.rsi.enabled,
                    period: rsiPeriod ? parseInt(rsiPeriod.value) : this.currentSettings.indicators.rsi.period,
                    overbought: rsiOverbought ? parseInt(rsiOverbought.value) : this.currentSettings.indicators.rsi.overbought,
                    oversold: rsiOversold ? parseInt(rsiOversold.value) : this.currentSettings.indicators.rsi.oversold
                }
            },
            tradingRules: {
                entry: {
                    condition: entryCondition ? entryCondition.value : this.currentSettings.tradingRules.entry.condition,
                    value: entryValue ? parseInt(entryValue.value) : this.currentSettings.tradingRules.entry.value
                },
                exit: {
                    condition: exitCondition ? exitCondition.value : this.currentSettings.tradingRules.exit.condition,
                    value: exitValue ? parseInt(exitValue.value) : this.currentSettings.tradingRules.exit.value
                },
                stopLoss: {
                    enabled: stopLossEnabled ? stopLossEnabled.checked : this.currentSettings.tradingRules.stopLoss.enabled,
                    type: stopLossType ? stopLossType.value : this.currentSettings.tradingRules.stopLoss.type,
                    value: stopLossValue ? parseFloat(stopLossValue.value) : this.currentSettings.tradingRules.stopLoss.value
                },
                takeProfit: {
                    enabled: takeProfitEnabled ? takeProfitEnabled.checked : this.currentSettings.tradingRules.takeProfit.enabled,
                    type: takeProfitType ? takeProfitType.value : this.currentSettings.tradingRules.takeProfit.type,
                    value: takeProfitValue ? parseFloat(takeProfitValue.value) : this.currentSettings.tradingRules.takeProfit.value
                }
            }
        };
        
        // Salvar novas configurações
        this.saveSettings(newSettings);
        
        // Fechar modal
        this.closeSettingsModal();
        
        // Notificar usuário
        alert('Configurações salvas com sucesso!');
    }
};

// Exportar o módulo
window.settingsManager = settingsManager;
