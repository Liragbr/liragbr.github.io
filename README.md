# Gabriel Lira — Portfolio

Portfólio de cibersegurança com foco em detecção, resposta a incidentes e pesquisa aplicada.

**Site:** https://liragbr.github.io/

## Estrutura

- `index.html`: conteúdo e estrutura semântica.
- `styles.css`: layout responsivo, estilos e movimento reduzido.
- `script.js`: menu mobile e estudo generativo ASCII em Canvas.
- `interactions.js` / `motion.css`: abertura, cursor reativo, efeitos de hover e revelação de seções.
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

## Grafo de investigação

O hero usa um grafo SVG de um caso simulado. Os nós mostram identidade, endpoint, execução, DNS e destino externo. As evidências podem ser consultadas com mouse, toque ou teclado. Os pulsos pausam fora de tela, em abas ocultas e quando o visitante prefere movimento reduzido. Há controle manual de pausa e uma versão estática sem JavaScript.

A abertura de marca dura aproximadamente 1,45 s e aparece uma vez por aba. Pode ser dispensada por teclado ou clique; não intercepta interações e tem encerramento de segurança mesmo se o JavaScript principal falhar. Não representa progresso real de carregamento.

Em dispositivos com mouse, o CSS usa uma seta verde original que clareia sobre links e botões. O navegador mantém o ponteiro no scroll, enquanto um Canvas separado desenha um rastro breve durante o movimento. Cards respondem com brilho localizado e inclinação discreta, botões têm magnetismo leve e setas respondem ao hover. O controle “Pausar animações” e `prefers-reduced-motion` desativam os efeitos animados.

## Verificação manual

- Desktop e mobile sem rolagem horizontal.
- Navegação por teclado, menu mobile e Escape.
- Botão de pausa, movimento reduzido e conteúdo sem JavaScript.
- Abertura na primeira visita da aba, encerramento por teclado/clique e ausência em novas navegações da mesma sessão.
- Cursor em mouse (incluindo realce em links, dissipação do rastro e persistência da seta no scroll), retorno dos cards e botões ao repouso, ausência dos efeitos de ponteiro em touch.
- Links de projeto, contato e detalhes expansíveis.
- Página 404 e metadados de compartilhamento.

## Licença

MIT. Consulte `LICENSE`.
