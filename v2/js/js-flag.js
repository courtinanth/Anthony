/* anthony-courtin.com v2 — drapeau « JavaScript actif »
   ------------------------------------------------------
   Chargé tout en haut du <head>, SANS defer ni async : la classe est posée
   avant le premier rendu, donc aucune bascule visible à l'écran.

   Tout ce que main.css masque en attendant une animation JS (.rv, .panel,
   .faq-a) est conditionné à cette classe. Conséquence : si ce script ne
   s'exécute pas — JavaScript coupé, script bloqué par une extension ou un
   proxy, robot d'indexation qui ne rend pas la page — le contenu reste
   visible et lisible au lieu de rester à opacity:0.

   Ne pas passer ce fichier en defer : la classe arriverait après le premier
   rendu et le contenu apparaîtrait puis disparaîtrait. */
document.documentElement.classList.add('js');
