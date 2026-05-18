# Motion tokens — artefact de recherche

Ce dépôt documente une taxonomie à deux axes pour les systèmes de motion tokens, un benchmark de neuf design systems en production, et un ensemble de questions ouvertes que la littérature existante n'a pas résolues. Il ne s'agit pas d'une spécification finalisée ni d'une implémentation recommandée. C'est une invitation : si vous avez conçu ou mis en production un système de motion tokens, les questions de ce dépôt sont celles auxquelles nous n'avons pas pu répondre à partir des données publiques seules.

---

## Le modèle à deux axes

La pyramide de tokens standard a été conçue principalement pour la couleur. En couleur, la pyramide décrit une seule dimension : la distance sémantique entre la valeur brute et l'intention nommée. Un token primitif (`red-500`) et un alias sémantique (`color.action.danger`) sont tous deux des scalaires — ce qui change d'un niveau à l'autre, c'est le nom et le sens, jamais la structure de la valeur.

Le mouvement ne fonctionne pas ainsi. À mesure qu'on monte dans la hiérarchie d'abstraction, la **structure** de la valeur change. Un token primitif de mouvement peut être un nombre unique (`duration: 200ms`) ou une recette physique complète (`spring.config: {stiffness, damping, mass}`). Un composite sémantique combine des tokens de domaines différents (`motion.transition.enter: duration + easing`). Un token d'orchestration décrit une relation temporelle entre plusieurs éléments — quelque chose que la couleur n'a jamais eu besoin d'exprimer.

Cela signifie que les motion tokens ont deux dimensions indépendantes :

**Axe 1 — Niveau d'abstraction** (vertical) : la distance sémantique entre la valeur brute et le contexte d'utilisation. Le même axe que celui de la couleur et de la typographie.

| Niveau | Ce qu'il exprime | Qui décide |
|---|---|---|
| Primitive | Valeurs brutes de la marque — échelles de durée, courbes d'easing, spring configs | Équipe de marque / design system |
| Sémantique | Intentions nommées — `motion.duration.fast`, `motion.spring.bouncy` | Équipe design system |
| Application | Patterns nommés liés à un rôle UI — `motion.appear`, `motion.stagger.list` | Équipes design system + produit |
| Composant | Mouvement délimité à un composant spécifique | Équipe composant |

**Axe 2 — Profondeur de composition** (horizontal) : la complexité structurelle de la valeur du token. Spécifique au mouvement.

| Profondeur | Ce qu'est la valeur | Exemple |
|---|---|---|
| 1 — Scalaire | Une valeur unique | `duration.200 = 200ms` |
| 2 — Recette | Plusieurs paramètres du même domaine physique | `spring.config.gentle = {stiffness: 200, damping: 20, mass: 1}` |
| 3 — Composite | Valeurs de domaines différents combinées | `motion.transition.enter = {duration.slow + easing.enter}` |
| 4 — Orchestration | Relations temporelles entre éléments | `motion.stagger.list = {interval: 20ms, from: start, cap: 500ms}` |
| 5 — Objet d'intention | Description comportementale platform-agnostique, résolue par un pipeline de build | `motion.emerge.panel = {behavior: "spring", direction: "from-below", ...}` |

**La matrice complète :**

| | Profondeur 1 — Scalaire | Profondeur 2 — Recette | Profondeur 3 — Composite | Profondeur 4 — Orchestration | Profondeur 5 — Objet d'intention |
|---|---|---|---|---|---|
| **Primitive** | `duration.200`, `easing.standard` | `spring.config.gentle` | — | — | — |
| **Sémantique** | `motion.duration.fast`, `motion.easing.enter` | `motion.spring.bouncy` | `motion.transition.enter` | — | — |
| **Application** | — | — | `motion.appear` | `motion.stagger.list` | `motion.emerge.panel` *(frontier)* |
| **Composant** | — | — | `component.button.press` | `component.toast.sequence` | — |

Les cellules vides reflètent l'état actuel des pratiques, non des contraintes architecturales. En couleur, la matrice entière se réduit à une seule colonne — profondeur 1, tous niveaux. En mouvement, la matrice est peuplée sur les deux dimensions.

**Aliasing et composition — la distinction centrale :**

- L'aliasing est un renommage : `motion.duration.fast → {duration.100}`. Le consommateur reçoit `100ms`. Le token est un pointeur.
- La composition est une agrégation : `motion.transition.enter → {duration.400 + easing.enter}`. Le consommateur reçoit un objet à deux paramètres. Aucun des deux tokens sources n'exprime cela seul.

L'aliasing est familier — c'est le mécanisme central des tokens sémantiques en couleur. La composition est la nouvelle opération qu'introduit le mouvement. Chaque passage de la profondeur 1 à la profondeur 5 est une opération de composition, pas un renommage.

---

## Ce que nous avons analysé

Neuf design systems, analysés sur ce qu'ils tokenisent, comment ils le nomment, et jusqu'où ils vont sur l'axe de profondeur de composition.

| Système | Décision notable | Profondeur maximale atteinte |
|---|---|---|
| Material Design 3 | Spring tokens sur Android (spatial vs. effets — distinction sur l'amortissement critique). Le web utilise uniquement des tweens. | Profondeur 2 (spring configs Android) |
| Shopify Polaris | Tokenise des animations `@keyframes` complètes, pas uniquement leurs paramètres. | Profondeur 3 (objets keyframe) |
| IBM Carbon | `motion("standard", "productive")` — l'intention déclarée comme contrainte structurelle au point d'utilisation, pas comme documentation optionnelle. | Profondeur 1 (scalaires uniquement, intention via appel de fonction) |
| Microsoft Fluent 2 | `durationGentle` casse la logique de vitesse de l'échelle — « gentle » est un mot de caractère, pas un mot de vitesse. | Profondeur 1 |
| Apple HIG | Spring en premier, utilise « response » (durée perçue) plutôt que « duration » — évite délibérément d'impliquer un point d'arrivée fixe. | Profondeur 2 (spring recipes) |
| Adobe Spectrum 2 | Index abstrait découplé de la valeur : le nom du token `–100` ne correspond pas à `100ms`. | Profondeur 1 |
| GitHub Primer | Tokens `transition` composites comme surface d'édition principale — les auteurs choisissent une transition, pas une paire durée + easing. Métadonnées d'usage pour LLM intégrées dans les définitions de tokens. | Profondeur 3 (transitions composites) |
| eBay Skin | 17ms « instant » ancré sur une image vidéo à 60fps. Encodage directionnel dans le nom du token (`quick.enter`, `soft.exit`). | Profondeur 1 |
| Uber Base | Échelle de poids non littérale : `timing100 = 250ms`. Les nombres sont un rang relatif, pas des valeurs en millisecondes. | Profondeur 1 |

---

## Ce que nous avons construit

- **Un token set de base au format DTCG** couvrant les niveaux de maturité 1–3 : échelle de durée, easings sémantiques, alias de durée sémantiques, transitions composites, et spring configs avec un type personnalisé en attente d'extension DTCG. Voir [`tokens/motion.baseline.json`](tokens/motion.baseline.json).
- **Un spring resolver** (`tokens/spring-resolver.js`) qui convertit les paramètres physiques de spring (stiffness, damping, mass) en approximations CSS `linear()`. Prend en charge trois paramétrages d'entrée : physique brute, notation damping-ratio (Material Design 3), et notation Apple response/dampingFraction. Inclut une validation par rapport aux presets spring de M3 et d'Apple.
- **Un prototype Storybook** démontrant un mouvement piloté par tokens aux niveaux 1–3 : [Storybook →](https://hamilaism.github.io/motion-tokens)

---

## Questions ouvertes

1. **`prefers-reduced-motion` est-il un mode ou une condition ?** Le dark mode échange des valeurs contre d'autres valeurs. Le reduced motion peut supprimer des catégories entières : spring devient tween, stagger devient synchrone, l'orchestration devient instantanée. Ce n'est pas une substitution de valeur — c'est une réduction structurelle. Comment le système de tokens devrait-il le représenter ?

2. **La spring config est-elle la bonne unité minimale tokenisable ?** La position actuelle est que `stiffness`, `damping` et `mass` ne sont pas tokenisables indépendamment — ce sont des paramètres d'un système physique, analogues aux canaux RGB d'une couleur. Mais certaines équipes exposent la stiffness de façon indépendante. Existe-t-il un cas d'usage où faire varier un seul paramètre est la bonne surface d'édition ?

3. **Comment les équipes segmentent-elles l'intention de mouvement en pratique ?** Carbon utilise productive/expressive. Polaris interdit entièrement le mouvement expressif. D'autres organisations divisent entre core/signature, UI/brand, ou default/celebratory. Aucune preuve qu'un vocabulaire se généralise. À quoi ressemble la segmentation d'intention dans les organisations qui maintiennent un système de tokens depuis deux ans ou plus — et le vocabulaire a-t-il évolué ?

4. **La profondeur 5 (l'animation comme objet) existe-t-elle dans un système en production aujourd'hui ?** LottieFiles exporte des données de keyframes calculées (platform-agnostique, résolues par le player), ce qui est l'analogue le plus proche. Mais Lottie est un export de keyframes résolus, pas une description comportementale abstraite résolue au build time. Existe-t-il un système qui stocke une intention animée et la résout par plateforme ?

5. **Que devrait contenir un module Motion DTCG ?** La spec stable d'octobre 2025 définit `duration`, `cubicBezier` et `transition`. Les spring configs, les stagger tokens, les relations d'orchestration et les objets d'animation sont absents. Un module Motion figure dans la roadmap DTCG. Cette recherche propose que le module nécessite au minimum : un type composite `spring`, un type `stagger`, et un mécanisme pour encoder une intention animée platform-agnostique. Que faut-il ajouter, et que faut-il en exclure ?

---

## Comment contribuer

Ouvrez une issue, commentez directement le fichier [`taxonomy.md`](taxonomy.md), ou contactez les auteurs. Cette recherche alimente un chapitre de *The Design Tokens Book* — si vous avez implémenté un système de motion tokens en production, nous voulons vous entendre. Particulièrement utile : des exemples de segmentation d'intention restée stable entre les itérations du système, des preuves de tokens de profondeur 4 ou 5 en production, et toute proposition d'extension DTCG pour les types de mouvement.
