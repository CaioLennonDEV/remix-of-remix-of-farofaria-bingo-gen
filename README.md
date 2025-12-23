# BINGO Rodrigues

Sistema de Bingo Personalizado com visualização em tempo real.

## Funcionalidades

- **Jogo Principal**: Interface completa para conduzir partidas de bingo
- **Visualização em Tempo Real**: Página exclusiva para acompanhar partidas (`/viewer`)
- **Histórico de Sessões**: Acompanhamento completo de todas as partidas
- **Cartelas Personalizadas**: Sistema com nomes e avatares dos participantes
- **Sincronização em Tempo Real**: Atualizações automáticas via Supabase

## Página de Visualização (/viewer)

A página `/viewer` foi criada especificamente para permitir que qualquer pessoa acompanhe a partida em tempo real sem poder interagir com o jogo. 

### Características:
- **Somente Leitura**: Não permite interação, apenas visualização
- **Tempo Real**: Atualizações automáticas sem necessidade de recarregar
- **Layout Limpo**: Design focado na leitura e acompanhamento
- **Informações Completas**: 
  - Números/pessoas já sorteados
  - Histórico completo das peças chamadas
  - Lista de ganhadores por categoria
  - Status da conexão em tempo real

### Como Usar:
1. Acesse a página principal do bingo
2. Clique no botão "Abrir Visualização da Partida" no header
3. A página do viewer abrirá em uma nova aba
4. Compartilhe o link `/viewer` com quem quiser acompanhar a partida

## Project info

**URL**: https://lovable.dev/projects/4fdf5033-8ae0-47ea-af81-6604e28b98bf

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/4fdf5033-8ae0-47ea-af81-6604e28b98bf) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/4fdf5033-8ae0-47ea-af81-6604e28b98bf) and click on Share -> Publish.

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/features/custom-domain#custom-domain)
