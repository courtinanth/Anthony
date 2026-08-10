# Prompts Claude Design : motions du site v2 (DA sapin)

Trois motions validés : révélation du logo, hero forêt de données, compteurs + courbe SEO.
Chaque prompt est autonome : copier-coller tel quel dans Claude Design, un motion à la fois.

Contrainte transverse déjà incluse dans chaque prompt : CSS/SVG natif uniquement, pas de librairie, respect de `prefers-reduced-motion`, animations uniquement sur `transform` et `opacity` (GPU), poids quasi nul.

---

## Motion 1 : révélation du logo

```
Crée une animation de révélation de logo en HTML/CSS/SVG pur, sans aucune librairie externe, livrée en un seul fichier HTML autonome que je pourrai intégrer dans mon site.

Contexte : logo texte "anthony courtin" en gros serif éditorial (type Didone très gras), écrit sur deux lignes alignées à gauche, couleur crème #F4F1E8 sur fond vert sapin profond #06201A, avec un trait souligné vert lime #C6F76F sous le mot "courtin". Je remplacerai le SVG de démonstration par mon fichier logo-transparent-cream.svg, donc structure l'animation pour cibler des groupes SVG ou des conteneurs, pas des tracés précis.

Déroulé de l'animation, durée totale 1,6 seconde maximum :
1. 0 à 0,6 s : la ligne "anthony" monte de 24 px avec un fondu, easing cubic-bezier(0.16, 1, 0.3, 1)
2. 0,15 à 0,75 s : la ligne "courtin" fait la même chose avec 150 ms de décalage
3. 0,7 à 1,4 s : le souligné lime se dessine de gauche à droite (scaleX de 0 à 1, transform-origin left), même easing
4. L'animation se joue une seule fois au chargement puis reste figée sur l'état final

Contraintes de performance strictes :
- animations uniquement sur transform et opacity, jamais sur width, height ou left
- aucune librairie, aucun JavaScript sauf éventuellement une classe ajoutée au load
- media query prefers-reduced-motion: reduce qui affiche directement l'état final sans animation
- le tout doit peser moins de 3 Ko hors logo

Style de la page de démonstration : fond #06201A, logo centré verticalement et horizontalement, rien d'autre à l'écran.
```

---

## Motion 2 : hero forêt de données

```
Crée un fond animé de section hero en HTML/CSS/SVG pur, sans aucune librairie, en un seul fichier HTML autonome.

Contexte : c'est l'arrière-plan du hero d'un site de consultant SEO. Fond vert sapin profond #06201A. Par-dessus, en très discret, des courbes de croissance (comme des courbes de positions Google qui montent vers la droite) qui se tracent lentement et en boucle. Le contenu du hero (titre, boutons) sera posé par-dessus, donc l'animation doit rester un décor qui ne vole jamais l'attention.

Composition :
- 3 à 4 courbes SVG maximum, lignes fines de 1,5 px, formes douces et organiques qui montent globalement de gauche à droite
- couleurs : deux courbes en vert pin #1D6B54, une en vert #155040, une seule touche de lime #C6F76F réservée à la courbe principale
- opacité générale entre 0.15 et 0.35, jamais plus
- les courbes se dessinent via stroke-dasharray et stroke-dashoffset animés en CSS, sur environ 8 à 12 secondes chacune, décalées entre elles, puis s'estompent et recommencent en boucle fluide sans à-coup
- éventuellement 2 ou 3 points lime fixes de 3 px aux sommets des courbes, avec une pulsation d'opacité très lente

Contraintes de performance strictes :
- zéro JavaScript, tout en CSS
- animations uniquement sur stroke-dashoffset, transform et opacity
- prefers-reduced-motion: reduce fige les courbes en position finale, statiques
- moins de 4 Ko au total
- le SVG utilise viewBox et preserveAspectRatio pour couvrir le conteneur en responsive sans déformation moche

Page de démonstration : section hero pleine hauteur, fond #06201A, avec un titre de démonstration en crème #F4F1E8 par-dessus pour vérifier la lisibilité, par exemple "L'IA au travail, expliquée simplement".
```

---

## Motion 3 : compteurs + courbe SEO

```
Crée un bloc de résultats animé au scroll en HTML/CSS/JS vanilla, sans aucune librairie, en un seul fichier HTML autonome.

Contexte : section "résultats" d'un site de consultant SEO, sur fond crème #F4F1E8, texte vert sapin très foncé #0B1F1A. Le bloc contient 3 chiffres clés côte à côte et une courbe de positions Google en dessous.

Composition :
- 3 compteurs : "+180 %" (trafic organique), "top 3" (positions Google), "12 min" (gagnées par tâche automatisée). Les libellés sont en petit sous chaque chiffre, en #4C5F58. Les chiffres sont en très grande taille, police serif ou display grasse
- sous les compteurs, une courbe SVG unique qui monte de gauche à droite avec deux petits paliers réalistes, trait de 2,5 px en vert pin #1D6B54, avec la portion finale en lime #C6F76F et un point lime à l'extrémité

Déroulé au scroll :
1. déclenchement quand le bloc entre à 30 % dans le viewport, via IntersectionObserver, une seule fois
2. les compteurs montent de 0 à leur valeur finale en 1,2 s avec un easing qui décélère (ease-out), les valeurs restent lisibles pendant l'animation, pas de défilement illisible
3. en parallèle la courbe se trace en 1,6 s via stroke-dashoffset, le point lime apparaît à la fin avec un petit pop (scale 0 vers 1, léger rebond)

Contraintes de performance strictes :
- JavaScript vanilla minimal : un seul IntersectionObserver et un requestAnimationFrame pour les compteurs, rien d'autre
- animations CSS uniquement sur transform, opacity et stroke-dashoffset
- prefers-reduced-motion: reduce affiche directement les valeurs finales et la courbe complète sans animation
- moins de 6 Ko au total
- aucune dépendance, aucun fetch, aucune police externe dans la démonstration
```

---

## Intégration au retour de Claude Design

Une fois les trois fichiers récupérés, me les redonner tels quels : j'extrairai le CSS/JS utile et je les brancherai dans template-c-sapin.html aux bons endroits (logo dans le header au load, forêt de données dans le hero, compteurs dans la section résultats), en vérifiant le budget poids total et le rendu mobile.
