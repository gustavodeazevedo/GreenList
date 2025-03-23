/**
 * Utilitário para gerenciar requisições com retry e cache
 */

// Cache para armazenar timestamps de requisições por email
const requestCache = {};

// Configurações padrão
const DEFAULT_CONFIG = {
    maxRetries: 3,
    initialDelayMs: 1000,
    maxDelayMs: 10000,
    cacheExpiryMs: 60000, // 1 minuto
};

/**
 * Verifica se um email está em cooldown (para evitar spam)
 * @param {string} email - Email para verificar
 * @param {number} cooldownMs - Tempo de cooldown em milissegundos
 * @returns {Object} - Objeto com status e tempo restante
 */
export const checkEmailCooldown = (email, cooldownMs = 60000) => {
    if (!email) return { inCooldown: false };

    const now = Date.now();
    const lastRequest = requestCache[email];

    if (lastRequest) {
        const timeElapsed = now - lastRequest;
        if (timeElapsed < cooldownMs) {
            const remainingTime = cooldownMs - timeElapsed;
            const remainingSeconds = Math.ceil(remainingTime / 1000);
            return {
                inCooldown: true,
                remainingSeconds,
                remainingTime
            };
        }
    }

    return { inCooldown: false };
};

/**
 * Registra uma tentativa de requisição para um email
 * @param {string} email - Email para registrar
 */
export const recordEmailRequest = (email) => {
    if (email) {
        requestCache[email] = Date.now();
    }
};

/**
 * Executa uma função com retry e backoff exponencial
 * @param {Function} fn - Função a ser executada (deve retornar uma Promise)
 * @param {Object} config - Configuração do retry
 * @returns {Promise} - Resultado da função ou erro após todas as tentativas
 */
export const executeWithRetry = async (fn, config = {}) => {
    const {
        maxRetries,
        initialDelayMs,
        maxDelayMs,
    } = { ...DEFAULT_CONFIG, ...config };

    let lastError;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
        try {
            // Tenta executar a função
            return await fn();
        } catch (error) {
            lastError = error;

            // Se for o último retry, não precisa esperar
            if (attempt === maxRetries) break;

            // Verifica se é um erro de rate limit (429)
            const isRateLimit = error.response?.status === 429;

            // Se não for rate limit e não for configurado para retry em outros erros, lança o erro
            if (!isRateLimit && !config.retryAllErrors) {
                throw error;
            }

            // Calcula o tempo de espera com backoff exponencial
            const delay = Math.min(
                initialDelayMs * Math.pow(2, attempt),
                maxDelayMs
            );

            // Adiciona um jitter (variação aleatória) para evitar thundering herd
            const jitter = Math.random() * 300;
            const waitTime = delay + jitter;

            // Espera antes da próxima tentativa
            await new Promise(resolve => setTimeout(resolve, waitTime));
        }
    }

    // Se chegou aqui, todas as tentativas falharam
    throw lastError;
};