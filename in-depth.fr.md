---
word-count: ~4500
lang: fr
---

# Comment les systèmes de motion tokens échouent — et ce qu'ils requièrent à la place

Un essai de recherche sur les différences structurelles entre la conception de tokens de couleur et de mouvement, ce que neuf systèmes en production révèlent sur l'état de l'art, et ce qui reste non résolu.

---

## Partie 1 — Là où le modèle couleur cesse de fonctionner

Au second semestre 2024, l'équipe design system d'un éditeur SaaS de taille intermédiaire a décidé d'étendre son infrastructure de tokens au mouvement. Elle disposait déjà de tokens de couleur, de typographie, d'espacement. L'extension semblait évidente : la durée fonctionnerait comme une échelle de couleur, l'easing comme une échelle de graisse typographique, et les alias sémantiques comme `motion.duration.fast` pointeraient vers des primitives comme `duration.100`, exactement comme `color.action.danger` pointait vers `red-500`. L'équipe a tout construit en une semaine et livré en release mineure.

Trois mois plus tard, la développeuse senior de l'équipe examinait une pull request pour un nouveau composant panneau nécessitant une entrée basée sur un spring. Elle a ouvert le fichier de tokens. `duration.300` était un nombre unique. `easing.enter` était quatre nombres représentant une courbe. Une spring config était trois nombres représentant un système physique dont aucun des trois ne signifiait quoi que ce soit indépendamment. La structure existante n'avait aucune place pour ça.

Cette friction n'est pas accidentelle. Elle est structurelle.

Si le modèle mental de la couleur se transfère aussi naturellement dans son propre domaine, c'est parce que les tokens de couleur sont, sans exception, des scalaires. Un token primitif de couleur (`red-500: #EF4444`) est un scalaire. Son alias sémantique (`color.action.danger: {red-500}`) est un scalaire à un degré de distance. Son token de composant (`button.danger.background: {color.action.danger}`) est un scalaire à deux degrés. Ce qui change d'un niveau à l'autre, c'est le nom et le sens qu'on lui attache. La chose elle-même — une valeur de couleur unique — ne change jamais de type.

Le mouvement fonctionne différemment. À travers la hiérarchie d'abstraction, la structure de la valeur change. Un token de durée est un scalaire : un nombre, une unité. Une spring config est une recette : trois paramètres physiques qui ne signifient rien pris séparément. Un token de transition est un composite : une durée et un easing issus de domaines totalement différents, combinés en quelque chose qu'aucun ne peut exprimer seul. Un token de stagger est une orchestration : non pas une propriété d'un élément unique, mais une règle régissant les relations temporelles entre une collection d'éléments.

Un système de motion tokens couvre quatre types de valeurs distincts dans sa hiérarchie. Un système de couleur n'en couvre qu'un. Ce n'est pas une défaillance des outils ni de la spec. C'est la preuve que le mouvement occupe un espace de conception plus vaste que la couleur — et qu'un modèle mental construit pour la couleur n'en décrit qu'une partie.

L'écart se manifeste exactement au moment que l'équipe ci-dessus a rencontré : quand le système doit gérer du mouvement basé sur la physique. C'est précisément là que le modèle couleur à un seul axe, qui avait parfaitement fonctionné pour les durées et les easings cubic-bezier, se heurte au second axe qu'il n'avait jamais eu à prendre en compte.

---

## Partie 2 — Deux axes, pas un

La taxonomie de ce dépôt émerge d'une question précise que le benchmark a imposée. En regardant le système de tokens de GitHub Primer aux côtés de celui d'eBay Skin, une différence est apparue que le modèle standard « primitive/sémantique/composant » ne pouvait pas expliquer.

`motion.duration.slow` et `motion.transition.enter` se situent tous deux au niveau sémantique. Tous deux portent une intention. Tous deux référencent des valeurs primitives. Mais ils se comportent différemment. L'un se résout en une valeur unique ; l'autre se résout en un objet à deux champs issus de domaines différents. Les appeler tous les deux « tokens sémantiques » est correct, mais cela traite des choses structurellement différentes comme si elles étaient du même type.

La question : quelle est la différence réelle ? Pas leur position dans la hiérarchie, mais ce qu'ils sont.

La réponse, c'est ce que la taxonomie appelle la profondeur de composition — la complexité structurelle de la valeur du token. Et il s'avère que cet axe est entièrement indépendant de l'axe de niveau d'abstraction. La profondeur d'un token ne détermine pas son niveau ; son niveau ne détermine pas sa profondeur.

### Profondeur 1 — Scalaire

Le point de départ. Une valeur, un type, aucune structure interne. `duration.200 = 200ms`. `easing.standard = cubic-bezier(0.4, 0, 0.2, 1)`. Tous les tokens de couleur jamais écrits se trouvent à cette profondeur.

Un token scalaire est l'unité la plus simple possible : il se résout en une seule valeur de propriété CSS. Son alias sémantique (`motion.duration.fast → {duration.100}`) ajoute du sens mais ne change rien à cela. Le consommateur reçoit toujours `100ms`. L'opération d'aliasing est un renommage, pas une transformation structurelle.

### Profondeur 2 — Recette

Une recette regroupe plusieurs valeurs du même domaine physique qui doivent coexister pour avoir un sens.

`spring.config.gentle = { stiffness: 200, damping: 20, mass: 1 }` est une recette. `stiffness: 200` seul n'est pas un token ; il n'a aucune signification utilisable sans `damping` et `mass`. Les trois paramètres appartiennent à un seul système physique. On ne peut pas tokeniser l'un sans les autres — ce ne sont pas des valeurs indépendamment adressables.

C'est analogue à une couleur définie en OKLCH : `L`, `C` et `H` décrivent ensemble une couleur. Personne ne crée un token `lightness`, un token `chroma` et un token `hue` en les appelant des primitives de couleur. Les valeurs de canaux sont des paramètres d'un espace colorimétrique, pas des tokens autonomes. Les scalaires de spring sont des paramètres d'un moteur physique, pas des tokens autonomes. L'unité minimale tokenisable est la recette complète.

La recette introduit un nouveau type de primitive que la couleur n'a jamais eu besoin : la primitive comportementale. La personnalité physique de la marque réside ici. Un spring précis et fortement amorti contre un spring souple et rebondissant — ce sont des décisions de marque, encodées au niveau primitif, exprimées comme des recettes plutôt que des scalaires.

### Profondeur 3 — Composite

Un composite combine des valeurs de domaines différents dans un token qu'aucun domaine ne peut exprimer seul.

`motion.transition.enter = { duration: {duration.400}, easing: {easing.enter}, delay: 0 }` est un composite. Il combine une valeur du domaine temporel (durée) avec une valeur du domaine comportemental (courbe d'easing). Aucun token ne référence l'autre. Ensemble, ils décrivent une transition tween complète — quelque chose qui n'est ni une durée ni un easing.

GitHub Primer est le seul système du benchmark qui fait du composite de profondeur 3 la surface d'édition principale. Primer définit quatre tokens `transition.*` (`hover`, `stateChange`, `enter`, `exit`) qui pré-combinent une durée et un easing. Le rendu CSS de `motion.transition.hover` est `var(--motion-duration-micro) var(--motion-easing-hover)`. Dans Primer, les auteurs de composants ne composent pas durée et easing au point d'utilisation — ils sélectionnent un token de transition par intention et reçoivent la composition prête à l'emploi.

Tous les autres systèmes du benchmark laissent cette composition aux auteurs de composants. Que ce soit une question de maturité ou une décision délibérée sur les limites de responsabilité du système n'est pas clair d'après les données publiques. La position de Primer est distinctive, et elle n'est pas forcément le résultat d'un niveau plus avancé — c'est une décision architecturale différente sur ce que le système de tokens doit prendre en charge.

### Profondeur 4 — Orchestration

Les tokens d'orchestration décrivent des relations temporelles entre plusieurs éléments, pas des propriétés d'un seul élément.

`motion.stagger.list = { interval: 20ms, from: start, cap: 500ms }` n'est ni une durée, ni une courbe, ni une transition. C'est une règle : retarder l'entrée de chaque élément de 20ms par rapport au précédent, en commençant par le premier, avec un décalage total plafonné à 500ms. Ce token ne peut pas être résolu sans savoir combien d'éléments se trouvent dans la liste. Il requiert un contexte.

C'est un type de valeur d'une nature catégoriquement différente. Les profondeurs 1 à 3 décrivent toutes une propriété d'une chose. La profondeur 4 décrit comment des choses se rapportent les unes aux autres dans le temps. Elle ne peut pas se mapper sur une propriété CSS unique parce que la propriété CSS ne connaît pas les relations entre éléments. Un resolver qui connaît le nombre d'éléments est indispensable.

IBM Carbon reconnaît ce comportement : ses guidelines de mouvement spécifient des intervalles de stagger de 20ms avec un plafond de 500ms. Microsoft Fluent 2 décrit le stagger comme un principe de design. Aucun système du benchmark ne livre cela sous forme de token. Le comportement existe dans la documentation et les implémentations ; le vocabulaire partagé pour l'encoder comme une valeur référençable et platform-agnostique n'existe pas.

### Profondeur 5 — Objet d'intention (frontier)

La profondeur 5 n'existe encore dans aucun système en production. C'est le point terminal logique de l'axe : une description platform-agnostique de ce que fait une animation, stockée comme token source et résolue par plateforme par un pipeline de build.

La distinction avec la profondeur 4 : les profondeurs 1 à 4 se mappent toutes sur des concepts CSS ou WAAPI connus, même complexes. Un objet d'intention de profondeur 5 décrit une intention comportementale sans équivalent CSS direct. Le code spécifique à la plateforme est généré par un resolver, pas lu directement depuis le token.

```json
// Exemple d'objet d'intention (non implémenté dans aucun système à ce jour)
{
  "motion.emerge.panel": {
    "behavior": "spring",
    "direction": "from-below",
    "distance": "medium",
    "spring": { "ref": "motion.spring.gentle" },
    "delay": { "ref": "motion.delay.none" }
  }
}
```

Le resolver transforme cette description en : `@keyframes + linear()` pour CSS, `.spring(duration:bounce:)` + `.offset(y:)` pour SwiftUI, `spring(stiffness, damping) + offset` pour Compose, JSON de keyframes calculées pour Lottie.

LottieFiles est l'analogue le plus proche, mais Lottie exporte des keyframes calculées — un export de données d'animation résolues. La profondeur 5 serait l'abstraction un niveau au-dessus : la source à partir de laquelle ces keyframes sont générées. Aucune équipe n'a implémenté cela publiquement. C'est une direction potentielle pour les systèmes qui nécessitent une cohérence de mouvement cross-platform à un niveau d'abstraction que les outils actuels ne permettent pas.

### Ce que les deux axes révèlent ensemble

Ces deux axes sont indépendants. La position d'un token sur l'un ne prédit pas sa position sur l'autre. En couleur, la matrice entière se réduit à une seule colonne : profondeur 1, tous niveaux. Chaque token de couleur est un scalaire, quel que soit son niveau d'abstraction. En mouvement, la matrice est peuplée sur les deux dimensions. Ce n'est pas une question de complexité pour elle-même — c'est la forme réelle de l'espace de conception qu'occupe le mouvement.

Chaque frontière entre profondeurs est une frontière de type, pas une frontière d'échelle. Passer de la profondeur 1 à la profondeur 2, ce n'est pas ajouter davantage d'informations au même type de chose. C'est changer le type de chose qu'est la valeur.

---

## Partie 3 — Ce que neuf design systems ont révélé

Un benchmark de neuf design systems en production — Material Design 3, Shopify Polaris, IBM Carbon, Microsoft Fluent 2, Apple HIG, Adobe Spectrum, GitHub Primer, eBay Skin, Uber Base — révèle des patterns que la recherche documentaire et la lecture de specs seules n'auraient pas pu faire émerger. Voici six observations avec leurs preuves, chacune suffisamment précise pour être contestée par un contre-exemple.

### La couche stabilisée est plus mince qu'elle n'y paraît

Échelle de durée plus cubic-beziers nommés sémantiquement : voilà la référence universelle. Les neuf systèmes, sans exception, l'ont. La structure est partagée — mais la philosophie à l'intérieur de cette structure ne l'est pas.

Trois systèmes illustrent à quel point des équipes peuvent répondre différemment à la même question sous-jacente : que devrait communiquer un nom de token sur sa valeur ?

eBay Skin ancre sa durée minimale sur le matériel : `instant = 17ms` correspond à une image à 60fps (16,67ms, arrondi). Le nom ne communique pas la valeur ; il communique la catégorie, et la valeur est dérivée d'une contrainte physique. Uber Base utilise une échelle de poids non littérale : `timing100 = 250ms`. Le suffixe est un rang relatif, pas une valeur en millisecondes — la même logique que pour les graisses typographiques, où `400` n'est pas 400 grammes mais une position dans une échelle. Adobe Spectrum découple entièrement nom et valeur : `–100` ne correspond pas à `100ms` ; l'index est abstrait.

Ce sont trois positions différentes sur la question de la quantité de sens que le nom du token devrait porter sur la valeur. Skin dit : le nom communique la catégorie et la valeur est dérivée de la physique. Uber dit : le nom communique le rang et la valeur est un détail d'implémentation. Spectrum dit : le nom est un identifiant opaque et la valeur est ce qu'elle est.

Aucune de ces positions n'est plus correcte que les autres. Elles reflètent des théories différentes sur qui utilise le token, ce qu'il sait déjà, et ce que le nom doit lui enseigner. La structure universelle d'échelle de durée + courbes nommées dissimule de vraies différences philosophiques.

### Les spring tokens existent sur les plateformes natives ; le web n'a pas de solution

Tout le système de mouvement d'Apple est spring-first. Il n'existe pas de bibliothèque de courbes cubic-bezier dans Apple HIG ; il y a trois presets spring nommés (`.smooth`, `.snappy`, `.bouncy`) et une API paramétrique basée sur `response` (durée perçue) et `dampingFraction` (comportement d'oscillation). Material Design 3 livre six spring configs pour Android, segmentées par taille de composant et type de propriété animée. Les deux systèmes traitent les springs comme la primitive de mouvement principale sur les plateformes natives.

Sur le web, aucun système du benchmark ne publie de spring tokens. Non pas parce que les springs sont moins désirables sur le web — les springs d'Apple et ceux d'Android MD3 sont considérés comme le modèle de mouvement adapté à leurs plateformes précisément parce qu'ils donnent la bonne sensation. Mais parce que CSS n'a pas de primitive spring native, et qu'aucune équipe n'a livré un pipeline basé sur un resolver pour le web dans le cadre d'un système de tokens public.

La clarification importante : cette absence est une décision d'outillage, pas une décision philosophique. Le blocage n'est pas l'incapacité de CSS à exprimer des springs ; c'est l'absence d'une étape de transformation au build time dans le pipeline de n'importe quel système public. La fonction CSS `linear()`, disponible dans tous les navigateurs modernes, peut approximer n'importe quelle animation spring avec une précision suffisante. Un spring config token transformé par un resolver au build time produit un rendu CSS perceptuellement identique à un spring natif. Le problème spring-sur-web est un problème de resolver, pas un problème CSS. La partie 4 de cet essai traite ce point spécifiquement.

### La segmentation d'intention est universelle mais jamais encodée de la même façon

Chaque organisation qui livre un système de motion tokens arrive tôt ou tard à la même question : quels types de mouvements sommes-nous autorisés à utiliser, et où ? La réponse — une version d'une piste productive/fonctionnelle/utilitaire aux côtés d'une piste expressive/décorative/immersive — apparaît dans la plupart des systèmes. Le mécanisme pour encoder cette réponse diffère dans chaque cas.

IBM Carbon force la déclaration d'intention comme paramètre structurel. L'appel de fonction `motion("standard", "productive")` n'est pas une directive ; c'est l'API. Chaque animation dans un produit Carbon doit déclarer son intention au point d'utilisation. Le système de tokens ne permet pas une animation sans déclaration.

Shopify Polaris interdit entièrement le mouvement expressif. La position philosophique — « le mouvement est un outil, pas un ornement » — est encodée comme politique. Il n'y a pas de catégorie de tokens expressifs parce qu'il n'y a pas de mouvement expressif dans le produit.

Apple HIG encode la distinction de manière conditionnelle : le dépassement (bounce) n'est approprié que lorsque le geste déclencheur porte de la vitesse. Un swipe a de la dynamique ; un tap n'en a pas. Utiliser un spring rebondissant sur un tap est physiquement injustifié — le geste n'a pas produit la force qui expliquerait le rebond. La distinction entre mouvement utilitaire et expressif est ancrée dans la physique, pas dans des catégories.

eBay Skin l'encode comme une hiérarchie à trois niveaux de volume : basic, utilitarian, immersive. La courbe `bounce` existe dans le système mais appartient à la piste immersive. La structure des niveaux rend l'escalade explicite.

GitHub Primer et Uber Base n'ont aucune segmentation d'intention. L'axe de nommage de Primer est la trajectoire (enter/exit/move/hover), pas le volume d'intention. Les trois courbes génériques d'Uber ne portent aucune distinction de catégorie.

L'observation n'est pas que certaines de ces approches sont meilleures. C'est que le vocabulaire de segmentation d'intention ne s'est pas généralisé entre organisations. Chaque équipe doit répondre à la question ; aucune réponse ne s'est transférée. Le vocabulaire productive/expressive de Carbon est le plus souvent cité — mais l'adopter sans le contexte organisationnel de Carbon produit des noms de tokens qui portent une intention qu'ils ne peuvent pas faire respecter. Le vocabulaire est toujours local.

### Les composites de profondeur 3 n'existent que dans un seul système

GitHub Primer livre des tokens `transition.*` composites comme surface d'édition principale. `motion.transition.enter`, `motion.transition.exit`, `motion.transition.hover`, `motion.transition.stateChange` pré-combinent chacun une durée et un easing. Les tokens individuels de durée et d'easing existent dans le système mais sont positionnés comme détail d'implémentation. Les auteurs de composants ne les assemblent pas ; ils choisissent une transition.

Le rendu CSS : `--motion-transition-hover: var(--motion-duration-micro) var(--motion-easing-hover)`. Une ligne, une décision prise en amont, aucune composition requise au point d'utilisation.

Tous les autres systèmes du benchmark laissent la composition durée-easing aux auteurs de composants. Ce n'est pas un manque dans les autres systèmes — c'est une théorie différente sur les limites de responsabilité du système. Un système qui s'arrête à la profondeur 1 (scalaires) n'est pas un système déficient ; il a décidé que la composition relève des auteurs de composants. Primer a décidé que c'est une responsabilité du système. Les deux positions sont cohérentes ; elles produisent des expériences d'authoring différentes et des implications de maintenance différentes.

### Le stagger existe dans la documentation de plusieurs systèmes ; il n'existe comme token dans aucun

IBM Carbon spécifie le stagger : intervalle de 20ms, plafond total de 500ms. La directive est claire et concrète. Microsoft Fluent 2 décrit le stagger comme un principe de design. Aucun des deux ne livre le stagger comme token référençable.

La raison n'est pas que le stagger est sans importance. C'est que le type de token ne rentre pas dans le modèle existant. Chaque type de token dans la spec DTCG — `duration`, `cubicBezier`, `transition` — décrit une propriété d'un élément unique. Le stagger décrit une relation entre éléments. Il nécessite un resolver qui connaît le nombre d'éléments. Les données minimales d'un token de stagger (`interval`, `from`, `cap`) ne se mappent sur aucune propriété CSS parce que les propriétés CSS ne décrivent pas les relations temporelles inter-éléments.

C'est le manque de profondeur 4 : un besoin architectural réel, soutenu par la documentation organisationnelle, sans aucune implémentation en production. Le comportement est spécifié dans la documentation ; l'infrastructure de tokens pour l'encoder et le partager n'existe dans aucun système public.

### La couverture DTCG est incomplète pour chaque système du benchmark

La spec stable DTCG d'octobre 2025 définit trois types pertinents pour le mouvement : `duration`, `cubicBezier` et `transition`. Chaque système du benchmark a trouvé au moins une chose qu'il ne peut pas exprimer avec ces types.

Le modèle spring d'Apple HIG n'a pas d'équivalent DTCG. Tout le système fonctionne avec un paramétrage (`response`, `dampingFraction`) qui n'a pas de représentation `cubicBezier`. L'easing « emphasized » de Material Design 3 a un point d'inflexion qui ne peut pas être exprimé comme un seul cubic-bezier — sur Android il est stocké comme un path ; sur le web il est reconnu comme une approximation. Le système à paramètre d'intention d'IBM Carbon — où l'easing dépend d'un paramètre d'intention déclaré à l'appel — n'a pas de représentation DTCG. Les tokens keyframe de Shopify Polaris (animations `@keyframes` complètes comme valeurs de token) n'ont pas de type DTCG.

Chaque système a trouvé un contournement : types personnalisés, blocs d'extension, chaînes CSS brutes dans les valeurs de tokens, spécifications en documentation seule. La spec n'est pas incorrecte. Elle est incomplète pour le mouvement d'une façon qu'elle ne l'est pas pour la couleur — parce que le mouvement requiert des types que la couleur n'a jamais eu besoin. L'écart entre ce que la spec couvre et ce dont les systèmes en production ont besoin est plus large pour le mouvement que pour toute autre catégorie de tokens.

---

## Partie 4 — Le problème spring sur le web

Le récit dominant dans les discussions sur les design systems veut que l'animation spring sur le web soit bloquée par CSS. Les équipes diffèrent les spring tokens parce qu'il n'existe pas de primitive spring CSS native. L'implication est que le bon moment pour implémenter des spring tokens pour le web, c'est après que le CSS Working Group ait ajouté les springs dans la spec.

Ce cadrage inverse la contrainte réelle. Le manque n'est pas dans la capacité d'expression de CSS. Il est dans les pipelines de build qu'aucune équipe n'a encore livrés publiquement.

CSS `linear()` — disponible dans tous les navigateurs modernes — peut encoder n'importe quelle animation comme une série de points d'interpolation linéaire calculés. Une animation spring résolue à 60fps en 40-60 keypoints, encodée comme `linear(0, 0.03 2%, 0.12 4%, 0.25 7%, ...)`, est perceptuellement identique à un spring natif dans un navigateur qui supporte `linear()`. L'écrire à la main n'est pas pratique. La générer depuis une étape de build l'est.

Le pipeline de transformation fonctionne ainsi. Un spring config token (`{ stiffness: 200, damping: 20, mass: 1 }`) est la source. Un resolver lit le token au build time, simule la courbe de mouvement du spring en utilisant l'équation différentielle du spring, échantillonne la trajectoire à un taux de frames cible, et produit la chaîne `linear()` équivalente. Le composant qui utilise le token le référence par son nom ; il reçoit du CSS natif à la plateforme.

Le resolver de ce dépôt gère trois paramétrages d'entrée : physique brute (`stiffness`, `damping`, `mass`), notation damping-ratio telle qu'utilisée par Material Design 3 (`stiffness`, `dampingRatio`), et l'abstraction perceptuelle d'Apple (`response`, `dampingFraction`). Le même resolver accepte les trois, ce qui lui permet de servir de pont pour la livraison cross-platform de spring tokens. Une équipe travaillant sur le web et iOS peut stocker l'intention spring dans un seul fichier de tokens et le résoudre de façon appropriée par plateforme — CSS `linear()` pour le web, `.spring(response:dampingFraction:)` pour SwiftUI, `SpringSpec(stiffness, damping)` pour Compose.

Le rôle de ce resolver est le même que celui que joue Style Dictionary pour la couleur : le token stocke l'intention dans un format source, et l'étape de build produit le rendu spécifique à la plateforme. Le spring token répond à une question — quel effet doit produire cette animation ? La chaîne `linear()` répond à une autre question — quel code produit cet effet en CSS ? La transformation est irréversible. De nombreuses spring configs produisent des courbes perceptuellement similaires mais paramétriquement distinctes. Le token est la source de vérité ; le rendu plateforme en est dérivé.

Les équipes qui attendent une primitive CSS spring avant d'implémenter des spring tokens sur le web ont fait un report sans échéance définie. Le chemin d'approximation via `linear()` est disponible dès aujourd'hui. Le spring resolver est la nouvelle étape de build.

---

## Partie 5 — Ce que cela change pour construire un système de motion tokens

Les conséquences pratiques du modèle à deux axes ne portent pas sur l'ajout de plus de tokens ou la création de plus de couches. Elles portent sur la prise de décisions explicites que les équipes avec un modèle à un seul axe laissent souvent implicites.

**Décider de la profondeur de composition visée avant d'ajouter des tokens sémantiques.** Un système qui opère à la profondeur 1 — scalaires uniquement, composition au point d'utilisation — n'est pas un système incomplet. Il a pris une décision délibérée : le système de tokens fournit des matériaux bruts, et les auteurs de composants les assemblent. Un système qui opère à la profondeur 3 a pris une décision différente : le système pré-assemble les combinaisons courantes, et les auteurs de composants consomment des intentions. Les deux sont cohérents. L'erreur est de construire un système de profondeur 1 en supposant qu'il s'étendra éventuellement à la profondeur 3 sans le planifier, parce que les changements structurels requis ne sont pas additifs. Une couche de profondeur 3 ajoutée sur une fondation de profondeur 1 nécessite de redéfinir le rôle de la couche sémantique.

**Les spring configs sont d'un type différent des tokens scalaires. Traitez-les comme tel.** Si votre système de tokens expose `stiffness`, `damping` et `mass` comme tokens séparés, le modèle est structurellement incorrect — pour la même raison qu'exposer R, G et B comme primitives de couleur séparées est structurellement incorrect. Les paramètres spring individuels n'ont aucun sens utilisable isolément. L'unité minimale tokenisable est la spring config complète. Nommez la config par son caractère perçu (`spring.config.gentle`, `spring.config.snappy`, `spring.config.bouncy`), pas par ses valeurs de paramètres. Les paramètres sont des champs de la valeur du token, pas des tokens eux-mêmes.

**La segmentation d'intention organisationnelle est une décision architecturale, pas une convention à adopter.** Le vocabulaire productive/expressive d'IBM Carbon est fréquemment décrit comme une bonne pratique pour les systèmes de motion tokens. C'est une architecture qui reflète le contexte organisationnel de Carbon : un outil de productivité B2B avec une théorie spécifique sur quand le mouvement devrait être invisible et quand il devrait marquer un moment. Adopter ce vocabulaire sans ce contexte produit des tokens dont les noms portent une intention qu'ils ne peuvent pas faire respecter. La séparation productive/expressive est la réponse à une question — « quels types de mouvement voulons-nous distinguer ? » — que chaque organisation doit se poser elle-même. Définissez le vocabulaire qui correspond aux décisions de mouvement que votre organisation veut réellement prendre, plutôt que d'en hériter un qui a été défini pour un produit et une culture différents.

**Le manque DTCG est réel mais ne bloque pas.** Aucun système ne peut pleinement exprimer son modèle de mouvement dans les types DTCG actuels. Les springs d'Apple, la courbe emphasized de MD3, le système à paramètre d'intention de Carbon, les tokens keyframe de Polaris — tous nécessitent des contournements. Construire un type personnalisé pour `spring` et `stagger` avec une documentation claire du schéma est la bonne approche aujourd'hui. Le DTCG ajoutera des types de mouvement ; la roadmap inclut un module Motion. Un système qui attend un type DTCG `spring` avant d'implémenter des spring tokens a reporté indéfiniment sur un calendrier qu'aucune équipe ne contrôle. Des types personnalisés dans des fichiers de tokens, avec des schémas documentés et des resolvers produisant un rendu natif par plateforme, sont une solution complète dès maintenant.

**Les stagger tokens nécessitent un resolver, pas une convention.** Si votre système spécifie le comportement de stagger dans la documentation mais pas dans les tokens, chaque composant qui effectue du stagger implémente le même comportement indépendamment sans référence partagée. La structure de token pour le stagger n'est pas compliquée — `{ interval: 20ms, from: start, cap: 500ms }` est une description complète pour une entrée de liste. La pièce manquante est un resolver qui prend le token et le nombre d'éléments au runtime et calcule les délais par élément.

---

## Pour conclure — ce qui reste inconnu

Cinq questions dans cette recherche n'ont pas été résolues et ne le seront pas par l'analyse de la documentation publique seule.

La première est de savoir si `prefers-reduced-motion` est un mode ou une condition structurelle. Le dark mode échange des valeurs de tokens ; le reduced motion pourrait avoir besoin de supprimer des catégories entières de tokens — les springs deviennent des tweens, les staggers deviennent synchrones, les orchestrations deviennent instantanées. Que cela nécessite une architecture différente des modes à substitution de valeurs, ou si cela peut être géré comme un mode particulièrement agressif, a des implications sur la façon dont le système de tokens est structuré dès le départ.

La deuxième est de savoir si la spring config est la bonne unité minimale tokenisable, ou s'il existe des cas d'usage valides pour faire varier des paramètres spring individuels au niveau du token. La position actuelle est que les paramètres spring individuels ne sont pas des tokens — mais certaines implémentations en production dans des outils comme React Spring surchargent des paramètres individuels par animation. Que ces surcharges représentent un vrai besoin de tokens spring scalaires, ou simplement une commodité dans un contexte de runtime spécifique, n'est pas clair d'après les données publiques.

La troisième est de savoir comment les vocabulaires de segmentation d'intention évoluent dans le temps. Le benchmark fait apparaître cinq ou six approches distinctes. Ce qui n'est pas visible dans la documentation publique, c'est si ces vocabulaires restent stables à mesure que les systèmes mûrissent ou s'ils se révisent. Les données les plus utiles viendraient d'équipes qui ont géré un système de motion tokens pendant deux ans ou plus et ont changé leur vocabulaire d'intention — ce qui a provoqué le changement, et ce qu'elles auraient fait différemment au départ.

La quatrième est de savoir si la profondeur 5 (l'animation comme objet) existe dans un système en production. LottieFiles est l'analogue connu le plus proche, mais Lottie résout au niveau des keyframes, pas au niveau de l'intention. Une équipe travaillant sur l'abstraction d'authoring au-dessus de l'export de keyframes — chez LottieFiles, Rive, Jitter, ou un outil pas encore créé — est la source d'information la plus probable ici.

La cinquième est de savoir ce qu'un module Motion DTCG devrait contenir. La spec actuelle couvre un périmètre étroit de ce dont les systèmes en production ont besoin. Le minimum proposé — un type composite `spring`, un type `stagger`, un mécanisme pour l'intention animée — est un point de départ. Ce que le module devrait explicitement exclure est aussi important que ce qu'il devrait inclure.

Ces questions ne sont pas rhétoriques. Ce sont les points précis où cette recherche atteint la limite de ce que l'analyse documentaire peut atteindre. Les personnes les mieux placées pour les résoudre sont les motion designers qui ont livré des systèmes de tokens en production et les ont vécus assez longtemps pour les réviser ; les contributeurs DTCG qui travaillent activement sur un module Motion ; et les développeurs d'outils chez LottieFiles, Rive, Jitter et plateformes similaires, qui travaillent sur la couche au-dessus de la résolution de keyframes.

Si vous avez des preuves qui modifient ou compliquent l'une de ces positions — des implémentations en production aux profondeurs 4 ou 5, des vocabulaires d'intention qui se sont généralisés entre organisations, des pipelines de spring resolver dans des dépôts publics — la recherche en bénéficie directement. Ce matériel alimente un chapitre de *The Design Tokens Book*. Les questions ouvertes sont celles qui doivent figurer dans le livre comme questions ouvertes, car les présenter comme résolues serait inexact.
