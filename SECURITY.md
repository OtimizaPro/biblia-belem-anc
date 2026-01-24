# Política de Segurança

## Versões Suportadas

| Versão | Suportada |
|--------|-----------|
| 1.x.x | Sim |

## Reportando Vulnerabilidades

**NÃO abra Issues públicas para vulnerabilidades de segurança.**

### Como Reportar

Envie um email para: **security@aculpaedasovelhas.org**

### Informações a Incluir

- Descrição detalhada da vulnerabilidade
- Passos para reprodução
- Impacto potencial
- Sugestão de correção (opcional)
- Seu nome/handle para créditos (opcional)

### Tempo de Resposta

| Etapa | Prazo |
|-------|-------|
| Confirmação de recebimento | 48 horas |
| Avaliação inicial | 7 dias |
| Correção (crítico) | 72 horas |
| Correção (alto) | 14 dias |
| Correção (médio/baixo) | 30 dias |

## Escopo

Esta API é **pública e somente leitura**. Não há autenticação de usuários.

### Vulnerabilidades Relevantes

- Injeção SQL no banco D1
- SSRF ou acesso a recursos internos
- DoS que afete disponibilidade
- Exposição de dados sensíveis
- XSS em respostas da API

### Fora de Escopo

- Vulnerabilidades em dependências sem exploit comprovado
- Ataques que requerem acesso físico
- Engenharia social contra mantenedores
- Spam ou abuso de rate limit (não é vulnerabilidade)

## Divulgação Responsável

Pedimos que:

1. **Não explore** a vulnerabilidade além do necessário para demonstrá-la
2. **Não divulgue** publicamente antes da correção
3. **Não acesse** dados de outros usuários
4. **Nos dê tempo** razoável para corrigir antes de divulgar

## Reconhecimento

Contribuidores que reportarem vulnerabilidades válidas serão:

- Reconhecidos publicamente (com consentimento) após a correção
- Listados em nossa página de agradecimentos
- Elegíveis para menção em release notes

## Hall of Fame

*Ainda não temos reportes de segurança. Seja o primeiro!*

---

## Configuração de Segurança

### Headers de Segurança

A API implementa os seguintes headers:

```
Access-Control-Allow-Origin: *
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
```

### Rate Limiting

- Limite: 100 requisições/minuto por IP
- Resposta: 429 Too Many Requests

### Dados Sensíveis

Esta API **não processa** dados sensíveis de usuários:

- Não há autenticação
- Não há dados pessoais
- Não há logs de acesso individual
- Conteúdo é 100% público (texto bíblico)

---

## Contato

- **Segurança:** security@aculpaedasovelhas.org
- **Geral:** contato@aculpaedasovelhas.org
- **GitHub:** [Issues](https://github.com/OtimizaPro/biblia-belem-anc/issues)

---

**A Culpa é das Ovelhas** - Ecossistema de Estudo Bíblico
