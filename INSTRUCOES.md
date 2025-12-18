# Casa Quetzal - Sistema de Controle de Veículos

## Como Funciona

Este sistema permite o controle de entrada e saída de veículos através de um QR Code único compartilhado com todos os convidados.

## Como Gerar o QR Code

Após fazer o deploy na Vercel, você receberá uma URL (por exemplo: `https://casa-quetzal.vercel.app`).

### Opções para gerar o QR Code:

1. **Online (Gratuito)**:
   - Acesse: https://www.qr-code-generator.com/
   - Cole sua URL da Vercel
   - Baixe o QR Code em alta resolução
   - Use para imprimir ou enviar pelo WhatsApp

2. **Programaticamente** (opcional):
   ```bash
   npx qrcode https://sua-url.vercel.app -o qrcode.png
   ```

## Deploy na Vercel

1. Faça push do código para um repositório Git (GitHub, GitLab, etc.)
2. Acesse https://vercel.com
3. Clique em "New Project"
4. Importe seu repositório
5. A Vercel detectará automaticamente as configurações do Next.js
6. Clique em "Deploy"
7. Após o deploy, copie a URL gerada
8. Use essa URL para gerar seu QR Code

## Uso do Sistema

1. **Convidados**: Recebem o QR Code impresso ou pelo WhatsApp
2. **Segurança**: Escaneia o QR Code com o celular
3. **Registro**: 
   - Informa a placa do veículo (obrigatório)
   - Informa nome do condutor (opcional)
   - Clica em "REGISTRAR ENTRADA" ou "REGISTRAR SAÍDA"
   - Confirma os dados no modal
4. **Visualização**: Os registros aparecem na lista abaixo do formulário

## Armazenamento de Dados

Atualmente, os dados são armazenados no **localStorage** do navegador do dispositivo usado para fazer os registros.

### Importante:
- Os dados ficam salvos apenas no dispositivo do segurança
- Se limpar o cache do navegador, os dados serão perdidos
- Para ambiente de produção, recomenda-se migrar para um banco de dados

### Próximos Passos para Produção:
- Implementar backend com banco de dados (Vercel Postgres, MongoDB, etc.)
- Adicionar autenticação para segurança
- Adicionar exportação de relatórios
- Adicionar busca e filtros na lista de registros

