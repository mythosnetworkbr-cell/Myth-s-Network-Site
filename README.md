# Mythøs Network — Site Oficial

Site oficial da **Mythøs Network**, reunindo a comunidade, suporte, regras e recursos do projeto.

## Sobre o projeto

O repositório contém a versão web responsiva do Mythøs Network, preparada para funcionar em **celular e desktop**.

### Principais áreas

- **Início** — apresentação da rede e conteúdos em destaque.
- **Suporte / Tickets** — abertura e acompanhamento de atendimentos.
- **Regras** — central de regulamentos e regras completas.
- **Painel administrativo** — gerenciamento das funções autorizadas da equipe.
- **Candidatos** — fluxo de candidatura para Administração / Suporte.
- **Admin Data** — dados dos administradores aprovados.
- **Ponto** — registro de entrada, saída, horas e justificativas da equipe.
- **Logs e histórico** — acompanhamento de acessos e atividades relevantes.
- **APK** — área destinada à versão Android do projeto.
- **Vídeos** — conteúdo em destaque na página inicial.

## Equipe e permissões

O sistema possui uma hierarquia de cargos para separar as permissões administrativas, incluindo:

- Owner
- Staff
- ALL
- Manager
- Admin Líder
- Admin 2
- Sublíder
- Suporte
- Admin Assistente
- Atendimento

As permissões devem ser validadas pelo backend. O painel administrativo não deve ser tratado como mecanismo de segurança isolado.

## Regras

As regras oficiais ficam organizadas na central de regras e em páginas específicas quando necessário. O objetivo é preservar o conteúdo integral dos regulamentos, sem substituir as regras por resumos.

## Suporte e tickets

O sistema de suporte é destinado ao atendimento da comunidade. Entre as categorias utilizadas estão:

- Reclamação contra Jogadores
- Entender Punição
- Reclamação contra Orgs
- Reclamação Técnica
- Marcar Ação
- Solicitar Ajuda
- Seja Influência
- Candidato a Administração

O fluxo de atendimento também contempla registro de atividade e notificações configuradas para a equipe.

## Desenvolvimento

### Requisitos

- Node.js 20 ou superior
- npm

### Instalação

```bash
npm install
```

### Build

```bash
npm run build
```

### Execução local

```bash
npm start
```

## Estrutura de publicação

O projeto gera a pasta `dist` durante o build. A configuração de publicação web utiliza o `vercel.json` existente no repositório.

O código-fonte permanece no GitHub e pode ser conectado ao provedor de hospedagem para implantação automática.

## Segurança

- Não coloque tokens, senhas, webhooks ou chaves privadas no código-fonte.
- Credenciais de serviços externos devem permanecer nas variáveis de ambiente do provedor.
- Rotas administrativas devem validar autenticação e autorização no servidor.
- Arquivos enviados pelos usuários devem ser tratados com limites e validações apropriados.

## Identidade

**Nome:** Mythøs Network  
**Tipo:** Plataforma web da comunidade / suporte / serviços do projeto  
**Idioma principal:** Português (Brasil)  
**Interface:** responsiva para celular e desktop  
**Tema:** escuro, moderno e inspirado na identidade visual Mythøs

## Status

Este repositório está em desenvolvimento contínuo. Funcionalidades que dependem de serviços externos — autenticação, banco de dados, armazenamento, notificações e hospedagem — precisam estar configuradas no ambiente de produção para serem consideradas operacionais.

## Licença e conteúdo

Os conteúdos, marcas, imagens, vídeos e demais materiais utilizados no projeto devem ser publicados somente quando houver autorização ou direito de uso correspondente.

---

**Mythøs Network** — Site oficial da rede.