// Função para processar webhooks da Rosana.io
export default async function handler(req, res) {
    // Configurar CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    // Responder OPTIONS para CORS preflight
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    // Apenas aceitar POST
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Método não permitido' });
    }

    try {
        const webhookData = req.body;
        
        // Log do webhook recebido
        console.log('Webhook recebido da Rosana.io:', JSON.stringify(webhookData, null, 2));

        // Estrutura esperada do webhook da Rosana.io
        const {
            chatId,
            message,
            userName,
            userPhone,
            intent,
            timestamp,
            source = 'rosana'
        } = webhookData;

        // Validar dados obrigatórios
        if (!chatId || !message) {
            return res.status(400).json({ 
                error: 'Dados obrigatórios ausentes',
                required: ['chatId', 'message']
            });
        }

        // Processar mensagem
        const processedMessage = {
            chatId: chatId.toString(),
            text: message,
            sender: 'rosana',
            userName: userName || 'Usuário',
            userPhone: userPhone || null,
            intent: intent || 'unknown',
            timestamp: timestamp || new Date().toISOString(),
            source: source,
            time: new Date().toLocaleTimeString('pt-BR')
        };

        console.log('Mensagem processada:', processedMessage);

        // Resposta de sucesso para a Rosana.io
        return res.status(200).json({
            success: true,
            message: 'Webhook processado com sucesso',
            data: {
                chatId: processedMessage.chatId,
                processed: true,
                timestamp: new Date().toISOString()
            }
        });

    } catch (error) {
        console.error('Erro ao processar webhook:', error);
        
        return res.status(500).json({
            success: false,
            error: 'Erro interno do servidor',
            message: error.message
        });
    }
}
