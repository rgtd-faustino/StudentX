# Fontes de eventos em Lisboa — investigação

Pesquisa focada em Lisboa primeiro, como sugerido. Organizado por nível de
confiança: do que já está confirmado a funcionar até pistas que ainda
precisam de ser verificadas. **"Confirmado" significa que eu próprio vi a
evidência técnica (WordPress detetado, link de RSS/iCal explícito no
rodapé, etc.) — não que testei o feed final ao vivo**, exceto onde digo
explicitamente que sim (só a CESEM, até agora, porque foi o Rafael que
testou essa).

---

## Nível 1 — Confirmado a funcionar (testado com ficheiro real)

| Fonte | URL | Notas |
|---|---|---|
| CESEM (NOVA FCSH) | `cesem.fcsh.unl.pt/events/?ical=1` | Já testado. Conteúdo é conferências académicas de musicologia - pouco alinhado com o público-alvo, mas prova que o mecanismo funciona. |

---

# Fontes de eventos em Lisboa — investigação

Pesquisa focada em Lisboa primeiro, como sugerido. **Atualizado após uma
segunda ronda mais aprofundada** - a primeira versão só destacava 2 links
no chat porque eram os únicos com feed praticamente confirmado; havia mais
coisas no documento que não puseram em destaque na conversa. Desta vez
fui mais fundo e a lista está bem maior. Organizado por nível de confiança.

**"Confirmado" significa que eu próprio vi a evidência técnica (plataforma
identificada, link de RSS/iCal explícito no rodapé, etc.) — não que testei
o feed final ao vivo**, exceto a CESEM, que foi o Rafael que testou.

---

## Nível 1 — Confirmado a funcionar (testado com ficheiro real)

| Fonte | URL | Notas |
|---|---|---|
| CESEM (NOVA FCSH) | `cesem.fcsh.unl.pt/events/?ical=1` | Conteúdo é conferências de musicologia - pouco alinhado com o público-alvo, mas prova o mecanismo. |

---

## Nível 2 — Plataforma confirmada, feed/RSS confirmado, conteúdo relevante

### Técnico Lisboa (IST) — 3 campus, todos WordPress confirmado
- Alameda: `tecnico.ulisboa.pt/en/category/events/`
- Oeiras: `oeiras.tecnico.ulisboa.pt/en/category/events/`
- Taguspark: `taguspark.tecnico.ulisboa.pt/en/category/events/`

Confirmei por fetch direto: WordPress, com "Subscrever Feeds RSS" no
rodapé. Conteúdo excelente (hackathons, LaTeX workshop, Coffee with Career
Center). **É RSS, não iCal** - precisa de um adaptador novo (ver nota
técnica mais abaixo). Testem `.../category/events/feed/` em cada um dos 3.

### ISEG
Confirmei por fetch que `iseg.ulisboa.pt` também é WordPress (encontrei a
categoria `/en/category/ulisbon/page/8`). Ainda não localizei o nome exato
da categoria de eventos - alguém com 2 minutos podia abrir
`iseg.ulisboa.pt/en/` e ver que categoria o menu "Eventos"/"Events" usa; a
partir daí aplica-se a mesma técnica do IST.

---

## Nível 3 — Plataforma bem estruturada, mas sem feed confirmado (scraping é o caminho mais provável)

| Instituição | URL | Sistema | Estado |
|---|---|---|---|
| **FMH (ULisboa)** | `fmh.ulisboa.pt/en/eventos` | Joomla! (confirmado) | Muito rico - 200+ eventos no histórico, sempre com Data/Hora/Local em formato consistente. Não encontrei link de RSS no rodapé, mas o Joomla às vezes tem feeds escondidos (`&format=feed`); vale a pena um "Ver código fonte" à procura de `<link type="application/rss+xml">` no `<head>`. |
| **NOVA FCT / Caparica** | `eventos.fct.unl.pt` | Drupal / OpenScholar (Harvard) | Portal com VÁRIOS calendários (só vimos um, "Campus Inter_comVida"). Sistemas OpenScholar por vezes têm exportação iCal num ícone que a extração de texto não apanha - vale visitar a home do portal (`eventos.fct.unl.pt`, sem o subcaminho) à procura disso. |
| **ULisboa (Reitoria)** | `ulisboa.pt/evento/{slug}` | Provavelmente Drupal (padrão `/print/evento/` típico deste CMS) | Encontrei páginas de evento individuais mas não a página de listagem/agenda principal - alguém enviar-me o link do menu "Agenda" do site ajudava a confirmar. |
| **Lusófona** | `ulusofona.pt` (menu "Eventos") + `lusoglobe.ulusofona.pt/agenda/` | Não identificado | Tem secção de eventos dedicada no menu principal, mais uma "Agenda" à parte no LusoGlobe (parece ser o gabinete internacional). Não fiz fetch direto ainda. |

---

## Nível 4 — Pistas por confirmar (encontradas por pesquisa, não verificadas)

| Instituição | O que encontrei |
|---|---|
| **Talent Portugal** (`talentportugal.com/feira-de-emprego/`) | Diretório nacional de feiras de emprego já existente (ISEG Career Forum, Tech Jobs Fair Lisboa, NOVA Law Career Days...). Cobre Portugal todo. |
| **NOVA SBE** (`novasbe.unl.pt/en/whats-happening/events/`) | Sistema próprio, página de detalhe por evento. Não verifiquei a listagem. |
| **Outros centros de investigação NOVA FCSH** | A CESEM funciona porque a FCSH usa este WordPress para "centros de investigação" - outros centros da mesma faculdade (IHC, CICS.NOVA, IEL, etc.) muito provavelmente têm o mesmo `?ical=1`. |

---

## Nível 5 — Relevantes, mas sem atalho técnico à vista

- **ISCTE-IUL** (`iscte-iul.pt/eventos/{id}/{slug}`) — páginas individuais numeradas, sem listagem/feed encontrado. SINFO, FISTA, Career Forum são eventos grandes e conhecidos - bons para outreach direto.
- **Associação Académica de Lisboa (AAL)** — sem presença técnica relevante (e com muitas queixas públicas sobre reembolsos, já agora).
- **Núcleos de estudantes individuais** (por curso, dentro de cada faculdade) — a esmagadora maioria só existe no Instagram. Não há atalho técnico: é outreach direto ou trabalho manual.
- **Politécnico (IPL/ISEL) e privadas (Católica, Europeia, IADE)** — ainda não investigado a fundo (ver nota de âmbito abaixo).

---

## Nota técnica: RSS vs iCal

Vários dos melhores achados (IST, possivelmente FMH e ISEG) dão RSS ou HTML
estruturado, não iCal. O adaptador que já construí (`ical.mjs`) só lê iCal.
RSS/HTML dá título + link + texto livre com "Date: X / Time: Y / Local: Z"
- workável, mas precisa de um adaptador novo que faça pattern-matching a
esse texto (o formato é bastante consistente dentro de cada site, mas
varia de site para site). Digam se querem que construa esse adaptador a
seguir - é mais trabalho do que o `?ical=1` da CESEM, mas nada de especial.

## Duas técnicas reutilizáveis para encontrarem mais fontes sozinhos

1. **WordPress "The Events Calendar"**: rodapé com "Subscrever o
   calendário" / "iCalendar" / "Exportar ficheiro .ics" → `?ical=1` no URL
   da página de eventos.
2. **RSS genérico do WordPress**: qualquer categoria WordPress (mesmo sem
   plugin de eventos, como o IST) → acrescentar `feed/` ao URL da
   categoria.

Sinal rápido de que um site é WordPress: `/category/`, `/page/N` ou
`?p=123` no URL. Sinal de Joomla: `?start=N`. Sinal de Drupal: `/print/`
ou tipos de conteúdo no singular em inglês tipo `/evento/{slug}`.

---

# 3ª ronda — Politécnico (IPL) e privadas (Católica, Europeia, IADE)

## Nível 2 — Novo achado forte: Universidade Católica Portuguesa

`ucp.pt/events/{slug}` (e também nos subdomínios de cada campus/faculdade:
`fm.ucp.pt`, `fcse.lisboa.ucp.pt`, `enfermagem.porto.ucp.pt`, etc.)

Confirmei por fetch que toda a rede de sites da Católica (site central +
todas as faculdades/campus) corre no **mesmo sistema Drupal**, com eventos
já bem categorizados por faculdade e etiquetados "Events". Conteúdo muito
bom: Welcome Day, semanas de sustentabilidade, feiras de empregabilidade
("RUMO"), encontros internacionais - cobre os 4 campus (Lisboa, Porto,
Braga, Viseu), o que dá para filtrar só Lisboa. **Ainda não encontrei a
página de listagem/agenda central** (só páginas de evento individuais) -
se alguém conseguir o link do menu "Events"/"Agenda" no `ucp.pt`, era o
próximo a testar. Sistemas Drupal deste género costumam ter exportação
iCal ou RSS num ícone da página de listagem.

## Nível 2 — Novo achado confirmado: NOVA Cultura (agenda cultural cross-escolas)

`novacultura.unl.pt/en/cultural-agenda/`

Confirmei por fetch direto: WordPress (com plugin WPML). Isto é uma
**agenda cultural que já agrega eventos de VÁRIAS escolas da NOVA num só
sítio** (vi um evento da NOVA SBE lá listado, por exemplo) - concertos,
exposições, cinema, workshops. Mais "vida cultural" do que
"networking/carreiras", mas cobre bem a categoria Pessoal/Curricular.
Sendo WordPress, aplica-se a mesma técnica: testem
`novacultura.unl.pt/en/cultural-agenda/feed/`.

## Nível 3 — ISCTE: blog de investigação com resumo semanal

`blog.cei.iscte-iul.pt` (WordPress confirmado)

Publica uma "Agenda Semanal de Eventos I&D" toda a semana, um post só que
lista os eventos de vários centros de investigação do ISCTE. Conteúdo é
maioritariamente académico/investigação (seminários, doutoramentos), não
tanto vida associativa. Feed do blog completo devia existir em
`blog.cei.iscte-iul.pt/feed/`.

## Nível 4 — Politécnico de Lisboa (IPL/ISEL): plataforma identificada, sem feed de eventos confirmado

Confirmei que tanto `ipl.pt` como `isel.pt` correm em **Drupal**
(`sites/default/files`, `/node?page=N` - assinaturas claras deste CMS).
Mas não encontrei uma secção "Eventos"/"Agenda" dedicada em nenhum dos
dois - o conteúdo que encontrei é sobretudo notícias institucionais e
documentos oficiais (estatutos, despachos). Pode existir uma página de
eventos que a pesquisa não apanhou - vale a pena alguém abrir `ipl.pt` ou
`isel.pt` diretamente e ver se há um menu "Eventos"/"Agenda".

## Nível 5 — Universidade Europeia / IADE: sem estrutura de eventos encontrada

Site de notícias (`europeia.pt/noticias/{slug}`, provavelmente WordPress),
mas não encontrei uma secção de eventos separada das notícias gerais, nem
para a Universidade Europeia nem para o IADE. As "International Week"
que encontrei são eventos anuais fixos, bons para outreach direto em vez
de scraping.

---

# Conclusão das 3 rondas — o que fazer a seguir

Já há confirmação técnica (plataforma identificada, muitas vezes com
RSS/feed no rodapé) para: **CESEM, IST (3 campus), ISEG, Universidade
Católica, NOVA Cultura, blog I&D do ISCTE**. Isto já dá uma base a sério
para começar - mais do que suficiente para valer a pena construir os
adaptadores em vez de continuar só a caçar mais fontes.

**Duas coisas que vale a pena fazerem antes de mim avançar com código**,
sempre que tiverem 5 minutos:
1. Testar `tecnico.ulisboa.pt/en/category/events/feed/`,
   `novacultura.unl.pt/en/cultural-agenda/feed/` e
   `blog.cei.iscte-iul.pt/feed/` no browser - se abrir um XML, é RSS válido.
2. Procurar no `ucp.pt` o link do menu para "Events"/"Agenda" central (não
   uma página de evento individual) e mandarem-mo.

Digam quando quiserem que eu avance com o adaptador de RSS - já há fontes
suficientes identificadas para valer a pena.

