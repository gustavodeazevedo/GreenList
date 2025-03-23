# Configuração de Variáveis de Ambiente no Render

Este documento fornece instruções detalhadas para configurar corretamente as variáveis de ambiente no serviço Render para a aplicação GreenList.

## Variáveis de Ambiente Necessárias

| Variável           | Descrição                                | Exemplo                                                          |
| ------------------ | ---------------------------------------- | ---------------------------------------------------------------- |
| `PORT`             | Porta em que o servidor será executado   | `5000`                                                           |
| `MONGODB_URI`      | String de conexão com o MongoDB          | `mongodb+srv://username:password@cluster.mongodb.net/greenlist?` |
| `JWT_SECRET`       | Chave secreta para geração de tokens JWT | `greenlist_secure_jwt_secret_key_2023`                           |
| `FRONTEND_URL`     | URL do frontend em produção              | `https://green-list.vercel.app`                                  |
| `SENDGRID_API_KEY` | Chave de API do SendGrid                 | `SG.xxxxxxxxxxxxxxxxxxxx`                                        |
| `EMAIL_FROM`       | Email verificado no SendGrid             | `contato.greenlist@outlook.com.br`                               |

## Instruções de Configuração

### 1. FRONTEND_URL

- **Importante**: No ambiente de produção, esta variável deve apontar para a URL do seu frontend implantado, não para localhost.
- **Correto**: `https://green-list.vercel.app`
- **Incorreto**: `http://localhost:5173`

### 2. SENDGRID_API_KEY

- Obtenha sua API key em: https://app.sendgrid.com/settings/api_keys
- Substitua o placeholder `your_sendgrid_api_key_here` pela chave real
- A chave deve começar com `SG.` seguido por uma string alfanumérica

### 3. EMAIL_FROM

- Este email **DEVE** estar verificado no SendGrid
- Verifique em: https://app.sendgrid.com/settings/sender_auth
- Recomendamos usar um email profissional associado ao seu domínio ou serviço

## Verificando a Configuração

Após configurar as variáveis de ambiente no Render:

1. Reimplante seu aplicativo para aplicar as alterações
2. Verifique os logs do servidor para confirmar que a conexão com o MongoDB e outras configurações estão funcionando
3. Teste a funcionalidade de redefinição de senha para verificar se o SendGrid está configurado corretamente

## Solução de Problemas

Se encontrar problemas com o envio de emails:

1. Verifique se o email remetente está verificado no SendGrid
2. Confirme se a API key do SendGrid está ativa e tem as permissões corretas
3. Verifique os logs do servidor para mensagens de erro específicas
4. Execute o utilitário de teste do SendGrid localmente para diagnosticar problemas:
   ```
   node server/utils/sendgridTest.js seu_email@exemplo.com
   ```

## Lembre-se

- Nunca compartilhe suas chaves de API ou segredos
- Mantenha suas variáveis de ambiente atualizadas quando mudar serviços ou configurações
- Considere usar variáveis de ambiente diferentes para ambientes de desenvolvimento, teste e produção
