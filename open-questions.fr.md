# Questions ouvertes

Cinq questions que cette recherche n'a pas résolues. Chacune est formulée avec la position de travail actuelle et le type de preuve qui permettrait de la faire évoluer.

---

**Question 1 — `prefers-reduced-motion` est-il un mode ou une condition structurelle ?**

Le dark mode fonctionne comme un mode : il échange des valeurs contre d'autres valeurs. Le token sémantique persiste ; seule sa résolution change. `prefers-reduced-motion` ne fonctionne peut-être pas de la même façon. Il peut supprimer des catégories entières de tokens — spring devient tween, stagger devient synchrone, orchestration devient instantanée. Ce n'est pas une substitution de valeur ; c'est une réduction structurelle du système. La position actuelle est que `prefers-reduced-motion` est une condition, pas un mode, et devrait activer un sous-ensemble prédéfini de tokens motion-safe plutôt que surcharger des valeurs individuelles. Ce qui résoudrait cela : des exemples d'équipes qui ont implémenté la gestion du reduced motion au niveau de l'architecture de tokens, pas seulement comme fallbacks CSS, et si cette gestion a nécessité des changements structurels dans leur jeu de tokens.

---

**Question 2 — La spring config est-elle la bonne unité minimale tokenisable ?**

La position actuelle est que `stiffness`, `damping` et `mass` ne sont pas tokenisables indépendamment. Ce sont des paramètres d'un système physique — analogues aux canaux RGB d'une couleur, qui ne sont pas non plus tokenisables individuellement. `stiffness: 300` n'a aucun sens utilisable isolément ; il faut la config complète pour produire un rendu. L'unité minimale tokenisable est donc la spring config complète à la profondeur 2. Cependant, certaines équipes en pratique exposent des paramètres spring indépendamment, notamment dans des outils comme React Spring où `config.stiffness` peut être surchargée par animation. S'il existe un cas d'usage réel où faire varier un seul paramètre spring — les autres restant constants — est la bonne surface d'édition, cela contesterait la position actuelle. Une confirmation d'équipes utilisant des animations basées sur la physique en production à grande échelle permettrait de trancher.

---

**Question 3 — Comment les équipes segmentent-elles l'intention motion en pratique, et cette segmentation est-elle stable dans le temps ?**

Le benchmark a trouvé cinq ou six approches distinctes pour la distinction fonctionnel/expressif : encodage structurel (Carbon), système à deux pistes de courbes (M3), usage conditionnel (Apple), taxonomie par volume (eBay), interdiction (Polaris), et absence (Primer, Uber). La position actuelle est que la segmentation d'intention est organisationnelle — aucun vocabulaire ne se généralise, et chaque équipe doit définir le sien selon son contexte. Ce qui n'est pas connu, c'est si la segmentation que les équipes définissent au démarrage d'un système reste stable à mesure que le système mûrit, ou si elle se révise. Les équipes qui ont géré un système de motion tokens pendant deux ans ou plus, et qui ont changé ou reconsidéré leur vocabulaire d'intention, fourniraient les données les plus utiles ici. Trois ou quatre exemples concrets suffiraient à fonder la position.

---

**Question 4 — La profondeur 5 (l'animation comme objet) existe-t-elle dans un système en production aujourd'hui ?**

La position actuelle est non. LottieFiles est l'exemple connu le plus proche : il prend des données de keyframes After Effects et livre un fichier JSON platform-agnostique qu'un player résout sur web, iOS et Android. Mais Lottie exporte des keyframes calculées — un export de données d'animation résolues, pas une intention comportementale abstraite. La profondeur 5 telle que définie ici signifierait un token source qui décrit *ce que quelque chose fait* (comportement, direction, personnalité physique) dans un format sans équivalent direct sur aucune plateforme, résolu par un pipeline de build en code spécifique à la plateforme. La distinction : Lottie vous donne les keyframes ; la profondeur 5 vous donnerait l'intention à partir de laquelle les keyframes sont générées. Toute équipe chez LottieFiles, Rive, ou une plateforme similaire travaillant sur l'abstraction côté authoring (au-dessus de la résolution de keyframes) serait le bon interlocuteur. Si un système en production a implémenté quelque chose de similaire, nous ne l'avons pas trouvé dans la documentation publique.

---

**Question 5 — Que devrait contenir un module Motion DTCG ?**

La spec stable d'octobre 2025 définit trois types pertinents pour le mouvement : `duration`, `cubicBezier` et `transition`. Un module Motion figure dans la roadmap DTCG mais n'a pas encore été spécifié. Cette recherche propose que le module nécessite au minimum : un type composite `spring` (avec au minimum stiffness/damping/mass, et idéalement le paramétrage Apple response/dampingFraction comme forme alternative), un type `stagger` (interval, from, cap), et un mécanisme pour encoder une intention animée qui se résout en rendu spécifique à la plateforme. Ce que la spec devrait explicitement exclure est tout aussi important — les décisions de périmètre prises à ce stade contraindront ce que les tokens peuvent exprimer pendant des années. Les retours d'équipes qui ont construit des contournements pour les lacunes actuelles de la spec (types personnalisés, blocs d'extension, schémas JSON séparés) informeraient directement ce que le module doit couvrir et ce qu'il ne doit pas couvrir.
