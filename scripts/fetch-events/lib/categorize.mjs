// O site usa colorOfEvent como categoria: "red" = Profissional, "blue" = Pessoal,
// "green" = Curricular (ver profissional-filter/pessoal-filter/curricular-filter
// em carousel.js). Eventos automáticos não vêm com esta categoria, por isso
// tentamos adivinhar por palavras-chave no título/descrição.
//
// Isto É uma heurística e vai errar em alguns casos - fica documentado no README.
// Podem corrigir casos específicos sem tocar em código, através de
// sources/overrides.json (ver README desta pasta).

const KEYWORDS = {
    red: [
        'emprego', 'carreira', 'carreiras', 'recrutamento', 'job', 'jobs',
        'trabalho', 'estágio', 'estagio', 'cv', 'currículo', 'curriculo',
        'entrevista', 'networking', 'feira de emprego', 'recruitment',
        'talent', 'employer', 'career', 'careers', 'internship', 'hiring',
        'resume', 'interview',
    ],
    green: [
        'aula', 'curricular', 'académic', 'academic', 'seminário', 'seminario',
        'palestra', 'conferência', 'conferencia', 'investigação', 'investigacao',
        'ciência', 'ciencia', 'tese', 'doutoramento', 'mestrado', 'simpósio',
        'simposio', 'congresso', 'workshop', 'formação', 'formacao',
        'seminar', 'conference', 'lecture', 'symposium', 'hackathon',
        'course', 'training',
    ],
    blue: [
        'festa', 'convívio', 'convivio', 'social', 'desporto', 'desportivo',
        'voluntariado', 'cultura', 'cultural', 'música', 'musica', 'tuna',
        'associativ', 'praxe', 'jantar', 'concerto',
        'party', 'volunteer', 'sports', 'welcome', 'exhibition',
    ],
};

export function categorizeEvent({ title = '', description = '', sourceCategoryHint } = {}) {
    if (sourceCategoryHint && ['red', 'blue', 'green'].includes(sourceCategoryHint)) {
        return sourceCategoryHint;
    }

    const text = `${title} ${description}`.toLowerCase();
    const scores = { red: 0, blue: 0, green: 0 };

    for (const [color, words] of Object.entries(KEYWORDS)) {
        for (const word of words) {
            if (text.includes(word)) scores[color] += 1;
        }
    }

    const [bestColor, bestScore] = Object.entries(scores).sort((a, b) => b[1] - a[1])[0];

    // sem nenhuma palavra-chave reconhecida, "curricular" (verde) é o
    // fallback mais seguro para eventos vindos de fontes académicas
    return bestScore > 0 ? bestColor : 'green';
}
