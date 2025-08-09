document.addEventListener('DOMContentLoaded', () => {
    // Configuração
    const TELEGRAM_BOT_TOKEN = '8429002910:AAEh0Ga1E5VInwSa1HSLs43k51ErxU5ezaI';
    const TELEGRAM_API_URL = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}`;
    
    let leads = [
        { 
            id: 1, 
            name: 'Ana Silva', 
            company: 'InovaTech', 
            status: 'mql', 
            score: 87, 
            hyperForm: 95, 
            stratForm: 50000, 
            verifyTM: 15000, 
            notes: 'Interesse em automação.', 
            nextAction: 'Agendar Reunião', 
            nextActionTarget: 'https://calendly.com/ana-silva', 
            telegramChatId: '598132858', 
            telegramUsername: '@FNWAdvisory', 
            conversation: [
                {sender: 'lead', text: 'Olá, gostaria de saber mais sobre seus serviços.', time: new Date().toLocaleTimeString(), source: 'telegram'},
                {sender: 'rosana', text: 'Olá Ana! Sou a assistente virtual da FNW. Como posso ajudá-la hoje?', time: new Date().toLocaleTimeString(), source: 'rosana'},
                {sender: 'agent', text: 'Oi Ana! Vi que você tem interesse em automação. Que tal agendar uma conversa?', time: new Date().toLocaleTimeString(), source: 'crm'}
            ]
        },
        { 
            id: 2, 
            name: 'Bruno Costa', 
            company: 'Nexus Log', 
            status: 'mql', 
            score: 72, 
            hyperForm: 60, 
            stratForm: 25000, 
            verifyTM: 5000, 
            notes: '', 
            nextAction: '', 
            nextActionTarget: '', 
            telegramChatId: '123456789', 
            telegramUsername: '@bruno_costa', 
            conversation: [
                {sender: 'lead', text: 'Vi um anúncio de vocês no LinkedIn.', time: new Date().toLocaleTimeString(), source: 'telegram'},
                {sender: 'rosana', text: 'Que ótimo, Bruno! Qual sua principal necessidade hoje?', time: new Date().toLocaleTimeString(), source: 'rosana'}
            ]
        },
        { 
            id: 3, 
            name: 'Carla Dias', 
            company: 'Saúde Farma', 
            status: 'sal', 
            score: 92, 
            hyperForm: 88, 
            stratForm: 120000, 
            verifyTM: 40000, 
            notes: 'Decisora final.', 
            nextAction: 'Ligar', 
            nextActionTarget: '+55 11 99999-8888', 
            telegramChatId: '456789123', 
            telegramUsername: '@carla_dias', 
            conversation: [
                {sender: 'rosana', text: 'Olá Carla, vi que baixou nosso e-book sobre gestão farmacêutica.', time: new Date().toLocaleTimeString(), source: 'rosana'},
                {sender: 'lead', text: 'Sim! Preciso muito organizar as vendas da farmácia.', time: new Date().toLocaleTimeString(), source: 'telegram'},
                {sender: 'system', text: 'Lead qualificado automaticamente pela Rosana.io', time: new Date().toLocaleTimeString(), source: 'system'}
            ]
        },
        { 
            id: 4, 
            name: 'Daniel Martins', 
            company: 'EducaMais', 
            status: 'sql', 
            score: 95, 
            hyperForm: 92, 
            stratForm: 85000, 
            verifyTM: 20000, 
            notes: 'Demo realizada.', 
            nextAction: 'Enviar Proposta', 
            nextActionTarget: 'daniel.martins@educamais.com', 
            telegramChatId: '789123456', 
            telegramUsername: '@daniel_martins', 
            conversation: [
                {sender: 'rosana', text: 'Daniel, sua demo foi agendada com sucesso!', time: new Date().toLocaleTimeString(), source: 'rosana'},
                {sender: 'agent', text: 'Ótimo, Daniel! O próximo passo é uma conversa com um especialista.', time: new Date().toLocaleTimeString(), source: 'crm'},
                {sender: 'system', text: 'Reunião agendada via Calendly.', time: new Date().toLocaleTimeString(), source: 'system'}
            ]
        }
    ];
    
    let activeLeadId = null;
    let deletedLead = null;
    let undoTimeout = null;
    let lastUpdateId = 0;

    const columns = {
        mql: { title: 'MQL', definition: 'Marketing Qualified' },
        sal: { title: 'SAL', definition: 'Sales Accepted' },
        sql: { title: 'SQL', definition: 'Sales Qualified' },
        pql: { title: 'PQL', definition: 'Product Qualified' }
    };

    // Elementos DOM
    const kanbanBoard = document.getElementById('kanbanBoard');
    const leadFormModal = document.getElementById('leadFormModal');
    const formModalCloseBtn = document.getElementById('formModalCloseBtn');
    const leadForm = document.getElementById('leadForm');
    const addLeadBtn = document.getElementById('addLeadBtn');
    const undoBtn = document.getElementById('undoBtn');
    const chatHeader = document.getElementById('chatHeader');
    const chatArea = document.getElementById('chatArea');
    const messageInput = document.getElementById('messageInput');
    const sendBtn = document.getElementById('sendBtn');

    // Utilitários
    const formatCurrency = (value) => {
        if (typeof value !== 'number' || isNaN(value)) return 'N/A';
        return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    };

    const showToast = (message, type = 'success') => {
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.innerHTML = `<i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'exclamation-triangle'}"></i> ${message}`;
        document.body.appendChild(toast);
        
        setTimeout(() => toast.classList.add('show'), 100);
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => document.body.removeChild(toast), 300);
        }, 3000);
    };

    // Função para enviar mensagem via Telegram API
    const sendTelegramMessage = async (chatId, message) => {
        try {
            const response = await fetch(`${TELEGRAM_API_URL}/sendMessage`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    chat_id: chatId,
                    text: message,
                    parse_mode: 'HTML'
                })
            });
            
            const result = await response.json();
            if (result.ok) {
                showToast('Mensagem enviada via Telegram!', 'success');
                return true;
            } else {
                showToast(`Erro ao enviar: ${result.description}`, 'error');
                return false;
            }
        } catch (error) {
            showToast(`Erro de conexão: ${error.message}`, 'error');
            return false;
        }
    };

    // Função para buscar mensagens do Telegram
    const getTelegramUpdates = async () => {
        try {
            const response = await fetch(`${TELEGRAM_API_URL}/getUpdates?offset=${lastUpdateId + 1}`);
            const result = await response.json();
            
            if (result.ok && result.result.length > 0) {
                result.result.forEach(update => {
                    if (update.message && update.message.text) {
                        const chatId = update.message.chat.id.toString();
                        const text = update.message.text;
                        const senderName = update.message.from.first_name;
                        
                        // Encontrar lead correspondente
                        const lead = leads.find(l => l.telegramChatId === chatId);
                        if (lead) {
                            lead.conversation.push({
                                sender: 'lead',
                                text: text,
                                time: new Date().toLocaleTimeString(),
                                source: 'telegram'
                            });
                            
                            // Destacar card com nova mensagem
                            const leadCard = document.querySelector(`[data-lead-id="${lead.id}"]`);
                            if (leadCard) {
                                leadCard.classList.add('new-message');
                                setTimeout(() => leadCard.classList.remove('new-message'), 5000);
                            }
                            
                            // Se este lead está ativo, atualizar o chat
                            if (activeLeadId === lead.id) {
                                renderChat(lead.id);
                            }
                            
                            showToast(`Nova mensagem de ${lead.name}!`, 'success');
                        }
                        
                        lastUpdateId = update.update_id;
                    }
                });
            }
        } catch (error) {
            console.error('Erro ao buscar atualizações:', error);
        }
    };

    // Função para simular webhook da Rosana.io
    const simulateRosanaWebhook = () => {
        // Simular mensagem da Rosana.io a cada 30 segundos
        setInterval(() => {
            if (leads.length > 0 && Math.random() > 0.7) {
                const randomLead = leads[Math.floor(Math.random() * leads.length)];
                const rosanaMessages = [
                    'Como posso ajudá-lo hoje?',
                    'Gostaria de agendar uma demonstração?',
                    'Tem alguma dúvida sobre nossos serviços?',
                    'Posso conectá-lo com um especialista.',
                    'Que tal conhecer nossos cases de sucesso?'
                ];
                
                const randomMessage = rosanaMessages[Math.floor(Math.random() * rosanaMessages.length)];
                
                randomLead.conversation.push({
                    sender: 'rosana',
                    text: randomMessage,
                    time: new Date().toLocaleTimeString(),
                    source: 'rosana'
                });
                
                // Destacar card
                const leadCard = document.querySelector(`[data-lead-id="${randomLead.id}"]`);
                if (leadCard) {
                    leadCard.classList.add('new-message');
                    setTimeout(() => leadCard.classList.remove('new-message'), 5000);
                }
                
                // Atualizar chat se ativo
                if (activeLeadId === randomLead.id) {
                    renderChat(randomLead.id);
                }
                
                showToast(`Rosana.io respondeu para ${randomLead.name}`, 'success');
            }
        }, 30000);
    };

    // Polling para novas mensagens a cada 5 segundos
    setInterval(getTelegramUpdates, 5000);
    
    // Iniciar simulação da Rosana.io
    simulateRosanaWebhook();

    const updateUndoButton = () => {
        if (deletedLead) {
            undoBtn.disabled = false;
            undoBtn.classList.add('active');
            undoBtn.innerHTML = `<i class="fas fa-undo"></i> Desfazer: ${deletedLead.name}`;
        } else {
            undoBtn.disabled = true;
            undoBtn.classList.remove('active');
            undoBtn.innerHTML = `<i class="fas fa-undo"></i> Desfazer Exclusão`;
        }
    };

    const deleteLead = (leadId) => {
        const leadIndex = leads.findIndex(l => l.id === leadId);
        if (leadIndex === -1) return;

        deletedLead = { ...leads[leadIndex] };
        leads.splice(leadIndex, 1);
        
        if (undoTimeout) {
            clearTimeout(undoTimeout);
        }
        
        undoTimeout = setTimeout(() => {
            deletedLead = null;
            updateUndoButton();
            showToast('Exclusão permanente confirmada', 'warning');
        }, 30000);

        if (activeLeadId === leadId) {
            activeLeadId = null;
            chatHeader.textContent = 'Selecione um Lead';
            chatArea.innerHTML = '';
            messageInput.disabled = true;
            sendBtn.disabled = true;
        }

        updateUndoButton();
        renderBoard();
        showToast(`Lead "${deletedLead.name}" excluído. Você tem 30 segundos para desfazer.`, 'warning');
    };

    const undoDelete = () => {
        if (!deletedLead) return;

        leads.push(deletedLead);
        showToast(`Lead "${deletedLead.name}" restaurado com sucesso!`, 'success');
        
        if (undoTimeout) {
            clearTimeout(undoTimeout);
            undoTimeout = null;
        }
        
        deletedLead = null;
        updateUndoButton();
        renderBoard();
    };

    const renderBoard = () => {
        kanbanBoard.innerHTML = '';
        for (const columnKey in columns) {
            const columnData = columns[columnKey];
            const columnEl = document.createElement('div');
            columnEl.className = 'kanban-column';
            columnEl.dataset.columnKey = columnKey;
            const leadsInColumn = leads.filter(lead => lead.status === columnKey);
            columnEl.innerHTML = `
                <div class="column-header">
                    <div class="column-title-group">
                        <div><h2>${columnData.title}</h2><div class="acronym-definition">${columnData.definition} Lead</div></div>
                    </div>
                    <span class="lead-count">${leadsInColumn.length}</span>
                </div>
                <div class="leads-container"></div>`;
            const leadsContainer = columnEl.querySelector('.leads-container');
            leadsInColumn.forEach(lead => {
                const leadCard = createLeadCard(lead);
                leadsContainer.appendChild(leadCard);
            });
            kanbanBoard.appendChild(columnEl);
        }
        addEventListeners();
        if(activeLeadId) {
            document.querySelector(`[data-lead-id="${activeLeadId}"]`)?.classList.add('active');
        }
    };

    const createLeadCard = (lead) => {
        const card = document.createElement('div');
        card.className = 'lead-card';
        card.draggable = true;
        card.dataset.leadId = lead.id;
        
        let nextActionHTML = '';
        if (lead.nextAction && lead.nextActionTarget) {
            nextActionHTML = `<div class="next-action-summary"><i class="fas fa-robot"></i> <strong>${lead.nextAction} para:</strong> <span class="action-target">${lead.nextActionTarget}</span></div>`;
        }

        let telegramHTML = '';
        if (lead.telegramChatId) {
            telegramHTML = `<div class="telegram-id"><i class="fab fa-telegram-plane"></i> ${lead.telegramUsername || lead.telegramChatId}</div>`;
        }

        card.innerHTML = `
            <div class="lead-card-header">
                <h3>${lead.name}</h3>
                <div class="lead-card-actions">
                    <button class="edit-lead-btn" title="Editar Lead"><i class="fas fa-edit"></i></button>
                    <button class="delete-lead-btn" title="Excluir Lead"><i class="fas fa-trash"></i></button>
                </div>
            </div>
            <p>${lead.company}</p>
            <div class="lead-score"><i class="fas fa-bolt"></i><span>Score:</span><span class="score-value">${lead.score}%</span></div>
            <div class="value-metrics">
                <div class="metric-item"><span class="metric-label"><i class="fas fa-chart-line"></i> HyperForm</span><span class="metric-value">${lead.hyperForm || 'N/A'}</span></div>
                <div class="metric-item"><span class="metric-label"><i class="fas fa-dollar-sign"></i> StratForm</span><span class="metric-value">${formatCurrency(lead.stratForm)}</span></div>
                <div class="metric-item"><span class="metric-label"><i class="fas fa-plus-circle"></i> VerifyTM</span><span class="metric-value">${formatCurrency(lead.verifyTM)}</span></div>
            </div>
            ${telegramHTML}
            ${nextActionHTML}`;
        return card;
    };

    const renderChat = (leadId) => {
        const lead = leads.find(l => l.id === leadId);
        if (!lead) {
            chatHeader.textContent = 'Selecione um Lead';
            chatArea.innerHTML = '';
            messageInput.disabled = true;
            sendBtn.disabled = true;
            return;
        }
        
        activeLeadId = leadId;
        chatHeader.textContent = `${lead.name} ${lead.telegramUsername ? lead.telegramUsername : ''}`;
        chatArea.innerHTML = '';
        
        lead.conversation.forEach(msg => {
            const bubble = document.createElement('div');
            bubble.className = `chat-bubble bubble-${msg.sender}`;
            
            let sourceIcon = '';
            switch(msg.source) {
                case 'telegram': sourceIcon = '<i class="fab fa-telegram-plane"></i>'; break;
                case 'rosana': sourceIcon = '<i class="fas fa-robot"></i>'; break;
                case 'crm': sourceIcon = '<i class="fas fa-user-tie"></i>'; break;
                case 'system': sourceIcon = '<i class="fas fa-cog"></i>'; break;
            }
            
            bubble.innerHTML = `
                <div>${msg.text}</div>
                <div class="message-time">${msg.time}</div>
                <div class="message-source">${sourceIcon} ${msg.source || 'sistema'}</div>
            `;
            chatArea.appendChild(bubble);
        });
        
        chatArea.scrollTop = chatArea.scrollHeight;
        
        // Habilitar input se tiver chat ID
        if (lead.telegramChatId) {
            messageInput.disabled = false;
            sendBtn.disabled = false;
            messageInput.placeholder = `Enviar mensagem para ${lead.name}...`;
        } else {
            messageInput.disabled = true;
            sendBtn.disabled = true;
            messageInput.placeholder = 'Chat ID não configurado';
        }
        
        document.querySelectorAll('.lead-card').forEach(c => c.classList.remove('active'));
        document.querySelector(`[data-lead-id="${leadId}"]`)?.classList.add('active');
    };

    const sendMessage = async () => {
        const message = messageInput.value.trim();
        if (!message || !activeLeadId) return;

        const lead = leads.find(l => l.id === activeLeadId);
        if (!lead || !lead.telegramChatId) {
            showToast('Chat ID não configurado para este lead', 'error');
            return;
        }

        // Adicionar mensagem localmente primeiro
        lead.conversation.push({
            sender: 'agent',
            text: message,
            time: new Date().toLocaleTimeString(),
            source: 'crm'
        });

        // Atualizar interface
        renderChat(activeLeadId);
        messageInput.value = '';

        // Enviar via Telegram API
        const success = await sendTelegramMessage(lead.telegramChatId, message);
        
        if (!success) {
            // Se falhou, remover a mensagem local
            lead.conversation.pop();
            renderChat(activeLeadId);
        }
    };
    
    const openLeadFormModal = (leadId = null) => {
        leadForm.reset();
        const statusSelect = document.getElementById('leadStatus');
        statusSelect.innerHTML = '<option value="">Selecione o status</option>';
        for (const key in columns) {
            const option = document.createElement('option');
            option.value = key;
            option.textContent = columns[key].title;
            statusSelect.appendChild(option);
        }

        if (leadId) {
            const lead = leads.find(l => l.id === leadId);
            document.getElementById('formModalTitle').innerHTML = '<i class="fas fa-user-edit"></i> Editar Lead';
            document.getElementById('leadId').value = lead.id;
            document.getElementById('leadName').value = lead.name;
            document.getElementById('leadCompany').value = lead.company;
            document.getElementById('leadScore').value = lead.score;
            document.getElementById('leadStatus').value = lead.status;
            document.getElementById('telegramChatId').value = lead.telegramChatId || '';
            document.getElementById('telegramUsername').value = lead.telegramUsername || '';
            document.getElementById('hyperForm').value = lead.hyperForm || '';
            document.getElementById('stratForm').value = lead.stratForm || '';
            document.getElementById('verifyTM').value = lead.verifyTM || '';
            document.getElementById('nextActionSelect').value = lead.nextAction || '';
            document.getElementById('nextActionTarget').value = lead.nextActionTarget || '';
            document.getElementById('leadNotes').value = lead.notes || '';
        } else {
            document.getElementById('formModalTitle').innerHTML = '<i class="fas fa-user-plus"></i> Adicionar Novo Lead';
            document.getElementById('leadId').value = '';
        }
        updateActionTargetInput();
        leadFormModal.classList.add('visible');
    };
    
    const updateActionTargetInput = () => {
        const action = document.getElementById('nextActionSelect').value;
        const targetInput = document.getElementById('nextActionTarget');
        switch(action) {
            case 'Ligar': 
                targetInput.type = 'tel'; 
                targetInput.placeholder = '+55 11 99999-8888'; 
                break;
            case 'Agendar Reunião': 
                targetInput.type = 'url'; 
                targetInput.placeholder = 'https://calendly.com/seu-link'; 
                break;
            case 'Enviar Proposta': 
            case 'Follow-up': 
                targetInput.type = 'email'; 
                targetInput.placeholder = 'exemplo@email.com'; 
                break;
            default: 
                targetInput.type = 'text'; 
                targetInput.placeholder = 'Preencha após escolher a ação';
        }
    };

    const saveLead = (e) => {
        e.preventDefault();
        const id = document.getElementById('leadId').value;
        const leadData = {
            name: document.getElementById('leadName').value,
            company: document.getElementById('leadCompany').value,
            score: parseInt(document.getElementById('leadScore').value),
            status: document.getElementById('leadStatus').value,
            telegramChatId: document.getElementById('telegramChatId').value,
            telegramUsername: document.getElementById('telegramUsername').value,
            hyperForm: parseInt(document.getElementById('hyperForm').value) || 0,
            stratForm: parseFloat(document.getElementById('stratForm').value) || 0,
            verifyTM: parseFloat(document.getElementById('verifyTM').value) || 0,
            notes: document.getElementById('leadNotes').value,
            nextAction: document.getElementById('nextActionSelect').value,
            nextActionTarget: document.getElementById('nextActionTarget').value,
        };

        let lead;
        if (id) {
            const index = leads.findIndex(l => l.id == id);
            if (index > -1) {
                leads[index] = { ...leads[index], ...leadData };
                lead = leads[index];
                showToast(`Lead "${lead.name}" atualizado com sucesso!`, 'success');
            }
        } else {
            leadData.id = new Date().getTime();
            leadData.conversation = [{
                sender: 'system', 
                text: 'Lead criado manualmente no CRM.', 
                time: new Date().toLocaleTimeString(),
                source: 'system'
            }];
            leads.push(leadData);
            lead = leadData;
            showToast(`Lead "${lead.name}" criado com sucesso!`, 'success');
        }
        
        if (lead && lead.nextAction && lead.nextActionTarget) {
            const systemMessage = `Comando: ${lead.nextAction} para ${lead.nextActionTarget}.`;
            if (!lead.conversation.some(msg => msg.text === systemMessage)) {
                lead.conversation.push({
                    sender: 'system', 
                    text: systemMessage, 
                    time: new Date().toLocaleTimeString(),
                    source: 'system'
                });
            }
            renderChat(lead.id);
        }

        leadFormModal.classList.remove('visible');
        renderBoard();
    };
    
    const addEventListeners = () => {
        document.querySelectorAll('.lead-card').forEach(card => {
            card.addEventListener('dragstart', e => { 
                e.stopPropagation(); 
                card.classList.add('dragging'); 
                e.dataTransfer.setData('text/plain', card.dataset.leadId); 
            });
            card.addEventListener('dragend', (e) => { 
                e.stopPropagation(); 
                card.classList.remove('dragging'); 
            });
            card.addEventListener('click', (e) => { 
                if (!e.target.closest('.lead-card-actions')) {
                    e.stopPropagation(); 
                    renderChat(parseInt(card.dataset.leadId)); 
                }
            });
            
            card.querySelector('.edit-lead-btn').addEventListener('click', (e) => { 
                e.stopPropagation(); 
                openLeadFormModal(parseInt(card.dataset.leadId));
            });
            
            card.querySelector('.delete-lead-btn').addEventListener('click', (e) => { 
                e.stopPropagation(); 
                const leadId = parseInt(card.dataset.leadId);
                const lead = leads.find(l => l.id === leadId);
                if (confirm(`Tem certeza que deseja excluir o lead "${lead.name}"?`)) {
                    deleteLead(leadId);
                }
            });
        });

        document.querySelectorAll('.kanban-column').forEach(column => {
            column.addEventListener('dragover', e => { e.preventDefault(); });
            column.addEventListener('drop', e => {
                e.preventDefault();
                const leadId = parseInt(e.dataTransfer.getData('text/plain'));
                const newStatus = column.dataset.columnKey;
                const lead = leads.find(l => l.id === leadId);
                if (lead && lead.status !== newStatus) {
                    lead.status = newStatus;
                    const systemMessage = `Status alterado para ${newStatus.toUpperCase()}.`;
                    lead.conversation.push({
                        sender: 'system', 
                        text: systemMessage, 
                        time: new Date().toLocaleTimeString(),
                        source: 'system'
                    });
                    renderBoard();
                    renderChat(leadId);
                    showToast(`Lead "${lead.name}" movido para ${columns[newStatus].title}`, 'success');
                }
            });
        });
    };

    // Event Listeners
    addLeadBtn.addEventListener('click', () => openLeadFormModal());
    undoBtn.addEventListener('click', undoDelete);
    formModalCloseBtn.addEventListener('click', () => leadFormModal.classList.remove('visible'));
    document.getElementById('nextActionSelect').addEventListener('change', updateActionTargetInput);
    leadForm.addEventListener('submit', saveLead);
    
    sendBtn.addEventListener('click', sendMessage);
    messageInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    });
    
    // Inicializar
    renderBoard();
    updateUndoButton();
    if(leads.length > 0) {
        renderChat(leads[0].id);
    }

    // Buscar mensagens iniciais
    getTelegramUpdates();
});