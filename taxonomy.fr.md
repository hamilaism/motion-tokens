# Taxonomie des motion tokens — un modèle à deux axes

Ce document propose une taxonomie pour les systèmes de motion tokens. La pyramide de tokens standard — développée principalement pour la couleur et la typographie — décrit une seule dimension : la distance entre un token et sa valeur brute. Le mouvement nécessite une seconde dimension : la complexité structurelle de la valeur du token. Ce document nomme et formalise les deux axes, définit la classification complète des types de motion tokens, et identifie plusieurs défis structurels qui distinguent le mouvement de la couleur et de la typographie.

---

## Le modèle à deux axes

### Pourquoi la couleur ne suffit pas comme modèle mental

La pyramide de tokens standard a été conçue principalement pour la couleur (et secondairement pour la typographie). En couleur, la pyramide décrit une seule dimension : la distance sémantique entre la valeur brute et l'intention nommée. Une primitive de couleur est `red-500: #EF4444` — un scalaire. Un alias sémantique de couleur est `color.action.danger: {red-500}` — également un scalaire, simplement avec un nom porteur d'intention. Un token de composant `button.danger.background: {color.action.danger}` — toujours un scalaire, délimité plus précisément.

La nature de la valeur — une couleur — ne change jamais, quel que soit le niveau de la pyramide. Ce qui change, c'est seulement le nom et la couche de sens qui lui est attachée.

Le mouvement ne fonctionne pas ainsi. À mesure qu'on monte dans la pyramide, la *structure* de la valeur change. Un token primitif de mouvement peut être un scalaire (`duration: 200ms`), mais aussi une recette physique complète (`spring.config: {stiffness, damping, mass}`). Un token de mouvement sémantique peut être un alias scalaire (`motion.duration.fast`) ou un composite cross-domain (`motion.transition.enter: duration + easing`). Un token d'application peut encoder une relation temporelle entre plusieurs éléments (`motion.stagger.list`). Un token frontier peut décrire une intention comportementale platform-agnostique (`motion.appear.panel`) sans aucune valeur fixe.

Cela signifie que les motion tokens ont **deux dimensions indépendantes** :

1. **Niveau d'abstraction** — la distance sémantique entre la valeur brute et le contexte d'utilisation. Identique à la couleur et à la typographie.
2. **Profondeur de composition** — la complexité structurelle de la valeur du token. Spécifique au mouvement.

Comprendre les deux dimensions est indispensable pour concevoir un système de motion tokens. La pyramide standard ne décrit que l'axe 1.

---

### Axe 1 — Niveaux d'abstraction

Le niveau d'abstraction décrit *pourquoi* un token existe et *qui décide de sa valeur.*

#### Primitive

**Nature :** Une décision de design brute sans signification sémantique. Existe pour représenter une valeur dans la palette de la marque — une durée spécifique, une courbe spécifique, une recette physique spécifique. Les tokens primitifs n'expriment pas comment ou quand quelque chose se déplace ; ils expriment les options que la marque a définies.

**Qui décide :** L'équipe de marque ou de design system. Ce sont les variables de l'ADN motion de la marque.

**Caractéristiques :**
- Agnostique au contexte. `duration.200` ne sait pas s'il sera utilisé pour un bouton ou une modale.
- Stable entre les surfaces produit. Les mêmes primitives s'appliquent à l'ensemble du produit.
- Variable entre les marques. La marque A peut définir `duration.200 = 200ms` ; la marque B peut mapper le même token sur `160ms` pour un produit au tempo plus rapide.

**Pourquoi il existe :** La couche primitive est l'endroit où la variance de marque est encodée. C'est la couche de tokens qui change quand une marque modifie son tempo visuel, sa personnalité physique ou son caractère motion. Sans elle, les changements de marque nécessitent de trouver et remplacer les valeurs dans l'ensemble du codebase.

**Exemples :**
- `duration.100 = 100ms` — un point sur l'échelle de durée
- `easing.standard = cubic-bezier(0.4, 0, 0.2, 1)` — une courbe nommée
- `spring.config.gentle = { stiffness: 200, damping: 20, mass: 1 }` — une recette physique

---

#### Sémantique

**Nature :** Un alias nommé qui référence une primitive et ajoute de l'intention. La couche sémantique répond à la question : *à quoi sert ce mouvement ?* Pas ce à quoi il ressemble, mais le rôle qu'il joue dans l'expérience.

**Qui décide :** L'équipe design system. Les tokens sémantiques représentent le vocabulaire motion partagé — le langage commun pour décrire l'intention de mouvement.

**Caractéristiques :**
- Porteur d'intention. `motion.duration.fast` communique « c'est la vitesse pour les micro-interactions » sans encoder une valeur en dur.
- Stable entre les surfaces produit, mais peut varier entre les marques (une marque luxe et une marque ludique peuvent toutes deux avoir `motion.spring.bouncy` mais pointer vers des spring configs différentes).
- Référencé par les composants et les tokens d'application — jamais par des valeurs brutes.

**Pourquoi il existe :** La couche sémantique est l'endroit où les décisions de design sont documentées comme intentions. C'est aussi là que vit le vocabulaire motion organisationnel — les intentions nommées que designers et développeurs partagent. Quand un designer dit « utilise l'easing d'entrée », c'est un token sémantique. Quand un développeur implémente le reduced motion, il change les résolutions des tokens sémantiques.

**La distinction aliasing/composition :** les tokens sémantiques peuvent être des alias purs (un token pointant vers une primitive) ou des composites (un token combinant plusieurs primitives). C'est là que la profondeur de composition devient significative — voir Axe 2.

**Exemples :**
- `motion.duration.fast → {duration.100}` — alias, aliasing pur
- `motion.easing.enter → {easing.decelerate}` — alias, aliasing pur
- `motion.spring.bouncy → {spring.config.bouncy}` — alias, primitive comportementale
- `motion.transition.enter → {duration.slow + easing.enter}` — composite, cross-domain

---

#### Application

**Nature :** Un pattern d'animation nommé associé à un rôle ou contexte UI spécifique. Les tokens d'application combinent des tokens sémantiques avec des informations spatiales ou contextuelles. Ils décrivent *ce que fait une chose spécifique* dans l'interface — pas la vitesse ni la courbe, mais la chorégraphie complète d'un pattern spécifique.

**Qui décide :** L'équipe design system, en collaboration avec les équipes produit. Les tokens d'application sont la monnaie courante des auteurs de composants.

**Caractéristiques :**
- Sensible au contexte. `motion.appear` implique une direction spatiale spécifique (depuis le bas), un timing spécifique (duration.slow) et une courbe spécifique (easing.enter). Il encode un pattern complet.
- Réutilisable entre composants. Tout composant ayant besoin d'apparaître depuis le bas utilise `motion.appear`.
- Non variable selon la marque au niveau du token — la variance de marque est héritée des primitives et sémantiques référencées.

**Pourquoi il existe :** Les tokens d'application évitent à chaque auteur de composant de réinventer les mêmes patterns. « Apparaître depuis le bas, lentement, avec décélération » est un pattern récurrent. Sans token d'application, chaque équipe composant décide des détails indépendamment — créant de légères incohérences. Avec le token, la décision est prise une fois et partagée.

**La dimension relationnelle :** certains tokens d'application — stagger, orchestration — décrivent des relations temporelles entre plusieurs éléments, pas des propriétés d'un seul élément. Ils sont structurellement différents de tous les autres niveaux de tokens. Voir Axe 2.

**Exemples :**
- `motion.appear → {transition.enter + from: below}` — pattern d'apparition
- `motion.dismiss → {transition.exit + to: below}` — pattern de disparition
- `motion.expand → {transition.expand + origin: top}` — accordéon, panneaux
- `motion.stagger.list → {interval: 20ms, from: start, cap: 500ms}` — relation d'entrée de liste

---

#### Composant

**Nature :** Un token délimité à un composant spécifique qui encode le polymorphisme motion propre au composant. Utilisé quand un composant a besoin de variantes motion que les tokens d'application seuls ne peuvent pas exprimer.

**Qui décide :** L'équipe composant, dans les limites fixées par la couche application.

**Caractéristiques :**
- Délimité de façon stricte. `component.modal.enter` est spécifique à la modale — non réutilisable ailleurs.
- Rarement nécessaire. La plupart des animations de composants peuvent être couvertes par les tokens d'application. Les tokens motion de niveau composant apparaissent quand un composant a un comportement motion contextuel impossible à généraliser.
- Encode le polymorphisme. Un toast qui doit glisser depuis des directions différentes selon sa position à l'écran nécessite des tokens au niveau composant.

**Pourquoi il existe :** La même raison pour laquelle les tokens de composant existent pour la couleur — pour gérer les cas que les couches sémantique et application ne peuvent pas généraliser. L'objectif est de garder cette couche fine.

**Exemples :**
- `component.modal.enter → {motion.appear + overlay.fade}` — entrée spécifique à la modale
- `component.toast.enter-left → {motion.slide-in.left}` — variante dépendante de la position
- `component.button.press → {motion.transition.feedback + scale: 0.97}` — effet de pression tactile

---

### Axe 2 — Profondeur de composition

La profondeur de composition décrit *de quel type de chose la valeur du token est.* C'est là que le mouvement diffère fondamentalement de la couleur.

#### Profondeur 1 — Scalaire

**Nature :** Une valeur unique d'un type unique. Le token stocke un nombre, une chaîne, une unité. Aucune structure interne.

**Pourquoi c'est important :** C'est le point de départ. Tous les tokens de couleur sont à cette profondeur. La plupart des tokens de durée et d'easing sont à cette profondeur. Un token scalaire est l'unité la plus simple possible — il se résout en une seule valeur de propriété CSS.

**Relation aux niveaux d'abstraction :** Les scalaires existent à tous les niveaux d'abstraction. `duration.200` (primitive) et `motion.duration.fast` (alias sémantique) sont tous deux des scalaires de profondeur 1. L'alias sémantique n'ajoute pas de complexité structurelle — seulement du sens.

**Exemples :**
- `duration.200 = 200ms`
- `easing.standard = cubic-bezier(0.4, 0, 0.2, 1)`
- `repeat = 3`
- `direction = alternate`

---

#### Profondeur 2 — Recette

**Nature :** Plusieurs valeurs du **même domaine physique** qui doivent apparaître ensemble pour avoir un sens. Les sous-valeurs ne sont pas tokenisables indépendamment — elles sont des paramètres d'un seul système comportemental.

**La distinction par rapport au scalaire :** `duration: 200ms` est significatif seul — on peut l'utiliser dans une `transition-duration` CSS. `stiffness: 300` ne l'est pas — c'est un paramètre d'un système de physique spring et ne signifie rien sans `damping` et `mass`. La recette est l'unité minimale exposable.

**Pourquoi c'est important :** Les recettes introduisent un nouveau type de primitive qui n'existe pas en couleur ou en typographie : la *primitive comportementale*. La personnalité physique de la marque réside ici — un spring précis et fortement amorti contre un spring souple et rebondissant. Ce sont des décisions de marque, mais qui opèrent au niveau des paramètres physiques, pas des intentions sémantiques.

**Analogie :** Une recette est comme une couleur définie dans un espace colorimétrique qui nécessite trois canaux (L, C, H en OKLCH) pour avoir un sens. On ne peut pas tokeniser L seul. Mais la recette n'est pas un composite au sens compositionnel — les trois canaux appartiennent au même système.

**Exemples :**
- `spring.config.gentle = { stiffness: 200, damping: 20, mass: 1 }` — une recette physique spring
- `spring.response.soft = { response: 0.5, dampingFraction: 0.8 }` — modèle paramétrique Apple (SwiftUI)
- `elastic.bounce = { amplitude: 1.2, period: 0.4 }` — recette d'easing paramétrique

---

#### Profondeur 3 — Composite (cross-domain)

**Nature :** Plusieurs valeurs de **domaines différents** combinées en un seul token. La combinaison crée quelque chose qu'aucun domaine ne peut exprimer seul.

**La distinction par rapport à la recette :** Une recette combine des paramètres du même système (physique spring). Un composite combine des tokens de systèmes entièrement différents : une durée (domaine temporel) avec un easing (domaine comportemental). Aucun n'encode l'autre. Ensemble, ils décrivent une transition tween complète.

**Pourquoi c'est important :** Les composites sont la monnaie courante du design motion. Quand un designer dit « utilise la transition d'entrée », il entend une combinaison spécifique de timing et de courbe — pas une durée seule, pas un easing seul. Le token composite est ce qui rend cette intention exprimable comme une référence unique.

**Relation au DTCG :** Le type `transition` du DTCG est un composite de profondeur 3. C'est le seul type composite actuellement spécifié. Les spring configs, les recettes élastiques et autres combinaisons ne sont pas encore dans la spec.

**Exemples :**
- `motion.transition.enter = { duration: {duration.400}, easing: {easing.enter}, delay: 0 }` — temps + comportement
- `motion.transition.feedback = { duration: {duration.50}, easing: {easing.standard} }` — temps + comportement
- `motion.appear = { transition: {motion.transition.enter}, transform: from-below }` — comportement + espace

---

#### Profondeur 4 — Orchestration

**Nature :** Un token qui décrit des **relations temporelles entre plusieurs éléments**, pas des propriétés d'un seul élément. La valeur est un ensemble de règles pour séquencer une collection.

**La rupture structurelle :** toutes les profondeurs précédentes décrivent une propriété d'*une chose*. Les tokens d'orchestration décrivent *comment des choses se rapportent les unes aux autres dans le temps*. C'est un type de valeur catégoriquement différent — il ne peut pas se résoudre en une propriété CSS parce qu'il nécessite de connaître le nombre et la disposition des éléments concernés.

**Pourquoi c'est important :** Le stagger et l'orchestration font partie des patterns motion les plus courants dans les interfaces — entrées de listes, apparitions de grilles, retours en cascade. Sans tokens d'orchestration, chaque équipe composant implémente le stagger indépendamment, sans langage partagé pour décrire l'intention.

**Placement dans la hiérarchie :** les tokens d'orchestration appartiennent nativement au niveau Application ou Composant, où le nombre d'éléments et la disposition sont connus. Ils ne peuvent pas vivre aux niveaux Primitive ou Sémantique parce qu'ils ont besoin d'un contexte pour se résoudre.

**Exemples :**
- `motion.stagger.list = { interval: 20ms, from: start, cap: 500ms }` — entrée de liste verticale
- `motion.stagger.grid = { interval: 30ms, from: center }` — entrée de grille depuis le centre
- `motion.sequence.onboarding = [ step1: appear, step2: {delay: 300ms, move}, step3: ... ]` — séquence orchestrée

---

#### Profondeur 5 — Objet d'intention (frontier)

**Nature :** Une description comportementale platform-agnostique qui encode *ce que quelque chose fait* plutôt que *comment il est implémenté*. Un objet d'intention est résolu par un pipeline de build en rendu spécifique à la plateforme — du code différent par plateforme, la même intention.

**Pourquoi c'est différent de toutes les autres profondeurs :** Aux profondeurs 1–4, la valeur du token se mappe sur un concept CSS ou WAAPI connu (un nombre, une courbe, un ensemble de paramètres, une règle de séquence). À la profondeur 5, la valeur du token est une description comportementale abstraite sans équivalent CSS direct. Le code spécifique à la plateforme est généré par un resolver.

**Pourquoi c'est important :** C'est l'équivalent motion du stockage d'une couleur dans un espace colorimétrique perceptuel et de la génération de valeurs hex/P3/LCH spécifiques à la plateforme à partir de celui-ci. Le token décrit l'intention dans un format plus riche que toute représentation native d'une seule plateforme. Un resolver gère la transformation par cible.

**État actuel :** Aucun design system en production n'a implémenté des tokens de profondeur 5 tels que définis ici. Lottie (After Effects vers web/iOS/Android) est l'analogue le plus proche, mais il exporte des données de keyframes calculées — pas une intention comportementale abstraite. Le concept d'objet d'intention décrit la couche de tokens *au-dessus* de ce que fait Lottie — la source à partir de laquelle le rendu spécifique à la plateforme serait généré.

```json
// Exemple d'objet d'intention (non implémenté dans aucun système en production)
{
  "motion.emerge.panel": {
    "behavior": "spring",
    "direction": "from-below",
    "distance": "medium",
    "spring": { "$value": "{spring.config.gentle}" },
    "delay": { "$value": "{motion.delay.none}" }
  }
}

// Résolu par plateforme :
// CSS    → @keyframes + approximation spring linear()
// SwiftUI → .spring(response: 0.4, dampingFraction: 0.8) + .offset(y:)
// Compose → spring(stiffness=200, dampingRatio=0.8) + offset
// Lottie  → JSON de keyframes calculées
```

---

### La matrice complète

Ces deux axes sont indépendants. La position d'un token sur un axe ne détermine pas sa position sur l'autre.

| | Profondeur 1 — Scalaire | Profondeur 2 — Recette | Profondeur 3 — Composite | Profondeur 4 — Orchestration | Profondeur 5 — Objet d'intention |
|---|---|---|---|---|---|
| **Primitive** | `duration.200`, `easing.standard` | `spring.config.gentle` | — | — | — |
| **Sémantique** | `motion.duration.fast`, `motion.easing.enter` | `motion.spring.bouncy` | `motion.transition.enter` | — | — |
| **Application** | — | — | `motion.appear` | `motion.stagger.list` | `motion.emerge.panel` *(frontier)* |
| **Composant** | — | — | `component.button.press` | `component.toast.sequence` | — |

Les cellules vides ne sont pas des contraintes architecturales — ce sont des observations sur l'état actuel des pratiques. La matrice pourrait être peuplée différemment à mesure que le domaine évolue.

**Observation clé :** en couleur, la matrice entière se réduit à une seule colonne — profondeur 1, tous niveaux. En mouvement, la matrice est peuplée sur les deux dimensions. C'est ce qui rend la conception de motion tokens structurellement plus complexe — non pas parce qu'elle est intrinsèquement plus difficile, mais parce qu'elle couvre un espace de conception plus vaste.

---

### Aliasing et composition — la distinction centrale

Au niveau sémantique, deux opérations différentes sont à l'œuvre :

**L'aliasing** est un renommage. `motion.duration.fast → {duration.100}` ajoute un nom porteur d'intention mais ne change ni la nature ni la structure de la valeur. Le consommateur reçoit `100ms`. Le token est un pointeur.

**La composition** est une agrégation. `motion.transition.enter → {duration.400 + easing.enter}` crée quelque chose qu'aucun token source ne peut exprimer. Le consommateur reçoit un objet à deux paramètres. Le token est une recette construite à partir d'autres recettes.

L'aliasing est familier — c'est le mécanisme central des tokens sémantiques en couleur. La composition est la nouvelle opération qu'introduit le mouvement. En passant de la profondeur 1 à la profondeur 5, chaque étape est une opération de composition, pas seulement un renommage. C'est pourquoi la définition standard « token = nom + valeur » est insuffisante pour le mouvement — aux profondeurs de composition élevées, la « valeur » est elle-même un objet structuré.

---

## Classification complète

### Primitives — scalaires

Valeur unique, sans relation avec d'autres paramètres. Peut exister seule.

| Token | Type DTCG | Exemple | Notes |
|---|---|---|---|
| `duration.*` | `duration` | `100ms`, `300ms` | Échelle de valeurs |
| `delay.*` | `duration` | `50ms` | Même type que duration |
| `repeat-delay.*` | `duration` | `200ms` | |
| `end-delay.*` | `duration` | `100ms` | WAAPI uniquement |
| `repeat` | number | `3`, `-1` (infini) | |
| `direction` | enum | `normal`, `reverse`, `alternate` | |
| `frame-rate` | number | `24`, `60` | Lottie / vidéo |

> **Note sur les scalaires spring :** stiffness, damping et mass ne sont pas des tokens autonomes. Ce sont des paramètres internes d'une spring config — analogues à R/G/B dans une couleur, qui ne sont pas non plus tokenisables individuellement. `stiffness: 300` n'a aucun sens isolément. L'unité minimale tokenisable est la spring config complète à la profondeur 2.

---

### Primitives — easing

Les easings sont des scalaires. Un cubic-bezier `[0.4, 0, 0.2, 1]` contient 4 nombres mais exprime **un seul concept** — une courbe. Personne ne tokenise un seul point de contrôle. Le critère est la consommation, pas la structure interne.

> **Règle de qualification :** un token est scalaire si ses sous-valeurs ne sont pas tokenisables individuellement et n'ont pas de sens isolément. Un token est composite si ses sous-valeurs ont une existence indépendante et peuvent être variées séparément.

| Token | Type DTCG | Exemple | Notes |
|---|---|---|---|
| `easing.linear` | `cubicBezier` | `[0, 0, 1, 1]` | Une courbe = un concept |
| `easing.standard` | `cubicBezier` | `[0.4, 0, 0.2, 1]` | |
| `easing.decelerate` | `cubicBezier` | `[0, 0, 0.2, 1]` | |
| `easing.accelerate` | `cubicBezier` | `[0.4, 0, 1, 1]` | |
| `easing.steps.*` | steps | `steps(5, end)` | |

---

### Primitives — recette (profondeur 2)

Plusieurs paramètres du même domaine physique. Forment une recette complète.

| Token | Paramètres | Exemple | Notes |
|---|---|---|---|
| `spring.config.*` | stiffness + damping + mass | `{ s: 300, d: 20, m: 1 }` | Recette physique nommée |
| `spring.response.*` | response + dampingFraction | `{ r: 0.3, df: 0.8 }` | Abstraction Apple (SwiftUI) |
| `elastic.*` | amplitude + period | `{ a: 1, p: 0.3 }` | Easing paramétrique GSAP |
| `inertia.*` | power + timeConstant | `{ p: 0.8, tc: 700 }` | Décélération post-geste |

> Ces composites sont des **primitives comportementales** : ils encodent les paramètres d'un moteur physique, pas une intention d'usage. C'est ici que la marque choisit ses recettes physiques.

---

### Sémantique — alias scalaires

Alias nommés par intention. Référencent des primitives, portent une signification d'usage.

| Token | Référence | Intention |
|---|---|---|
| `motion.duration.instant` | `{duration.50}` | Retour imperceptible |
| `motion.duration.fast` | `{duration.100}` | Micro-interactions |
| `motion.duration.default` | `{duration.200}` | Transitions standard |
| `motion.duration.slow` | `{duration.400}` | Apparitions, modales |
| `motion.duration.deliberate` | `{duration.700}` | Onboarding, storytelling |
| `motion.easing.enter` | `{easing.decelerate}` | Élément arrivant à l'écran |
| `motion.easing.exit` | `{easing.accelerate}` | Élément quittant l'écran |
| `motion.easing.move` | `{easing.standard}` | Déplacement dans l'écran |
| `motion.easing.emphasize` | `{easing.emphasize}` | Attirer l'attention |

---

### Sémantique — alias de recette (profondeur 2)

Alias de spring config avec intention.

| Token | Référence | Intention |
|---|---|---|
| `motion.spring.crisp` | `{spring.config.crisp}` | Réponse vive, sans dépassement |
| `motion.spring.gentle` | `{spring.config.gentle}` | Transition douce |
| `motion.spring.bouncy` | `{spring.config.bouncy}` | Marque expressive / ludique |
| `motion.spring.snappy` | `{spring.config.snappy}` | Retour de geste rapide |

---

### Sémantique — composite (profondeur 3, cross-domain)

Combine des paramètres de domaines différents. Le type `transition` du DTCG en est un exemple natif.

| Token | Paramètres | Notes |
|---|---|---|
| `motion.transition.enter` | duration.slow + easing.enter + delay.0 | Entrée d'élément |
| `motion.transition.exit` | duration.fast + easing.exit | Sortie d'élément |
| `motion.transition.move` | duration.default + easing.move | Repositionnement |
| `motion.transition.expand` | duration.default + easing.decelerate | Expansion |
| `motion.transition.feedback` | duration.instant + easing.standard | Réponse à une action |

> Les composites de profondeur 3 sont la monnaie courante pour les composants. C'est le niveau auquel designers et développeurs consomment le mouvement au quotidien.

---

### Sémantique — modes et préférences

Pas des valeurs, mais des contextes qui modifient les valeurs des autres tokens.

| Mode | Ce qu'il affecte | Comportement |
|---|---|---|
| `prefers-reduced-motion` | Toutes les durées, springs, staggers | Réduit ou supprime — voir défis du modèle |
| `motion.intent.*` | Duration + easing + type de spring | Segmentation d'intention définie par l'organisation |

> **Note sur reduced-motion :** contrairement au dark mode (qui échange des valeurs), reduced-motion peut supprimer des catégories entières (spring devient tween, stagger devient synchrone, orchestration devient instantanée). Il vaut peut-être mieux le traiter comme une condition système qu'un mode de token.

> **Note sur la segmentation d'intention :** les organisations définissent leur propre vocabulaire à ce niveau. IBM Carbon utilise productive/expressive. Polaris interdit entièrement le mouvement expressif. Autres architectures : core/signature, standard/campaign, UI/brand, default/celebratory. Le système de tokens fournit le mécanisme ; l'organisation définit le vocabulaire.

> **Sur la variance de marque au niveau sémantique :** en couleur, la marque fait varier les primitives et la couche sémantique reste stable entre les marques. En mouvement, le type d'animation (tween vs. spring, et quelle personnalité spring) est lui-même une décision de marque — mais une décision qui se situe au niveau sémantique, pas au niveau primitif. Une marque luxe et une marque ludique peuvent partager la même échelle de durée mais diverger complètement sur `motion.spring.*`. La variance de marque en mouvement opère simultanément à deux niveaux.

---

### Application — composite (profondeur 3–4)

Animations nommées par rôle UI. Combinent des tokens sémantiques et un contexte spatial.

| Token | Paramètres | Notes |
|---|---|---|
| `motion.appear` | transition.enter + from: below | Apparition type |
| `motion.dismiss` | transition.exit + to: below | Disparition |
| `motion.slide-in` | transition.enter + axis: x | Entrée latérale |
| `motion.expand` | transition.expand + origin: top | Accordéon |
| `motion.fade` | duration.default + opacity uniquement | Compatible reduced-motion |

---

### Application — stagger (profondeur 4)

Le stagger ne décrit pas une propriété d'un élément mais une **relation entre éléments**. Il appartient à ce niveau parce qu'il nécessite un contexte : combien d'éléments, dans quelle disposition.

| Token | Paramètres | Notes |
|---|---|---|
| `motion.stagger.list` | amount: 0.3s, from: start | Listes verticales |
| `motion.stagger.grid` | amount: 0.5s, from: center | Grilles |
| `motion.stagger.cascade` | amount: 0.2s, from: start, ease: power2 | Effet de cascade prononcé |

---

### Composant — profondeur 4

Spécifique à un composant. Combine des tokens d'application et le contexte sémantique du composant.

| Token | Paramètres | Notes |
|---|---|---|
| `component.modal.enter` | motion.appear + overlay.fade | |
| `component.toast.appear` | motion.slide-in + motion.stagger.list | |
| `component.accordion.expand` | motion.expand + hauteur du composant | |
| `component.button.press` | motion.transition.feedback + scale | |

---

### Meta tokens

Ces tokens ne s'intègrent pas dans le modèle standard primitive/sémantique/composant. Ils conditionnent la *pertinence* des autres tokens plutôt que leurs valeurs.

| Token | Ce qu'il déclare | Impact |
|---|---|---|
| `motion.timeline-type` | `time` ou `progress` | Rend `duration` pertinente ou non |
| `motion.intent-mode` | Vocabulaire défini par l'organisation | Active un segment d'intention nommé |
| `motion.engine` | `tween` ou `spring` | Détermine le type composite utilisé |

---

## Taxonomie des métaphores de mouvement

Cinq types de métaphores ont émergé de l'analyse des design systems en production.

### 1. Métaphore physique (Apple HIG)
Le mouvement imite le comportement des objets dans le monde physique : masse, élasticité, dynamique, gravité. Le spring est l'incarnation de cette métaphore. L'objectif est que l'interface cesse d'« avoir l'air d'un ordinateur ».

### 2. Métaphore matérielle (Material Design 3)
Les surfaces ont un comportement, une élévation, une lumière. La distinction standard/emphasized encode le « caractère » du matériau animé. La courbe emphasized est conçue pour être physiquement distinctive — non reproductible comme un seul cubic-bezier.

### 3. Métaphore du caractère (IBM Carbon)
Productive vs. expressive : le mouvement comme outil invisible (productive) vs. marqueur de moment (expressive). La métaphore est comportementale — le mouvement signale si l'interface sert la tâche ou l'expérience.

### 4. Métaphore linguistique (Adobe Spectrum 2)
Le ton du mouvement comme le ton du texte : formel, direct, décontracté, subtil. La direction du mouvement porte une sémantique : horizontal signifie progrès, diagonal signifie disruption, rotatif signifie attente.

### 5. Métaphore affordance / comportementale
Ce que l'objet « fait » dans le monde — sa réponse physique à l'interaction. Un bouton s'enfonce (pression), flotte (élévation), s'éclaircit (activation), rebondit (confirmation). Cette métaphore est la plus proche de la pensée en design d'interaction et la plus utile pour construire un vocabulaire sémantique avec les équipes produit.

C'est là que le motion token se connecte à l'intention produit : les tokens ne nomment pas des paramètres (`duration.fast`) ni des intentions abstraites (`motion.enter`) — ils nomment des comportements perçus (`motion.press`, `motion.lift`, `motion.emerge`).

### Axes de nommage

Cinq axes de nommage possibles pour un motion token :
1. **Physique :** spring, tween, elastic, inertia
2. **Intention :** enter, exit, move, emphasize
3. **Vitesse :** fast, slow, instant, deliberate
4. **Contexte :** modal, tooltip, page-transition
5. **Affordance :** press, lift, emerge, dismiss, settle

L'axe affordance est le plus riche sémantiquement et le plus aligné avec la façon dont les designers pensent les interactions. Il peut coexister avec d'autres axes selon le niveau d'abstraction.

---

## Ruptures conceptuelles

### 1. La référence universelle n'est pas duration + cubic-bezier

Duration + cubic-bezier est la vision CSS du problème. Dans une posture platform-agnostique, la référence universelle est :

- **Temps :** durée, délai, rythme — universel entre les plateformes
- **Comportement :** la forme du changement au fil du temps (courbe, spring, steps, inertia) — universel, résolution spécifique à la plateforme
- **Changement :** ce qui varie (position, opacité, couleur, forme, chemin) — universel
- **Séquence :** relations temporelles entre plusieurs changements — universel
- **Contexte de lecture :** déclencheur, répétition, direction, boucle — universel

CSS est une cible de résolution parmi d'autres. After Effects, SwiftUI, Android Compose, GSAP, Rive — tous répondent aux mêmes abstractions avec des syntaxes différentes.

### 2. Spring sur le web est un problème de transformation, pas un manque

CSS avec `@keyframes` peut exprimer n'importe quelle animation en la décomposant en étapes. C'est ce que fait `linear()` : il encode un spring calculé algorithmiquement comme une série de points. Si un script le génère (transform Style Dictionary, pipeline de build), la machine gère toute la complexité.

Le token source est paramétrique (spring config : stiffness, damping, mass). Le token résolu est le rendu plateforme : `linear(...)` pour CSS, `spring(duration:bounce:)` pour SwiftUI, `SpringSpec(stiffness, damping)` pour Compose. C'est un problème de **transformation**, pas une limitation. Les design tokens avec des pipelines de build existent précisément pour résoudre ce type de problème.

### 3. Fonctionnel vs. expressif — une architecture organisationnelle, pas une prescription

« Fonctionnel vs. expressif » n'est pas une taxonomie universelle. C'est un exemple de la façon dont une organisation pourrait segmenter l'intention motion. IBM Carbon a fait ce choix. Polaris a fait le choix opposé (l'expressivité est interdite). D'autres organisations pourraient diviser différemment : UI vs. brand/marketing, productive vs. celebratory, core vs. signature, standard vs. campaign.

La contribution n'est pas « utilisez fonctionnel/expressif » mais plutôt : un système de motion tokens devrait prendre en charge la segmentation d'intention organisationnelle au niveau sémantique. Les primitives (échelles de durée, bibliothèques de courbes, spring configs) restent partagées. Ce qui diffère entre organisations, c'est la couche sémantique — les intentions qui sont nommées, les contraintes qui s'appliquent à chacune, et la façon dont ces intentions se mappent sur des valeurs primitives.

### 4. Spring spatial vs. spring effets

Les propriétés animées ont des domaines de valeur différents :
- **Propriétés spatiales** (position, taille) : peuvent légèrement dépasser leur cible sans causer de problème. Comme un objet physique qui dépasse son point d'arrêt avant de se stabiliser.
- **Propriétés d'effets** (opacité, couleur) : ne peuvent pas dépasser leurs limites — une opacité au-dessus de 100 % produit des artefacts visuels ; des couleurs hors gamme sont invalides. Un spring qui fait dépasser l'opacité à 110 % casse l'interface.

Material Design 3 encode cette distinction directement dans ses spring tokens : les springs spatiaux utilisent un damping ratio de 0,9 (léger dépassement autorisé), les springs d'effets utilisent 1,0 (amortissement critique, aucun dépassement).

### 5. Directionnalité de l'abstraction — décomposition unidirectionnelle

La hiérarchie de tokens semble symétrique mais n'est pas bidirectionnellement perméable.

**Descendant (abstrait vers concret) :** toujours possible quand l'abstraction est paramétrée. Le preset `.smooth` d'Apple se décompose en `{response: 0.5, dampingFraction: 1.0}`, qui se convertit en `{stiffness: 157, damping: 25, mass: 1}` via la formule physique. C'est une décomposition sans perte. Les resolvers effectuent cette transformation au build time.

**Ascendant (concret vers abstrait) :** pas automatiquement possible. On ne peut pas dériver « gentle » de `stiffness: 300, damping: 20` — l'étiquette sémantique encode un *choix parmi toutes les options physiquement valides*, et ce choix est une décision de marque. De nombreuses spring configs sont physiquement valides pour un comportement « gentle ». Le système de tokens ne peut pas en choisir une sans apport éditorial.

**Implication pour l'architecture :** la définition circule toujours de haut en bas (la marque définit l'intention, le pipeline de build résout en paramètres). La validation peut remonter (vérifier que les paramètres implémentés correspondent à l'intention déclarée). La génération d'intention à partir des paramètres n'est pas possible — cette direction nécessite un jugement humain.

---

## Échelle de maturité des motion tokens

Toutes les organisations n'ont pas besoin d'implémenter le modèle complet. Le système de tokens est additif — chaque niveau fonctionne indépendamment et ajoute de la sophistication sans casser ce qui est en dessous.

| Niveau | Ce qui est tokenisé | Qui l'utilise | Technologie nécessaire |
|---|---|---|---|
| 1 — Duration + easing | Échelle de durée, cubic-beziers nommés | Toute équipe commençant avec le mouvement | DTCG `duration` + `cubicBezier` — natif CSS |
| 2 — Sémantique nommée | Alias sémantiques (motion.fast, motion.enter) | Équipes souhaitant un vocabulaire motion cohérent | Tokens de référence DTCG |
| 3 — Spring configs | Primitives basées sur la physique et leurs alias sémantiques | Marques avec une identité basée sur la physique | Type composite personnalisé, resolver nécessaire pour le web |
| 4 — Transitions composites | Duration + easing + contexte spatial combinés | Design systems avec des directives motion formelles | Type de token composite personnalisé |
| 5 — Orchestration / stagger | Relation entre éléments, règles de séquence | Systèmes animant entrées/sorties de listes/grilles | Tokens de niveau application, resolver nécessaire |
| 6 — Animation comme objet | Intention animée platform-agnostique, résolution multi-cibles | Organisations couvrant web + native + marketing | Pipeline de build avec resolvers spécifiques à la plateforme |

Les organisations qui entrent au niveau 1 peuvent passer au niveau 2 sans modifier les tokens existants. La plupart des design systems en production fonctionnent aujourd'hui aux niveaux 1–2. Les niveaux 3–4 sont présents dans les systèmes les plus avancés (Apple HIG, Material Design 3). Les niveaux 5–6 n'ont aucune implémentation en production documentée.

---

## Défis du modèle

### 1. Spring introduit un nouveau type de primitive

En couleur, toutes les primitives sont des scalaires autonomes (`red-500: #EF4444`). En mouvement, spring introduit une primitive qui n'est pas scalaire : une `spring.config.*` est une recette complète (stiffness + damping + mass) dont les ingrédients individuels ne sont pas tokenisables séparément. Cela élargit la définition de « primitive » au-delà du cas scalaire — ce ne sont pas seulement des « valeurs brutes » mais des « blocs de construction bruts », dont certains sont des scalaires et d'autres des recettes.

### 2. La variance de marque s'infiltre dans la couche sémantique

Modèle standard : la marque fait varier les primitives, la couche sémantique reste stable. En mouvement, le type d'animation est une décision de personnalité de marque — une marque luxe utilise des tweens lents et précis ; une marque tech utilise des springs précis ; une marque ludique utilise des springs rebondissants. Ce choix n'est pas une primitive (il ne se mappe pas sur une valeur unique) mais ce n'est pas non plus une intention pure (il encode le caractère de la marque). La variance de marque en mouvement opère simultanément à deux niveaux : primitives (valeurs) et sémantique (nature de l'animation).

### 3. `prefers-reduced-motion` n'est pas un mode comme le dark mode

Le dark mode échange des valeurs contre d'autres valeurs — le token sémantique reste, sa résolution change. `prefers-reduced-motion` peut supprimer des catégories entières : pas de spring (tween à la place), pas de stagger (synchrone), pas d'orchestration (instantanée). Ce n'est pas une substitution de valeur — c'est une réduction structurelle du système. Une proposition : plutôt que de surcharger les valeurs, reduced-motion active un sous-ensemble de tokens — uniquement ceux qui sont motion-safe (courtes durées, opacité uniquement, pas de transforms). Cela reste une question ouverte.

### 4. Stagger et orchestration sont des tokens de relation

Ils ne décrivent pas une propriété d'un objet mais une relation entre objets. Ils nécessitent un contexte (nombre d'éléments, disposition) pour se résoudre. Ils appartiennent nativement au niveau application/composant, pas aux niveaux primitive ou sémantique.

### 5. Les meta tokens sont une nouvelle catégorie

`motion.timeline-type` (time vs. progress), `motion.intent-mode` (expressive vs. productive), `motion.engine` (tween vs. spring) ne sont pas des valeurs mais des déclarations de contexte qui conditionnent la sémantique de tous les autres tokens. Rien d'équivalent n'existe dans les tokens de couleur ou de typographie. Ils pourraient vivre au niveau sémantique mais se comportent différemment — ce ne sont pas des alias, ce sont des sélecteurs.
