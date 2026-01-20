# Pylar

**Pylar** é uma plataforma de gestão **centrada em projetos**, criada para organizar trabalho real:  
chamados, documentos, reuniões e permissões, tudo dentro de um único contexto.

O sistema foi pensado para times pequenos que vão crescer, evitando desde o início
o caos clássico de planilhas, mensagens soltas e decisões sem registro.

---

## 🎯 Conceito central

No Pylar, **tudo gira em torno de Projetos**.

Um projeto representa um contexto de trabalho (ex.: sprint, cliente, manutenção, iniciativa interna).
Tudo pertence a um projeto:

- Chamados (tickets)
- Documentos (drive do projeto)
- Reuniões e atas
- Usuários e permissões

Ao entrar no sistema, o usuário:
1. Realiza login
2. Seleciona o projeto em que irá trabalhar
3. Todas as ações passam a operar dentro desse contexto

Esse modelo é inspirado em sistemas como ERPs e plataformas multi-organização.

---

## 🧱 Principais funcionalidades (MVP)

### 📁 Projetos
- Criação de projetos com:
  - Nome
  - Descrição (Markdown)
  - Tipo (Sprint, Cliente, Interno, Manutenção, etc.)
  - Datas de início e fim
  - Status (ativo, encerrado, arquivado)
- Projetos arquivados tornam-se somente leitura
- Todo o histórico permanece acessível

---

### 👥 Usuários, perfis e permissões
- Usuários podem participar de **vários projetos**
- O mesmo usuário pode ter **papéis diferentes em projetos diferentes**
- Perfis (roles) são **globais**
- Atribuição de perfil acontece **por projeto**

Exemplo:
> Um usuário pode ser **Admin** em um projeto e **Member** em outro.

Existe um perfil especial:
- **SuperUser**: acesso total ao sistema, independentemente de projeto

O controle de acesso é feito via **RBAC (Role-Based Access Control)**.

---

### 🎫 Chamados (Tickets)
- Chamados sempre pertencem a um projeto
- Atributos principais:
  - Título
  - Descrição (Markdown)
  - Categoria
  - Prioridade
  - Status
  - Criador
  - Responsável
- Fluxo básico:
  - Aberto → Em andamento → Resolvido → Fechado
- Ao resolver um chamado:
  - É obrigatório registrar a **resolução** (Markdown)
  - Podem ser anexadas evidências (imagens, arquivos)
- Chamados resolvidos permanecem consultáveis para sempre

O chamado é tratado como a **unidade de trabalho** do sistema.

---

### 🗂️ Categorias de Chamado
- Criadas por projeto
- Utilizadas para classificar chamados
- Podem ser ativadas ou desativadas
- Permitem organização sem rigidez excessiva

---

### 📄 Documentos (Drive do Projeto)
- Cada projeto possui seu próprio espaço de documentos
- Upload de arquivos com organização por pastas
- Permissões herdadas do projeto
- Sem versionamento no MVP
- Armazenamento externo (S3-compatible)

---

### 🗓️ Reuniões
- Reuniões sempre vinculadas a um projeto
- Não geram tarefas automaticamente
- Podem ser usadas para:
  - Dailies
  - Alinhamentos
  - Decisões técnicas
- Cada reunião possui uma **ata em Markdown**, com:
  - Edição
  - Preview
  - Histórico

---

### Stack backend
- Node.js

---
## 🚫 Fora do escopo do MVP
Funcionalidades propositalmente deixadas para fases futuras:
- Versionamento de documentos
- Dashboard analítico
- Notificações (email/push)
- Chat
- Integrações externas
- Base de conhecimento estruturada

---

## 🛠️ Status do projeto
🚧 Em desenvolvimento (MVP)

O foco atual é entregar uma base sólida, funcional e extensível,
antes de qualquer expansão de funcionalidades.

---

## 📌 Objetivo do projeto
O Pylar existe para:
- Centralizar trabalho real
- Evitar perda de contexto
- Registrar decisões e soluções
- Crescer sem virar bagunça