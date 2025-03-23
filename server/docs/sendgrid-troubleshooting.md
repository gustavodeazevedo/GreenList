# Solução de Problemas do SendGrid

Este documento fornece instruções detalhadas para resolver problemas comuns encontrados ao usar o SendGrid para envio de emails no GreenList.

## Problemas Comuns e Soluções

### 1. Email Remetente Não Verificado

**Sintoma:** Os emails não são enviados e você vê erros relacionados a "sender identity" ou "verified sender".

**Solução:**

1. Acesse o [painel do SendGrid](https://app.sendgrid.com/)
2. Navegue para **Settings > Sender Authentication**
3. Verifique se o email configurado em `EMAIL_FROM` está na lista e se está verificado
4. Se não estiver, clique em **Verify a Single Sender**
5. Preencha o formulário com as informações do remetente
6. Siga as instruções para verificar o email (você receberá um email com um link de verificação)
7. Após verificar, tente enviar o email novamente

### 2. API Key Inválida ou Sem Permissões

**Sintoma:** Erros relacionados a "api key", "authorization" ou "forbidden".

**Solução:**

1. Acesse o [painel do SendGrid](https://app.sendgrid.com/)
2. Navegue para **Settings > API Keys**
3. Verifique se a API key atual está ativa
4. Crie uma nova API key:
   - Clique em **Create API Key**
   - Dê um nome como "GreenList Email Service"
   - Selecione **Restricted Access** e garanta que tenha permissão **Mail Send**
   - Clique em **Create & View**
5. Copie a nova API key e atualize o arquivo `.env`:
   ```
   SENDGRID_API_KEY=sua_nova_api_key
   ```
6. Reinicie o servidor e teste novamente

### 3. Limite de Taxa Excedido (Rate Limit)

**Sintoma:** Erros com código 429 ou mensagens sobre "too many requests" ou "rate limit exceeded".

**Solução:**

1. Reduza a frequência de envio de emails
2. Implemente um sistema de fila para distribuir os envios ao longo do tempo
3. Considere atualizar para um plano pago do SendGrid se estiver usando o plano gratuito
4. Verifique se há loops infinitos ou código que possa estar enviando emails repetidamente

### 4. Problemas de Conteúdo do Email

**Sintoma:** Emails são rejeitados devido ao conteúdo.

**Solução:**

1. Verifique se o HTML do email está bem formado
2. Evite palavras que possam acionar filtros de spam
3. Certifique-se de que todos os links no email são válidos
4. Teste o email com ferramentas de validação de email

## Como Executar o Script de Teste

Para diagnosticar problemas com o SendGrid, use o script de teste incluído:

```bash
node server/utils/sendgridTest.js [email_de_teste]
```

Se não fornecer um email de teste, o script usará o email configurado em `EMAIL_FROM`.

## Verificando Logs

Os logs do servidor contêm informações detalhadas sobre erros do SendGrid. Procure por:

```
SendGrid error
SendGrid error details
```

Esses logs incluirão códigos de erro e mensagens que podem ajudar a identificar o problema específico.

## Recursos Adicionais

- [Documentação do SendGrid](https://docs.sendgrid.com/)
- [Guia de Solução de Problemas do SendGrid](https://docs.sendgrid.com/ui/account-and-settings/troubleshooting-delays-and-latency)
- [Fórum da Comunidade SendGrid](https
