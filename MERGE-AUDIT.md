# Auditoria de Qualidade do Merge D1

**Método:** auditoria adversarial dos 8152 versículos que o merge com o D1 alterou. Um agente por lote sinalizou regressões suspeitas; uma segunda passagem cética confirmou cada uma. Resultado: **205 versículos** onde o D1 é comprovadamente pior que o `.txt`.

Para estes, o exportador **mantém a versão do `.txt`** (lista em `scripts/merge-revert.json`). Assim o merge só melhora o corpus: corrige contaminação onde o D1 é melhor, e não importa as regressões do D1.

Tipos de regressão encontrados: truncamento/perda de conteúdo, reversão de português já traduzido para transliteração crua, nomes próprios corrompidos (ex.: rei Asa→Ezequias, Laquis→"a cintura"), e contaminação estrangeira (inglês/grego/cirílico) colada ao texto.

---

### 1CH (5)

- **1CH 7:28** — after reverteu portugues ('e suas filhas'->'ubnoteha', 'para o oriente'->'velamizrah', 'para o ocidente'->'velamaarav', 'e suas moradas'->'umoshvotam') para transliteracao crua.
- **1CH 10:11** — after trocou 'para-saulo' por lixo com letras latinas coladas ao hebraico ('-LEASEול׃').
- **1CH 16:14** — after perdeu 'seus juizos' (משפטיו) que before tinha traduzido ao final; truncado.
- **1CH 19:10** — i=3457 no arquivo e 1CH 19:10; after truncou o fim perdendo 'e-arranjou para-encontro-de aram' e reverteu 'e escolheu de-todo o jovem' para colchetes hebraicos. Conteudo perdido.
- **1CH 23:26** — after reverteu 'para-os-Levitas' para [hebraico], trocou objeto por [OBJ] e perdeu 'para a sua adoracao' no fim; truncado.

### 1KI (6)

- **1KI 8:56** — 'bendito'/'como tudo' reverteram a hebraico cru e 'o-bom' virou lixo letra-a-letra
- **1KI 8:57** — Portugues limpo degradado em sequencias ilegiveis letra-a-letra
- **1KI 8:58** — Mandamentos/Estatutos/Testemunhos viraram sequencias ilegiveis letra-a-letra
- **1KI 10:1** — Truncou 'לִנְסֹתֵהוּ בְּחִידֹות' (prova-lo com enigmas); tambem 'rainha' virou 'mãe-de'
- **1KI 11:21** — Truncou clausula final 'שלחני ואלך אל ארצי', termina em 'a Faraó a'
- **1KI 14:26** — after reverteu 'os seus tesouros' para [OBJ] e perdeu 'guardioes o-ouro' (escudos de ouro) e o nome Shelomo/Salomao no fim; conteudo portugues e nome perdidos.

### 1SA (2)

- **1SA 11:3** — 'salvador' reverteu para 'mo-shi-a' cru; tambem truncamento 'e-rep'
- **1SA 14:22** — 'aqueles que se escondem'/'levantaram-se'/'e se apegaram' reverteram a translit crua

### 2CH (9)

- **2CH 6:14** — after reverteu 'para-tus-servos aqueles-que-andam' para 'laavadecha haholchim' (transliteracao); linha mais transliterada.
- **2CH 13:20** — after reverteu 'impediu forca'->'atazar koach' e 'e o martirizou'->'vayyigpehu' (transliteracao crua).
- **2CH 14:1** — after trocou o rei correto 'Asa' (2Cr 14 e reinado de Asa) por 'Ezequias'; erro factual de nome proprio.
- **2CH 14:3** — after reverteu 'a investigar'->'para-darosh', 'pais-deles'->'avoteihem', 'e para fazer'->'e-la-asot', 'a mandatoria'->'ha-mitsvah'. Portugues virou transliteracao.
- **2CH 14:5** — after reverteu 'com ele'->'immo', 'nos anos'->'basshanayim', 'deixou'->'henichah'. Transliteracao crua.
- **2CH 17:2** — after reverteu 'e deu-lhe'->'ve-yitten', 'as pedras'->'hab-tsurot', 'estancias'->'netzivim'. Transliteracao crua.
- **2CH 18:17** — after substituiu o nome יהושפט (Jeosafa) pela palavra-lixo 'יהוהSPORTÁFAT'.
- **2CH 20:30** — after introduziu o lixo 'יהוהSPORTÁFAT' onde before tinha nome legivel ('Joash').
- **2CH 36:3** — i=3869 no arquivo e 2CH 36:3 (rationale do flag nao bate), mas after truncou o fim: 'cem ouro prata ouro ouro'->'cem ouro', perdendo 'prata' (kesef/prata). Conteudo perdido.

### 2KI (4)

- **2KI 11:20** — after inseriu ingles colado 'and-the-city' e 'and-they-killed' onde before tinha 'e a cidade' e 'e mataram'. Contaminacao estrangeira.
- **2KI 13:22** — after truncou o fim, perdendo o nome 'yehoachaz', deixando 'dias-de dias-de' pendurado.
- **2KI 14:19** — after corrompeu o toponimo Laquis (לכישה) em 'a cintura' (parte do corpo) duas vezes, onde before preservava o nome do lugar. Nome proprio virou substantivo sem sentido.
- **2KI 16:5** — after converteu o nome do rei Peca (ופקח) no verbo 'e-abriu' e degradou 'achaz' para 'apaz-'. Nomes proprios corrompidos.

### 2SA (3)

- **2SA 6:5** — 'liras'/'flautas' reverteram a transliteracao crua (cinors/nbalims)
- **2SA 8:6** — 'que-ficaram'/'levadores'/'e-resgatou' reverteram a translit crua (n'tzivim/no-se'ei/va-yo'sha)
- **2SA 15:30** — 'e-cabeça' reverteu para transliteracao crua 've-rosh' sem melhora compensatoria

### DAN (1)

- **DAN 12:9** — after truncou o fim, perdendo 'tempo destruição' (עת קץ); 'as-palavras até tempo destruição:' virou 'as-palavras até'.

### DES (1)

- **DES 19:16** — before tinha 'SENHORES' em português e after voltou a 'KYRIOSES', pluralização grega crua e malformada sem sentido.

### DEU (12)

- **DEU 4:31** — 'curará-te' virou 'jarp-fca', transliteracao truncada sem sentido
- **DEU 6:21** — 'servos fomos para Faraó'/'e nos tirou' reverteram a translit crua (avdím hi-yinu.../ve-yotseinu)
- **DEU 6:22** — 'e maravilhas'/'e males'/'no Egito'/'em Faraó' reverteram a translit crua
- **DEU 7:4** — 'teu filho'/'e servirão'/'e destruirá-vos logo' reverteram a translit crua (be-ne-chak/ve-a-vd-u/ve-hish-mid-cha)
- **DEU 12:29** — Perdeu 'na sua terra' no final, truncou conteudo
- **DEU 12:31** — Perdeu portugues final 'para os seus elohim', truncou conteudo
- **DEU 14:3** — Removeu o objeto (toevah) do verbo, frase 'não comerás todo' ficou incompleta
- **DEU 14:16** — Perdeu ave yanshuf, gerou 'e-a e-a' duplicado e traduziu kos errado como 'o-copo'
- **DEU 16:22** — Perdeu 'a coluna' e 'Elohim-tua', substituidos por hebraico cru nao traduzido
- **DEU 22:9** — Frase portuguesa reverteu toda a hebraico cru entre colchetes
- **DEU 26:9** — Perdeu 'fluindo-de leite e-mel' no final, truncou conteudo
- **DEU 34:2** — Perdeu 'o-mar o-último' no final, termina em 'Judá até'

### EST (12)

- **EST 1:10** — after perdeu o nome 'Ahasverus' no fim do versiculo.
- **EST 1:15** — i=4077 no arquivo e EST 1:15; Assuero permanece (rationale do flag imprecisa), mas after truncou perdendo 'os-eunucos' no fim. Conteudo perdido.
- **EST 1:17** — after perdeu 'Vashti a-rainha' (objeto de para-trazer), ficando 'para-trazer a diante-dele'.
- **EST 1:19** — after perdeu o verbo 'dara' (יתן); 'e-reino-dela dara o-rei'->'e-reino-dela o-rei'.
- **EST 1:20** — after perdeu 'para-do-grande' (למגדול); so restou 'e-ate pequeno'.
- **EST 1:22** — after cortou grande trecho: perdeu 'dominando em-casa-de-ele e-falando conforme-lingua-de'.
- **EST 2:1** — after perdeu o nome 'Vashti', substituido por placeholder [OBJ].
- **EST 2:3** — after perdeu 'guardiao-de as-mulheres' e 'cosmeticos-de-elas', reduzido a 'e-dado'.
- **EST 2:6** — after perdeu 'Babilonia'; 'Nabucodonosor rei Babilonia'->'Nabucodonosor rei'.
- **EST 2:7** — after perdeu o nome 'Mordecai' em 'ele-tomou-ela Mordecai para-ele'.
- **EST 2:8** — after perdeu 'as-mulheres'; 'Hegai guardando as-mulheres'->'Hegai guardando'.
- **EST 2:9** — after perdeu 'as-mulheres'; 'para-bom casa as-mulheres'->'para-bom casa'.

### EXO (14)

- **EXO 12:19** — 'a-alma','da-congregacao','no-estrangeiro e-no-circunciso','comedor' (PT) revertidos para 'ha-nefesh','me-eda't','ba-ger u-ve-ez-rach','mac-hmet-set'
- **EXO 12:20** — 'comereis' (x2) revertido para translit 'to-a-chelu'/'To'ekhulu'
- **EXO 15:11** — 'dedicado no santuario','hinos fez milagres' (PT) viraram translit letra-a-letra 'n-e-ad-r','t-h-il-l-os','pe-la'
- **EXO 15:12** — frase PT completa virou translit crua 'n-a-ti-ta y-m-in-kha t-b-la-e-me-o'
- **EXO 15:13** — 'tu lancaste por tua misericordia' -> 'n-a-chi-ta b-cha-s-d-kha' e final 'Sua santidade' virou hebraico nao traduzido
- **EXO 16:21** — 'e recolheram','e quente o-sol e tocou' (PT) revertidos para 'v-y-l-q-t-u','w-h-a-m o-sol w-n-a-m-s'
- **EXO 21:36** — after truncou versiculo para 'ou 노다 que boi', perdendo quase todo o conteudo de before
- **EXO 21:37** — after reduziu a 'que yiganev-', perdendo toda a frase sobre roubo/restituicao
- **EXO 25:20** — ultimo 'os-querubins' (PT) revertido para translit crua 'os-kruibim'
- **EXO 26:21** — 'senhores' (PT) revertido para translit garbled 'adonaies'
- **EXO 29:4** — after perdeu a oracao final 'lavar com-a-agua' e trocou PT por [OBJ]/hebraico
- **EXO 35:4** — after perdeu 'ordenou... para-dizer', deixando 'que yhwh' quebrado
- **EXO 39:1** — after removeu 'ordenou', deixando 'como yhwh a Moises' sem verbo
- **EXO 39:21** — after removeu 'como ordenou' da oracao PT 'como ordenou yhwh a Moises'

### EZK (8)

- **EZK 9:5** — after reverteu português já traduzido ('matem','olhem','tenham misericórdia') para transliteração silábica crua sem sentido ('e-a-hak-ku ta-ta-kho-s e-a ta-takh-mo-lo-u','in-vaei').
- **EZK 20:13** — after truncou o final, perdendo a frase traduzida 'para os destruí-los' (להשמידם) e o verbo לשפך; termina abruptamente em 'e-disse'.
- **EZK 20:40** — a tradução 'primícias' (תרומתיכם) some, revertendo a [אֶת־תְּרוּמֹֽתֵיכֶ֗ם] cru, e o final קָדְשֵׁיכֶם foi truncado.
- **EZK 21:17** — after ficou truncado/embaralhado, terminando em 'foram a a' (nonsense), perdendo 'a espada','povo-meu'→[אֶת־עַמִּ֔י] cru,'portanto' e יָרֵֽךְ.
- **EZK 23:5** — nome próprio traduzido 'Assíria' vira [אֶל־אַשּׁ֖וּר] cru e o final קְרוֹבִֽים foi truncado; regressão a transliteração.
- **EZK 23:30** — 'nações' volta a [גוֹיִ֔ם] cru e a palavra נִטְמֵאת foi perdida; regressão de português para hebraico cru.
- **EZK 37:4** — after reduziu 'ouvi palavra-de yhwh' para 'ouvi yhwh', perdendo a tradução de 'palavra-de' (דבר); 'a palavra de yhwh' virou só 'yhwh'.
- **EZK 43:19** — after removeu a frase traduzida final 'para-oferta-pelo-pecado' (לחטאת), perdendo o termo sacrificial que before tinha.

### EZR (1)

- **EZR 6:9** — after truncou o fim, perdendo 'em-dia dia nao shalo'u' que before tinha.

### GEN (19)

- **GEN 1:25** — 'o-solo' (PT) revertido para transliteracao crua 'a-adamah'
- **GEN 12:5** — 'sua-mulher' (PT) virou transliteracao truncada sem sentido 'es-ta-mulher'
- **GEN 21:17** — 'anjo-de' (PT) revertido para 'malak' (translit crua)
- **GEN 24:55** — 'a moca conosco... dez' (PT) revertido para 'ha-naara it-anu... asor' (translit)
- **GEN 24:65** — 'o manto e cobriu-se' virou nonsense 'o-que-grita e-ele-se-escondeu-versiculo-final' com artefato de marcacao
- **GEN 25:2** — nome proprio 'Yishbak'->'jorrar', 'Shuach'->'suspiro', 'Medan'->'Mdan' truncado
- **GEN 25:3** — nome proprio sujeito 'Yaqsan' virou verbo 'e-quebrara', oracao sem sentido
- **GEN 25:16** — 'em-suas-corticos'/'para-suas-nacoes' (PT) revertidos para 'be-chatser-e-hem'/'le-ummoth-am' (translit)
- **GEN 26:15** — 'cisternas'/'entupidos' (PT) revertidos para 'baerot'/'sittemum' (translit)
- **GEN 26:16** — 'de nos'/'fez-se grande' (PT) revertidos para 'me-immanu'/'atzamt' (translit)
- **GEN 26:17** — 'acampou em um vale' (PT) revertido para 've-yachan benachal' (translit)
- **GEN 28:6** — varios trechos PT ('para buscar','em seu nome','ordenou','nao a-ti') revertidos para 'e-shaleach','be-barakho','ve-yetzav','tikach'
- **GEN 30:33** — 'punido e pendurado... nos calores roubado' (PT) revertido para 'nacod ve-talua... be-khashsavim gannuv' (translit)
- **GEN 30:34** — 'segundo a tua palavra' (PT) revertido para 'kidvarecha' (translit)
- **GEN 30:35** — 'e tirou no-dia aquele a as feras os acorrentados' (PT) revertido para 'va-yasar no-dia ha-hu a hat-tiyashim ha-aquddim' (translit)
- **GEN 32:17** — nome proprio 'Eder' virou palavra sem sentido 'Erectilemos:'
- **GEN 34:18** — nome proprio Hamor traduzido erroneamente como 'cavalo:'
- **GEN 35:21** — 'Migdal Eder': 'Eder' virou 'Erectilemos:' sem sentido
- **GEN 37:3** — linha real GEN 37:3; after perdeu o trecho 'e fizer para-ele [tunica]' que before tinha (perda de conteudo)

### HAG (1)

- **HAG 1:1** — after truncou o fim, perdendo 'o-sacerdote o-grande para-dizer' e o nome do sumo sacerdote; termina abruptamente em 'dizendo filho-de'.

### ISA (10)

- **ISA 3:16** — Much Portuguese ('e-alçai-vos','e-andastes','vai andando...pés vibrou') reverted to translit string 'gavhu... umeshakrot einaim halokh vetaphoph... uberagleihem'.
- **ISA 3:22** — 'as aberturas'/'as penachos'/'as abas' reverted to translit 'as-machaltsoth e-as-maathaphoth e-as-mithpachoth'.
- **ISA 4:2** — 'para glória'/'e fruto'/'para orgulho'/'para redenção' reverted to translit 'u-lechavod u-peri'/'le-gaon'/'li-pelitat'.
- **ISA 5:7** — 'plantei'/'e-pregou'/'para-julgamento' reverted to translit 'net-a sha-as-hu-ay-yo va-yekav le-mish-pat'.
- **ISA 9:14** — 'levantai'/'profetizai'/'enganos'/'a vara' reverted to translit 'u-nshua'/'navi'/'sheker'/'ha-zanab'.
- **ISA 9:15** — 'os benditos... provações... serão engolidos' reverted to translit 'meashrei... mateim u-meusherav mevulaim'.
- **ISA 10:8** — 'Reis' reverted to transliteration 'mlakhim'.
- **ISA 10:18** — 'e glória o jardim' reverted to crude translit 'ukvod yaaro'.
- **ISA 13:20** — Correct 'geração' (דור) replaced by false/crude translit 'dor' (reads as Portuguese 'pain'): 'até geração e geração'→'até dor e geração'.
- **ISA 64:3** — 'não' became garbled 'nao-' (lost tilde, dangling hyphen) and glosses 'faz-o' and 'a-ele' were dropped.

### JDG (1)

- **JDG 10:15** — 'faça-' reverteu a 'aseh-' e perdeu 'que nos salve'

### JER (5)

- **JER 4:30** — Portuguese imperatives 'faça'/'veste-te'/'adorna-te' reverted to translit 'taasei-'/'tilbashshi-'/'taadi-'.
- **JER 5:10** — 'subam em-suas-carneiras'/'e-escaldem-no'/'levem-fora' reverted to translit 'aluu be-sha-ro-te-ha'/'ve-sha-che-tu'/'ha-si-ru'.
- **JER 5:11** — 'pelos-vestidos'/'em-mim' reverted to translit 'ba-go-d'/'bi'.
- **JER 20:6** — after truncated at 'a-eles', losing the Portuguese gloss 'em-vanidade' (לשקר).
- **JER 46:25** — after colapsou '...e-sobre Faraó e-sobre [sem-traducao] em-ele' em 'e-sobre e-sobre e-sobre', perdendo a palavra traduzida 'Faraó' e 'em-ele'; ficou ininteligível.

### JOB (9)

- **JOB 8:7** — after reverteu 'o-teu-primeiro'->'reishtekha', 'e-o-teu-ultimo'->'u-aakhiritekha', 'sera-profundamente'->'yishgeh'. Transliteracao crua.
- **JOB 8:8** — after reverteu 'por-favor'->'naa', 'para-a-geracao'->'le-dor', 'primeiro'->'rishon', 'e-ordenara'->'ve-konen'. Transliteracao crua.
- **JOB 9:25** — before 'corram fugirem' (PT verbs) reverteu para transliteracao crua 'rats bar-chu'
- **JOB 9:26** — after reverteu portugues limpo ('passaram','destruicao','cavalo tropel','devorador') para transliteracao crua ('chal-pu','eveh','Cneshér','yattush','em-o comer').
- **JOB 10:2** — 'dize-me' e 'conteste-me' (PT) viraram translit crua 'ho-di-en-i' e 'teri-be-ni'
- **JOB 10:3** — verso inteiro em PT regrediu para translit crua (ha-tov, ta-a-shok, timaas yegiaa kappayikh, hofaathta)
- **JOB 14:6** — PT completo virou translit crua (she-e-ah, ve-yech-dal, yir-tze, co-sheqer)
- **JOB 14:8** — PT reverteu para translit crua (yaqzkin, sharsho, ve-ebaaphar, gezwo)
- **JOB 30:1** — token כַּלְבֵי (caes) presente no before foi eliminado no after; conteudo perdido

### JOS (4)

- **JOS 11:19** — Perdeu 'tomaram na guerra' e reverteu 'haviam subjugado' a colchete hebraico cru
- **JOS 15:16** — Truncou 'Acsa filha-minha para-mulher', frase termina em 'e-darei para-ele a'
- **JOS 21:19** — Perdeu contagem 'doze cidades', termina abruptamente em 'três-'
- **JOS 24:29** — Perdeu 'e-dez' na idade de Josué (110->cem), regressao numerica

### LAM (1)

- **LAM 3:21** — after truncou o versículo: perdeu a tradução 'eu retribuirei', o termo לבבי e a palavra final אוחיל ('I will hope'). Ficou mais curto e perdeu conteúdo.

### LEV (4)

- **LEV 11:14** — after perdeu a segunda ave ('a ayah para a minah') que before tinha (truncado)
- **LEV 11:17** — after truncou dois animais em 'e-a e-a' vazios, perdendo 'a lancada'/'o arrebatado'
- **LEV 13:7** — texto PT revertido para translit 'a-mispachath ba-owr he-re'otho le-tahoratho ve-nireh'
- **LEV 13:8** — PT revertido para translit 've-ra'ah','passe-tha ha-mispachath','zaraat'

### MAL (1)

- **MAL 1:1** — after truncou o final 'na-mão-de מלאכי', perdendo o português 'na-mão-de' e a assinatura do livro (Malaquias).

### MIC (1)

- **MIC 6:1** — after perdeu 'as montanhas' (ההרים) e רִיב/הגבעות, e reverteu 'e ouvirá'→[וְתִשְׁמַעְנָה] e 'o teu grito'→[קוֹלֶךָ] a hebraico cru.

### NEH (3)

- **NEH 5:6** — after perdeu 'seu-grito' (זעקתם) substituido por placeholder 'e-[OBJ]'.
- **NEH 11:36** — after perdeu לבנימין (Benjamin) ao final; truncado ('Juda' e o fim).
- **NEH 12:10** — after truncou perdendo o nome final 'Joiada' (יוידע), terminando em 'gerou a'.

### NUM (12)

- **NUM 4:32** — 'em volta' (PT) revertido para 'saviv' e inserida palavra inglesa 'courtyard'
- **NUM 4:42** — Nome proprio 'Merari' traduzido para 'de-melancolia' (viola regra de nao traduzir nomes proprios)
- **NUM 5:8** — 'ovelha' (portugues) regrediu para transliteracao crua 'e-il'
- **NUM 6:24** — 'e te preservará' virou 'e-protect-te' (palavra inglesa crua)
- **NUM 6:25** — 'seus rostos' regrediu para transliteracao crua 'per-nau-yim'
- **NUM 6:27** — 'abençoe-os' virou palavra truncada sem sentido 'abarbrecem'
- **NUM 7:43** — 'prato-de' virou 'café-da-' (nonsense) e 'para-oferta' regrediu a 'l'minha' crua
- **NUM 7:44** — 'incenso' regrediu para transliteracao crua 'q'toret'
- **NUM 13:27** — 'e mel'/'seu fruto' reverteram a hebraico cru e zavat mal traduzido como 'sangue'
- **NUM 14:20** — 'eu perdoei conforme a tua palavra' reverteu para 'sa-lach-ti ki-dvar-cha' cru
- **NUM 19:14** — Perdeu portugues final 'ele-se-tornará-impuro sete dias', truncando conteudo
- **NUM 22:4** — Truncou todo o trecho apos 'השור' (Balac, rei le-moav etc.), ficou muito mais curto

### PRO (8)

- **PRO 2:7** — Portuguese 'aos justos' reverted to crude transliteration 'la-yesharim'; whole verse became translit.
- **PRO 2:8** — 'caminhos'/'e-caminho' reverted to translit 'arhot'/'ve-de-re-kh'; לנצר became garbled 'para-n-zor'.
- **PRO 2:10** — 'no-seu-coração'/'e-conhecimento'/'para-a-tua-alma' reverted to translit 'belibe'cha veda'at lenafshecha'.
- **PRO 3:11** — 'te provocará na sua repreensão' reverted to crude translit 'takoz betokhachato-u'.
- **PRO 3:12** — 'amará'/'provará'/'com dor' reverted to translit 'yeahav'/'yochiakh'/'uke-ab'.
- **PRO 3:33** — Portuguese glosses reverted to crude translit: 'mearat-','-uneveh','yebarekh-'.
- **PRO 3:34** — 'A-línguas:'/'Mordesse:' reverted to translit 'laletzim'/'yalitz'.
- **PRO 16:22** — after truncated after 'בעלאו', losing the whole final clause וּמוּסַר אֱוִילִים אִוֶּלֶת.

### PSA (47)

- **PSA 1:1** — PT (feliz, os-malvados, de-escarnecedores) reverteu para translit crua (a-she-ri-hi, be-a-tsat re-shaim, u-ve-moshav le-tzim)
- **PSA 1:2** — 'na-lei' virou hebraico cru בְּתוֹרַת e 'seu desejo' virou translit 'che-fetz-o'
- **PSA 4:6** — 'vossos sacrificios' (PT) reverteu para translit truncada 'Zibhei-'
- **PSA 6:1** — sobrescrito coerente virou garble incorreto ('ao em-o-pecado sobre a-grande')
- **PSA 17:5** — PT completo reverteu para translit crua (em-o-ma'alot-ei-kha, nafu-tu pa'amay)
- **PSA 17:7** — PT quase completo virou translit crua total (hafleh hasadei-kha moshi'a hosim...)
- **PSA 18:4** — PT reverteu para translit e garble ('eu salvo-me' virou 'AIUSA')
- **PSA 18:5** — frase PT completa virou translit crua (afapuni, cheveli-, ve-nachalei, yebatunini)
- **PSA 33:3** — 'a-ele' (PT) virou 'a-lui', forma estrangeira nao-portuguesa
- **PSA 37:11** — 'irao-' (PT) reverteu para translit crua 'yirshu-'
- **PSA 37:29** — 'herdarao' (PT correto) reverteu para translit crua 'yirshu-'
- **PSA 40:7** — 'holocausto' virou 'oferta-ascendinga', palavra truncada/agramatical (ingles colado)
- **PSA 44:11** — 'a-eles' (PT) reverteu para translit crua 'lahem'
- **PSA 49:3** — after truncou perdendo 'yachad עָשִׁיר וְאֶבְיוֹן' final que before tinha
- **PSA 52:6** — 'lingua-de engano' (PT) reverteu para hebraico cru [לְשׁוֹן] [מִרְמָה]
- **PSA 92:7** — after perdeu 'entendera a esta-ali', ficou so 'nao a'
- **PSA 99:9** — 'sua-santidade' (PT) reverteu para [קָדְשׁוֹ] cru e 'Elohim-nosso' final foi perdido
- **PSA 104:17** — after removeu glosa PT 'casa-de-a-ela', deixando so [בֵּיתָהּ]
- **PSA 105:38** — after perdeu glosa PT 'sobre-eles'
- **PSA 106:2** — after perdeu palavra final traduzida 'voz'
- **PSA 106:7** — after truncou perdendo 'mar ... juncos'
- **PSA 106:22** — after perdeu 'mar-de juncos', ficou so 'sobre'
- **PSA 106:31** — after perdeu 'eternidade', ficou so 'ate'
- **PSA 106:32** — after perdeu glosa PT 'por-elas'
- **PSA 106:36** — after perdeu glosa PT 'para-laco'
- **PSA 106:40** — after perdeu 'heranca-dele', ficou so 'a'
- **PSA 106:48** — after perdeu 'louvai' (traducao de הללו-יה)
- **PSA 107:1** — after perdeu 'sua-misericordia' (חסדו) final
- **PSA 108:5** — after perdeu 'e-ate' (ועד) traduzido
- **PSA 108:11** — after perdeu 'Edom', ficou so 'ate'
- **PSA 109:2** — after perdeu 'mentira', ficou so 'lingua-de'
- **PSA 109:6** — after perdeu glosa PT 'direita-de-ele', ficou so 'sobre'
- **PSA 109:8** — after dropped Portuguese gloss 'outro' (אַחֵר), leaving the word untranslated in brackets.
- **PSA 109:17** — after lost the trailing gloss 'de-nós', keeping only 'nós'; a translated token was dropped.
- **PSA 109:20** — after truncated ending at 'sobre', losing the translated phrase 'alma-de-mim' (נפשי).
- **PSA 113:2** — after ends dangling at 'e-até', losing 'eternidade' (עולם); object of the phrase gone.
- **PSA 113:8** — after dropped 'seu-povo' gloss of [עַמּוֹ], leaving it untranslated.
- **PSA 115:8** — Data verse (PSA 115:8) lost final gloss 'neles' (בהם); matches the described loss. Auditor ref label off but substance real.
- **PSA 115:12** — after truncated at 'a casa', losing the proper name 'Aharon'.
- **PSA 116:14** — after dropped 'seu-povo' from '[לְכָל־עַמּוֹ] para-todo seu-povo', leaving עמו untranslated.
- **PSA 116:18** — after dropped 'seu-povo' from '[לְכָל־עַמּוֹ] para-todo seu-povo', leaving עמו untranslated.
- **PSA 118:1** — after truncated at 'para-sempre', losing 'sua-misericórdia' (חסדו) — the key clause word.
- **PSA 118:2** — after truncated at 'para-sempre', losing 'sua-misericórdia' (חסדו).
- **PSA 118:3** — after ends at 'porque', losing both 'para-sempre' and 'sua-misericórdia'.
- **PSA 118:27** — after dropped 'o-altar' gloss of [הַמִּזְבֵּחַ], leaving it untranslated.
- **PSA 118:29** — after truncated at 'para-sempre', losing 'sua-misericórdia' (חסדו).
- **PSA 119:11** — after dropped 'para-ti' gloss of [אֶחֱטָא־לָךְ], leaving it untranslated.

### ZEC (1)

- **ZEC 13:8** — after ficou bem mais curto, perdendo a cláusula 'יחרתו יִגְוָעוּ וְהַשְׁלִשִׁית' (as duas partes que perecem e a terça parte).

