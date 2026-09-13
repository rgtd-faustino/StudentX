# Pipeline de recolha de eventos

Substitui a espera passiva por eventos (email/formulário) por recolha ativa:
este script vai buscar eventos a fontes externas, normaliza-os para o
formato que `calendar.js`/`carousel.js`/`opportunities.js` já esperam, e
gera `json/events.json` de novo a cada execução.

## Antes da primeira Pull Request funcionar

O GitHub bloqueia por omissão que as Actions criem Pull Requests. Sem isto
ativado, o pipeline corre e gera o `events.json` bem, mas falha no último
passo com "GitHub Actions is not permitted to create or approve pull
requests." Para ativar: no repositório, **Settings → Actions → General →
Workflow permissions → marcar "Allow GitHub Actions to create and approve
pull requests" → Save.** É uma vez só.

## Como correr

```bash
cd scripts/fetch-events
npm install
npm run fetch
```

Isto lê `config/sources.json` + `sources/manual-events.json` +
`sources/overrides.json` (na raiz do repo) e escreve `json/events.json`.
**`json/events.json` passa a ser um ficheiro gerado — não editem esse
ficheiro à mão a partir de agora, editem `sources/manual-events.json`.**

## As quatro fontes

1. **iCal (`adapters/ical.mjs`)** - a fonte mais fiável. Lê qualquer feed
   `.ics` público, com data/hora em campos estruturados. Não precisa de
   chave de API nem autenticação.
2. **RSS (`adapters/rss.mjs`)** - para sites que não têm feed iCal (ex: o
   IST), só um blogue de posts. Menos fiável do que o iCal porque a
   data/hora do evento vêm escritas em texto livre dentro do post
   ("Date: X" / "Data de início: Y"), não em campos estruturados - ver
   limitações abaixo.
3. **Eventbrite (`adapters/eventbrite.mjs`)** - só funciona para uma
   organização específica com token próprio. **A API de pesquisa pública da
   Eventbrite foi descontinuada em 2020** - não há forma de "descobrir"
   eventos novos de organizadores desconhecidos via Eventbrite hoje em dia.
   Só vale a pena configurar isto se conseguirem o `organizationId` + um
   token OAuth de uma associação parceira que use Eventbrite.
4. **Manual (`adapters/manual.mjs`)** - lê `sources/manual-events.json`,
   onde a equipa continua a poder escrever eventos à mão (ex: depois de
   aprovar uma submissão do formulário de contacto).

## Como encontrar e adicionar uma fonte iCal

Muitas páginas de eventos de faculdades e associações portuguesas correm em
cima do plugin WordPress "The Events Calendar". Reconhece-se por ter, no
fundo da página de eventos, links do tipo:

> Subscrever o calendário: Calendário Google · iCalendar · Outlook 365 ·
> Outlook Live · Exportar ficheiro .ics

Se virem isto, o feed está normalmente disponível em
`<url-da-pagina-de-eventos>?ical=1`. Encontrei um exemplo real com este
padrão (CESEM, FCSH-NOVA) e deixei-o em `config/sources.json` — **mas não
consegui confirmar que devolve dados válidos**, porque o sandbox onde
construí isto só tem acesso à internet para registos de pacotes (npm, pip,
GitHub), não à internet em geral. Testem com `curl` ou no browser antes de
confiar nele, e troquem por fontes mais relevantes para o vosso público
assim que encontrarem (núcleos de estudantes, gabinetes de carreiras,
etc. — muitos correm o mesmo plugin).

Para adicionar uma fonte, acrescentem um objeto a `config/sources.json`:

```json
{
  "name": "nome-curto-unico",
  "placeName": "Nome apresentado no site",
  "url": "https://exemplo.pt/eventos/?ical=1",
  "colorOfEvent": "green"
}
```

`colorOfEvent` é opcional - se o omitirem, o script tenta adivinhar a
categoria (Profissional/red, Pessoal/blue, Curricular/green) por
palavras-chave no título/descrição (ver `lib/categorize.mjs`). Vai errar
às vezes; corrijam casos pontuais em `sources/overrides.json` sem precisar
de mexer em código.

## Como funciona a fonte RSS (e porque é mais frágil)

Construí o `adapters/rss.mjs` a partir do HTML que vi numa página de
eventos do IST, onde cada post tem um bloco "Additional Info" com
"Date: October 16, 2025" / "Time: 4:00 p.m. - 5:00 p.m." / "Location: X".
**Nunca vi um feed RSS real** (o meu sandbox não tem acesso à internet em
geral) - só sei que o site é WordPress (confirmado) e assumo que esse texto
também aparece dentro do conteúdo do feed, o que pode não ser verdade (pode
ser um bloco só da página, fora do que o WordPress mete no RSS). O
adaptador também percebe o formato português equivalente ("Data de início:"
/ "Hora de Início:" / "Local:"), visto noutros sites Joomla da ULisboa.

Se a data não for reconhecida, o evento é **ignorado com aviso** em vez de
aparecer com uma data errada - reparem nos logs da primeira execução real.

Para adicionar uma fonte RSS, acrescentem ao array `"rss"`:

```json
{
  "name": "nome-curto-unico",
  "placeName": "Nome apresentado no site",
  "url": "https://exemplo.pt/categoria/eventos/feed/",
  "colorOfEvent": "green"
}
```

**Limitação importante**: só está preparado para **um evento por post**. Um
site como o blog de investigação do ISCTE, que publica um resumo semanal
com vários eventos dentro do mesmo post, não funciona bem aqui - o
adaptador tentaria ler o post inteiro como um evento só. Não o adicionem
sem primeiro me dizerem, para eu ajustar o adaptador a esse formato.

## Limitações que vale a pena conhecer

- **Testei o adaptador iCal contra um ficheiro real do CESEM** (descarregado
  manualmente a 12/09/2026, já que o meu sandbox não tem acesso à internet
  em geral) - funciona, incluindo o caso de eventos de dia inteiro que se
  estendem por vários dias (ver secção seguinte). As outras fontes/URLs que
  ainda não tenham sido testadas com um ficheiro real continuam por
  confirmar - a primeira execução real de cada uma vai ser já na GitHub
  Action (que tem internet completa) ou quando correrem `npm run fetch`
  localmente. Reparem bem nos logs dessa primeira vez.
- **Eventos de dia inteiro (sem hora marcada) recebem 09:00-19:00 por
  omissão.** Não há forma de representar "sem hora" no esquema atual do
  events.json, por isso usamos este intervalo como aproximação.
- **Eventos que duram vários dias aparecem repetidos em cada dia** (com o
  mesmo id) para que apareçam corretamente ao navegar o calendário dia a
  dia. Isto está limitado a 14 dias por evento, para o caso de alguma fonte
  ter uma data mal formada.
- **Deduplicação entre fontes diferentes é só um aviso, não automática.**
  Se o mesmo evento aparecer em duas fontes (ex: submetido à mão E também
  no calendário da faculdade), o script avisa nos logs mas não tenta
  adivinhar sozinho que é o mesmo evento - fica para reverem no PR.
- **Eventos recorrentes (RRULE) só entram com a primeira ocorrência.**
  Expandir recorrências é uma melhoria possível mas não está feita.
- **A categorização automática é uma heurística e vai errar.** Usem
  `sources/overrides.json` para corrigir.
- **O formulário de submissão de eventos do site (`contactus.js`,
  `WORKER_URL`) continua completamente à parte deste pipeline** - não sei
  o que esse Cloudflare Worker faz aos dados que recebe (não tinha o código
  dele para ler), por isso não consegui ligá-lo automaticamente a
  `sources/manual-events.json`. Se me disserem o que o Worker faz com as
  submissões (ex: guarda numa base de dados, ou só envia email), dá para
  fechar esse ciclo também.
- **Todas as fontes de rede usam `lib/with-timeout.mjs` (fetch com
  AbortController) em vez do `timeout` embutido das bibliotecas.** Ao
  testar isto, descobri que nem o `node-ical` nem o `rss-parser` respeitam
  esse timeout de forma fiável - numa fonte bloqueada, o processo Node
  ficava pendurado bem para além do tempo configurado, e mesmo só "parar
  de esperar" (Promise.race) não chegava, porque a ligação ficava aberta
  por baixo e impedia o processo de terminar sozinho no fim do script. Se
  no futuro trocarem de biblioteca de iCal/RSS, mantenham este padrão
  (fetch com abort próprio, depois `parseICS`/`parseString` no texto já
  obtido) em vez de confiar no timeout da biblioteca.

## Ids

Os eventos automáticos recebem um id inteiro estável e determinístico
(gerado a partir do nome da fonte + id do evento na fonte - ver
`lib/id.mjs`), sempre ≥ 900000000. Mantenham os ids dos eventos manuais
abaixo desse valor. Isto é importante porque `calendar.js` e
`opportunities.js` fazem `parseInt(event.id)` em vários sítios - um id que
não seja um número parte a funcionalidade de download do calendário (.ics)
e a deteção de "já vi este evento" para quem o aceitou/rejeitou.
