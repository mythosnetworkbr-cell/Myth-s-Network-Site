# LÜMYS — Plataforma de Livros

A **LÜMYS** é a nova identidade deste projeto: uma plataforma digital focada em **descobrir, comprar, ler e publicar livros**.

## Proposta

A experiência combina vitrine editorial, biblioteca pessoal e leitor digital em uma interface responsiva para celular, tablet e desktop.

### Principais áreas

- **Início** — destaques, lançamentos e descoberta de novas histórias.
- **Catálogo** — livros organizados por gênero e pesquisa.
- **Detalhes do livro** — capa, autor, sinopse, avaliação, preço e amostra.
- **Biblioteca** — livros adicionados pelo leitor e progresso de leitura.
- **Leitor** — modo de leitura com ajuste de tamanho e tema.
- **Autores** — apresentação da proposta de publicação independente.
- **Publicar** — formulário para submissão de novas obras.
- **Conta** — ponto de entrada para futura autenticação e sincronização.

## Identidade visual

A nova interface abandona a identidade de roleplay da antiga versão e adota uma estética editorial contemporânea:

- fundo escuro sofisticado;
- tipografia serifada para títulos;
- dourado editorial como cor de destaque;
- detalhes violeta;
- capas de livros em destaque;
- glassmorphism discreto;
- navegação responsiva e barra inferior no celular.

## Funcionalidades da versão atual

- Busca por título, autor e gênero.
- Filtros por categoria.
- Catálogo com livros demonstrativos.
- Página/modal de detalhes.
- Amostra de leitura.
- Biblioteca local com `localStorage`.
- Fluxo visual de compra e adição à biblioteca.
- Formulário de publicação de obras.
- Cadastro local de e-mail para preparar a experiência de conta.
- Layout responsivo para mobile e desktop.

> A compra exibida nesta primeira versão é um fluxo de demonstração: o processamento financeiro real, DRM, distribuição de arquivos, royalties e sincronização em nuvem ainda precisam ser conectados ao backend e ao provedor de pagamentos escolhido.

## Build e publicação

### Requisitos

- Node.js 20 ou superior
- npm

### Build

```bash
npm install
npm run build
```

O build executa `lumys-build.js` e aplica o hotfix do catálogo antes da publicação.

### Vercel

O projeto está configurado para publicação automática pela Vercel a partir da branch `main`.

## Próxima camada de produto

A arquitetura visual já está preparada para receber:

- autenticação real;
- banco de dados de livros e autores;
- upload de EPUB/PDF;
- leitor EPUB protegido;
- pagamentos reais;
- biblioteca sincronizada entre dispositivos;
- favoritos e listas;
- avaliações e resenhas;
- painel do autor;
- royalties e relatórios;
- moderação editorial;
- audiobooks;
- notificações e recomendações.

## Segurança

Credenciais, tokens, chaves de pagamento e segredos de backend devem permanecer exclusivamente nas variáveis de ambiente da hospedagem.

## Identidade

**Nome:** LÜMYS  
**Categoria:** Plataforma de livros digitais  
**Idioma principal:** Português (Brasil)  
**Experiência:** descobrir · comprar · ler · publicar  
**Status:** nova fase do projeto

---

**LÜMYS** — uma nova casa para histórias.