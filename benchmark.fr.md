# Benchmark des systèmes motion

Neuf design systems en production ont été analysés : Material Design 3, Shopify Polaris, IBM Carbon, Microsoft Fluent 2, Apple HIG, Adobe Spectrum, GitHub Primer, eBay Skin et Uber Base. La recherche s'est concentrée sur ce que chaque système tokenise, comment ces tokens sont nommés, jusqu'où chaque système s'étend sur l'axe de profondeur de composition, et quelles positions implicites chaque système prend sur des questions non résolues du design de motion tokens. Deux systèmes supplémentaires (Wise, Spotify Encore) ont un travail sur les motion tokens connu mais n'ont pas pu être entièrement benchmarkés — voir la dernière section.

---

## Observations transversales

### 1. Duration + cubic-beziers nommés sémantiquement est la référence universelle

Les neuf systèmes, sans exception, tokenisent une échelle de durée et un ensemble de courbes d'easing nommées. Les valeurs de durée diffèrent ; les conventions de nommage diffèrent ; mais la structure est identique. C'est la couche stabilisée et non controversée du design de motion tokens.

Ce qui est moins stabilisé, c'est la logique de nommage. eBay Skin ancre sa durée minimale sur le matériel : `instant = 17ms` correspond à une image vidéo à 60fps. Adobe Spectrum découple entièrement le nom du token de sa valeur (`–100` ne signifie pas 100ms). Uber Base utilise une échelle de poids où `timing100 = 250ms`. GitHub Primer expose deux couches — des tokens nommés en millisecondes au niveau primitif (`duration.100 = 100ms`) et des tokens nommés par intention au niveau sémantique (`micro`, `short`, `medium`, `long`). Le couplage nom-valeur est lui-même une décision de design.

### 2. Les spring tokens existent sur les plateformes natives ; le web reste tween uniquement

Apple HIG est entièrement spring-first sur iOS/macOS. Material Design 3 a six spring configs sur Android (distinguées par usage spatial vs. effets). Sur le web, aucun système de ce benchmark ne publie de spring tokens — parce que CSS n'a pas de primitive spring native. La fonction `linear()` est le chemin d'approximation viable, mais aucun système n'a livré un pipeline spring basé sur un resolver pour le web dans le cadre d'un système de tokens public.

Ce n'est pas un manque d'ambition. C'est un problème de résolution : le token source (spring config) doit être transformé en rendu CSS natif au build time. Le resolver de ce dépôt (`tokens/spring-resolver.js`) démontre la transformation pour les trois spring configs de référence.

### 3. La segmentation d'intention est présente dans la plupart des systèmes mais encodée différemment

Une distinction entre mouvement fonctionnel/utilitaire et mouvement expressif/décoratif apparaît dans cinq ou six des neuf systèmes — mais le mécanisme pour encoder cette distinction varie considérablement :

- **IBM Carbon** l'encode structurellement : chaque appel d'animation doit passer `motion("standard", "productive")` ou `motion("standard", "expressive")`. L'intention est un paramètre, pas une directive.
- **Material Design 3** l'encode comme deux pistes de courbes : `standard` (utilitaire) et `emphasized` (la courbe expressive signature de M3, qui ne peut même pas être exprimée comme un seul cubic-bezier — elle a un point d'inflexion).
- **Apple HIG** l'encode de façon conditionnelle : le dépassement (bounce) n'est approprié que lorsque le geste déclencheur a de la vitesse (swipe, drag). Un tap n'a pas de dynamique — utiliser un spring rebondissant sur un tap est physiquement injustifié.
- **eBay Skin** l'encode comme une hiérarchie à trois niveaux de volume : basic, utilitarian, immersive. La courbe `bounce` existe mais est limitée à la piste expressive.
- **Microsoft Fluent 2** l'énonce comme un principe de design sans mécanisme structurel.
- **Shopify Polaris** interdit entièrement le mouvement expressif. Primer n'a pas non plus de catégorie expressive ou décorative — tout mouvement est fonctionnel.

L'observation : la segmentation d'intention n'est pas une norme avec une implémentation correcte connue. Chaque système encode la distinction d'une façon adaptée à son contexte et ses contraintes organisationnels.

### 4. Les tokens de transition composite comme surface d'édition principale n'apparaissent que dans un seul système

GitHub Primer est le seul système de ce benchmark qui livre des tokens `transition.*` composites (pré-combinant durée + easing) comme API d'authoring attendue. Le rendu CSS est `--motion-transition-hover: var(--motion-duration-micro) var(--motion-easing-hover)`. Les auteurs de composants choisissent un token de transition, pas une paire durée + easing. Les scalaires sous-jacents existent mais sont positionnés comme détail d'implémentation, pas comme API consommateur.

C'est le composite de profondeur 3 comme citoyen de première classe. Les autres systèmes laissent la composition aux auteurs de composants — chaque équipe assemble durée + easing au point d'utilisation.

### 5. Aucun système n'a documenté le stagger ou l'orchestration comme tokens

IBM Carbon reconnaît le stagger (intervalle 20ms, plafond 500ms) dans ses guidelines motion. Microsoft Fluent 2 décrit le stagger comme un principe de design. Mais aucun système de ce benchmark ne livre le stagger comme token — une valeur nommée et référençable dans un fichier de tokens. Le comportement est spécifié dans la documentation ; l'implémentation est laissée aux équipes individuelles. C'est le manque de profondeur 4.

### 6. La couverture DTCG est incomplète pour chaque système

Aucun système ne peut exprimer son modèle motion complet dans les types de tokens DTCG actuels (`duration`, `cubicBezier`, `transition`). Apple est le cas le plus extrême — son système entier est basé sur les springs, et aucun spring token Apple ne rentre dans un type `cubicBezier` ou `transition`. L'easing emphasized de Material Design 3 ne peut pas être stocké comme un seul cubic-bezier. Le système à paramètre d'intention d'IBM Carbon n'a pas de représentation DTCG. Les tokens keyframe de Polaris n'ont pas de type DTCG. Chaque système a trouvé son propre contournement (types personnalisés, chaînes CSS brutes, spécifications en documentation seule).

---

## Résumé par système

| Système | Profondeur maximale | Axe de nommage | Gestion des springs | Décision notable |
|---|---|---|---|---|
| Material Design 3 | Profondeur 2 (Android uniquement) | Échelle sémantique + sous-index (`short1`, `long3`) | 6 spring configs sur Android ; tween sur le web | Distinction spring spatial vs. effets — amortissement différent pour position vs. opacité |
| Shopify Polaris | Profondeur 3 (objets keyframe) | Valeur brute en ms (`duration-200`) | Aucun | Tokenise des animations `@keyframes` complètes ; notes d'usage co-localisées avec la définition du token |
| IBM Carbon | Profondeur 1 (scalaires uniquement) | Bande de vitesse + ordinal (`fast01`) | Aucun | Intention déclarée structurellement au point d'utilisation via la fonction `motion(type, mode)` |
| Microsoft Fluent 2 | Profondeur 1 | Superlatif de vitesse + outlier de caractère (`durationGentle`) | Aucun | `durationGentle` casse la logique de vitesse — « gentle » est du caractère, pas de la vitesse |
| Apple HIG | Profondeur 2 | Caractère perceptuel (`.smooth`, `.snappy`, `.bouncy`) | Spring-first, `response` et non `duration` | Bounce uniquement quand le geste a de la dynamique — usage conditionnel encodé dans les directives |
| Adobe Spectrum | Profondeur 1 | Index abstrait découplé de la valeur (`–100` ≠ `100ms`) | Aucun | Sémantique directionnelle : horizontal = progrès, diagonal = disruption, rotatif = attente |
| GitHub Primer | Profondeur 3 (transitions composites) | Intention + trajectoire (`enter`, `exit`, `move`, `hover`) | Aucun | Métadonnées d'usage pour LLM intégrées dans les définitions de tokens ; transitions composites comme API principale |
| eBay Skin | Profondeur 1 | Niveau + ordinal (`short.1`) + direction dans le nom (`quick.enter`) | Aucun | `instant = 17ms` = une image à 60fps ; `bounce` via dépassement cubic-bezier (Y2 = 1,5) |
| Uber Base | Profondeur 1 | Rang de poids, pas valeur en ms (`timing100 = 250ms`) | Aucun | Révision documentée après tests en production : durée du snackbar révisée car trop lente |

---

## Ce qui n'est pas documenté

**Wise** a une architecture de motion tokens visible dans sa documentation design. Des tokens de durée par incréments de 50ms, des patterns de transition nommés (Upwards, Sideways, Modal), une contrainte stricte à 60fps et une philosophie d'easing « light-weight material » sont documentés. Les valeurs des tokens elles-mêmes se trouvent dans des fichiers de bibliothèques Figma et ne sont dans aucun JSON ou dépôt public.

**Spotify Encore** liste le mouvement comme catégorie Foundation aux côtés de la couleur et de la typographie. Une philosophie de mouvement inspirée par la musique est décrite publiquement (« pulsations, fioritures, lueur »), et la livraison Lottie-first pour Wrapped est utilisée depuis au moins 2023. Aucune valeur de token publique, aucun nom de token, aucun export de fichier n'a été trouvé. L'architecture et l'outillage sont internes.

Les deux systèmes sont inclus dans le périmètre du benchmark parce que leurs approches sont connues pour être distinctives — la philosophie d'easing physique de Wise et le modèle de mouvement piloté par la musique de Spotify sont chacun différents de tout ce qui figure dans les neuf systèmes entièrement benchmarkés. L'absence de données publiques est constatée avec exactitude, non comme une critique.
