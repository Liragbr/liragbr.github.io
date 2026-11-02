# Gabriel Lira — Portfolio

Portfólio de cibersegurança com foco em detecção, resposta a incidentes e pesquisa aplicada.

**Site:** https://liragbr.github.io/

## Estrutura

- `index.html`: conteúdo e estrutura semântica.
- `styles.css`: layout responsivo, estilos e movimento reduzido.
- `script.js`: menu mobile e estudo generativo ASCII em Canvas.
- `404.html`: página de erro para GitHub Pages.
- `social-card.svg` / `social-card.png`: fonte e exportação da imagem de compartilhamento.
- `liragbr.svg`: favicon.

HTML, CSS e JavaScript sem framework ou build. Google Fonts é opcional: há fontes de sistema como fallback.

## Desenvolvimento

Sirva a raiz com um servidor HTTP estático, por exemplo:

```sh
python3 -m http.server 8000
```

Abra `http://localhost:8000`. O GitHub Pages serve estes mesmos arquivos, sem compilação.

## Conteúdo

HIDra é o projeto principal. Sua arquitetura é apresentada conforme o README público, distinguindo desenho documentado de implementação e resultados verificados. No snapshot de 2 de novembro de 2026, `server/c2_server.py` estava vazio. Atualize essa observação quando o servidor estiver publicado e validado.

Competências de estudo e laboratório ficam separadas da experiência operacional. O site não atribui percentuais subjetivos de domínio ou resultados que não estejam documentados.

## Visual ASCII

O hero usa um estudo generativo original de caracteres em Canvas, sem dependência externa. A animação pausa fora de tela, em abas ocultas e quando o visitante prefere movimento reduzido. Há controle manual de pausa e fallback estático sem JavaScript.

Esta versão não usa uma exportação do ASCII Magic. Para incorporar uma no futuro, mantenha uma imagem estática como fallback e preserve a opção de reduzir movimento.

## Verificação manual

- Desktop e mobile sem rolagem horizontal.
- Navegação por teclado, menu mobile e Escape.
- Botão de pausa, movimento reduzido e conteúdo sem JavaScript.
- Links de projeto, contato e detalhes expansíveis.
- Página 404 e metadados de compartilhamento.

## Licença

MIT. Consulte `LICENSE`.
