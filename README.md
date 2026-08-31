# Lumis Streaming

Plataforma de streaming independente, construída sobre a base deste repositório e preparada para publicação web pela Vercel.

## O que já foi transformado

- Identidade visual **Lumis**
- Home de streaming
- Hero de destaque
- Catálogo de filmes
- Categorias
- Em alta
- Lançamentos
- Ação e aventura
- Busca
- Detalhes de filmes
- Minha lista
- Perfis
- Login/cadastro visual
- Painel administrativo visual
- Player preparado para receber uma fonte de vídeo licenciada
- Layout responsivo para celular e desktop

## Stack atual

- React
- Expo Web
- TypeScript
- React Native Web
- Vercel para hospedagem web

## Produção

A interface atual usa catálogo demonstrativo e imagens de demonstração. Para operar como serviço de streaming real, a próxima camada deve conectar:

1. autenticação persistente;
2. banco de dados para catálogo e usuários;
3. painel CRUD de filmes, séries, temporadas e episódios;
4. armazenamento/CDN de mídia;
5. player HLS/DASH;
6. histórico e progresso de reprodução;
7. perfis e controle parental;
8. assinaturas e pagamentos;
9. métricas de audiência;
10. somente conteúdos que o Lumis tenha autorização/licença para distribuir.

## Deploy Vercel

O repositório mantém a configuração web existente e pode ser conectado a um projeto Vercel. O build deve usar a configuração Expo Web já existente.

## Desenvolvimento

```bash
npm install
npx expo start --web
```

## Identidade

**Nome:** Lumis  
**Tipo:** Streaming de filmes e séries  
**Tema:** Dark / premium / roxo / preto  
**Plataformas planejadas:** Web, Android e futuramente TV/iOS.

> Este projeto não distribui filmes comerciais sem autorização. As fontes de vídeo devem ser licenciadas ou de propriedade do operador do Lumis.
