# FNW CRM v1.3 - Sistema Integrado com Rosana.io + Telegram

## 🚀 Funcionalidades

### ✅ CRM Completo
- **Kanban Board** com 4 estágios (MQL, SAL, SQL, PQL)
- **Gestão de Leads** com métricas de valor
- **Drag & Drop** entre colunas
- **Sistema de exclusão** com reversão (30s)
- **Notificações toast** para feedback

### ✅ Integração Telegram
- **Bot real** conectado via API
- **Envio/recebimento** de mensagens
- **Polling automático** para novas mensagens
- **Chat IDs** configuráveis por lead

### ✅ Integração Rosana.io
- **Webhook endpoint** para receber dados
- **Simulação de IA** com respostas automáticas
- **Identificação de origem** das mensagens
- **Sistema híbrido** de conversas

### ✅ Interface Moderna
- **Design responsivo** para todos os dispositivos
- **Tema escuro** profissional
- **Animações suaves** e feedback visual
- **Status badges** para integrações ativas

## 🔧 Deploy no Vercel

### 1. Preparar Repositório
```bash
# Criar repositório no GitHub
git init
git add .
git commit -m "CRM v1.3 - Integração Rosana.io + Telegram"
git branch -M main
git remote add origin https://github.com/SEU_USUARIO/fnw-crm.git
git push -u origin main
```

### 2. Deploy no Vercel
1. Acesse [vercel.com](https://vercel.com)
2. Faça login com GitHub
3. Clique **"New Project"**
4. Selecione seu repositório
5. Clique **"Deploy"**

### 3. URLs Resultantes
- **Site:** `https://seu-projeto.vercel.app`
- **Webhook:** `https://seu-projeto.vercel.app/api/webhook`

## ⚙️ Configuração da Rosana.io

### 1. Criar Nova Intenção
- **Intenção:** "Enviar dados para CRM"
- **Trigger:** Qualquer mensagem recebida
- **Ação:** Chamar Webhook

### 2. Configurar Webhook
- **URL:** `https://seu-projeto.vercel.app/api/webhook`
- **Método:** POST
- **Headers:** `Content-Type: application/json`

### 3. Payload Sugerido
```json
{
  "chatId": "{{user.telegram_id}}",
  "message": "{{message.text}}",
  "userName": "{{user.name}}",
  "userPhone": "{{user.phone}}",
  "intent": "{{intent.name}}",
  "timestamp": "{{timestamp}}",
  "source": "rosana"
}
```

## 🔑 Configuração do Telegram

### 1. Token do Bot
- Já configurado: `8429002910:AAEh0Ga1E5VInwSa1HSLs43k51ErxU5ezaI`
- Para usar seu próprio bot, edite `app.js`

### 2. Chat IDs
- Configure o Chat ID real no formulário de leads
- Seu Chat ID: `598132858`
- Username: `@FNWAdvisory`

## 📱 Como Usar

### 1. Adicionar Leads
- Clique **"Adicionar Lead"**
- Preencha informações básicas
- Configure **Chat ID do Telegram**
- Adicione métricas de valor

### 2. Gerenciar Conversas
- **Clique no lead** para abrir chat
- **Digite mensagens** no campo inferior
- **Arraste leads** entre colunas do Kanban

### 3. Monitorar Integrações
- **Status badges** mostram integrações ativas
- **Animações** indicam novas mensagens
- **Notificações** confirmam ações

## 🔄 Fluxo de Integração

### Telegram → CRM
1. **Usuário envia** mensagem no Telegram
2. **Polling** busca novas mensagens (5s)
3. **CRM atualiza** conversa automaticamente
4. **Card pisca** indicando nova mensagem

### Rosana.io → CRM
1. **Rosana.io processa** mensagem do usuário
2. **Webhook** envia dados para CRM
3. **CRM recebe** e processa informações
4. **Conversa atualizada** em tempo real

### CRM → Telegram
1. **Usuário digita** no CRM
2. **Mensagem enviada** via API do Telegram
3. **Confirmação** via notificação toast
4. **Conversa atualizada** localmente

## 🛠️ Estrutura de Arquivos

```
fnw-crm/
├── index.html          # Interface principal
├── app.js             # Lógica do CRM
├── api/
│   └── webhook.js     # Endpoint para Rosana.io
├── vercel.json        # Configuração do Vercel
└── README.md          # Documentação
```

## 🎯 Próximas Versões

### v1.4 - Analytics
- Dashboard de métricas
- Relatórios de conversão
- Análise de performance

### v1.5 - Automação
- Respostas automáticas
- Workflows personalizados
- Integração com calendários

### v1.6 - Multi-canal
- WhatsApp Business
- Facebook Messenger
- SMS via Twilio

## 🆘 Suporte

### Problemas Comuns
1. **Webhook não funciona:** Verifique URL no painel Rosana.io
2. **Telegram não conecta:** Confirme Chat ID correto
3. **Deploy falha:** Verifique estrutura de arquivos

### Logs e Debug
- **Vercel Functions:** Acesse logs no dashboard
- **Console do navegador:** Para erros de frontend
- **Network tab:** Para problemas de API

---

**Desenvolvido por FNW Advisory** 🚀
**Versão 1.3 - Sistema Integrado**