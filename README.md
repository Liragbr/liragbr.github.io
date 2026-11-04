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

## Visual ASCII

O hero usa uma ilustração ASCII original inspirada na placa Pico W do HIDra. O Canvas reaproveita o desenho estático do HTML e ilumina as trilhas em uma varredura ilustrativa de USB, MCU e Wi-Fi. A animação pausa fora de tela, em abas ocultas e quando o visitante prefere movimento reduzido. Há controle manual de pausa e fallback estático sem JavaScript.

A abertura de marca dura aproximadamente 1,45 s e aparece uma vez por aba. Pode ser dispensada por teclado ou clique; não intercepta interações e tem encerramento de segurança mesmo se o JavaScript principal falhar. Não representa progresso real de carregamento.

Em dispositivos com mouse, o CSS usa uma seta personalizada e uma mira sobre elementos interativos. O navegador mantém o ponteiro no scroll sem depender de eventos de movimento. Cards respondem com brilho localizado e inclinação discreta, botões têm magnetismo leve e setas respondem ao hover. O controle “Pausar animações” e `prefers-reduced-motion` desativam os efeitos animados.

A [biblioteca ASCII Magic](https://www.ascii-magic.com/ascii) serviu de referência para o enquadramento de terminal e a varredura. O desenho da placa foi criado para este portfólio.

## Verificação manual

- Desktop e mobile sem rolagem horizontal.
- Navegação por teclado, menu mobile e Escape.
- Botão de pausa, movimento reduzido e conteúdo sem JavaScript.
- Abertura na primeira visita da aba, encerramento por teclado/clique e ausência em novas navegações da mesma sessão.
- Cursor em mouse (incluindo mudança para mira em links e persistência no scroll), retorno dos cards e botões ao repouso, ausência dos efeitos em touch.
- Links de projeto, contato e detalhes expansíveis.
- Página 404 e metadados de compartilhamento.

## Licença

MIT. Consulte `LICENSE`.
