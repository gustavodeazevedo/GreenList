/**
 * Utilitário para testar a configuração do SendGrid
 * 
 * Como usar:
 * 1. Certifique-se de que as variáveis de ambiente estão configuradas (.env)
 * 2. Execute: node utils/sendgridTest.js
 */

import dotenv from 'dotenv';
import sgMail from '@sendgrid/mail';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs';

// Configurar variáveis de ambiente
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const envPath = join(__dirname, '..', '.env');

dotenv.config({ path: envPath });

// Verificar se as variáveis necessárias estão definidas
const requiredVars = ['SENDGRID_API_KEY', 'EMAIL_FROM'];
const missingVars = requiredVars.filter(varName => !process.env[varName]);

if (missingVars.length > 0) {
    console.error(`❌ Erro: Variáveis de ambiente ausentes: ${missingVars.join(', ')}`);
    process.exit(1);
}

// Configurar SendGrid
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

// Função para testar o envio de email
async function testSendEmail() {
    const testEmail = process.argv[2] || process.env.EMAIL_FROM;

    if (!testEmail) {
        console.error('❌ Erro: Forneça um email de teste como argumento ou defina EMAIL_FROM no .env');
        process.exit(1);
    }

    console.log(`🔍 Verificando configuração do SendGrid...`);
    console.log(`📧 Remetente: ${process.env.EMAIL_FROM}`);
    console.log(`🔑 API Key: ${process.env.SENDGRID_API_KEY.substring(0, 10)}...`);

    const msg = {
        to: testEmail,
        from: process.env.EMAIL_FROM,
        subject: 'Teste de Configuração do SendGrid - GreenList',
        html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background-color: #4CAF50; padding: 20px; text-align: center;">
                <h1 style="color: white; margin: 0;">GreenList</h1>
            </div>
            <div style="padding: 20px; border: 1px solid #e9e9e9; border-top: none;">
                <h2>Teste de Configuração do SendGrid</h2>
                <p>Este é um email de teste para verificar a configuração do SendGrid.</p>
                <p>Se você está recebendo este email, a configuração está funcionando corretamente!</p>
                <p>Detalhes da configuração:</p>
                <ul>
                    <li>Remetente: ${process.env.EMAIL_FROM}</li>
                    <li>Data/Hora: ${new Date().toLocaleString()}</li>
                </ul>
                <p>Obrigado,<br>Equipe GreenList</p>
            </div>
        </div>
        `
    };

    try {
        console.log(`📤 Enviando email de teste para ${testEmail}...`);
        const response = await sgMail.send(msg);

        console.log(`✅ Email enviado com sucesso!`);
        console.log(`📊 Status: ${response[0].statusCode}`);
        console.log(`🔗 ID da mensagem: ${response[0].headers['x-message-id']}`);
        return true;
    } catch (error) {
        console.error('❌ Erro ao enviar email:');
        console.error(error);

        if (error.response) {
            console.error('📝 Detalhes do erro:');
            console.error(JSON.stringify(error.response.body, null, 2));

            // Verificar problemas comuns
            const errors = error.response.body.errors || [];

            // Verificar problema de verificação de remetente
            if (errors.some(err =>
                err.message?.includes('sender identity') ||
                err.message?.includes('verified')
            )) {
                console.error('\n🚨 PROBLEMA DETECTADO: O email remetente não está verificado no SendGrid.');
                console.error(`\n📋 SOLUÇÃO: Acesse o painel do SendGrid e verifique o email ${process.env.EMAIL_FROM}.`);
                console.error('1. Faça login no SendGrid');
                console.error('2. Vá para Settings > Sender Authentication');
                console.error('3. Verifique se o email está na lista e se está verificado');
                console.error('4. Se não estiver, adicione-o e siga o processo de verificação');
            }

            // Verificar problema de API key
            if (errors.some(err =>
                err.message?.includes('api key') ||
                err.message?.includes('authorization')
            )) {
                console.error('\n🚨 PROBLEMA DETECTADO: A API key parece ser inválida ou não ter permissões suficientes.');
                console.error('\n📋 SOLUÇÃO: Verifique sua API key no painel do SendGrid.');
                console.error('1. Faça login no SendGrid');
                console.error('2. Vá para Settings > API Keys');
                console.error('3. Crie uma nova API key com permissões de "Mail Send"');
                console.error('4. Atualize o arquivo .env com a nova API key');
            }
        }

        return false;
    }
}

// Executar o teste
testSendEmail().then(success => {
    if (success) {
        console.log('\n✨ Teste concluído com sucesso! A configuração do SendGrid está funcionando corretamente.');
    } else {
        console.error('\n❌ Teste falhou. Verifique os erros acima para solucionar o problema.');
    }
});