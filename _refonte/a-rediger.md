# Villes à rédiger : les 26 angles locaux

Généré par `scripts/build-a-rediger.js`. Pour chaque ville, un paragraphe de
120 à 180 mots à écrire à la main dans `editorial.localAngle` de
`data/cities.json`.

C’est ce paragraphe qui distingue une page locale légitime d’une doorway :
tout le reste du gabarit est partagé entre les 26 pages.

**Aucun chiffre inventé.** Les données ci-dessous viennent de
`geo.api.gouv.fr` pour la population et le code INSEE, et de
`recherche-entreprises.api.gouv.fr`, adossée à SIRENE, pour les
établissements actifs et les sections d’activité. Tout champ marqué
« non disponible » doit rester vide sur la page plutôt qu’être comblé.

Deux limites connues :

- l’API entreprises plafonne à 10 000 résultats, donc le nombre
  d’établissements est inexploitable pour les six plus grosses communes ;
- le temps de trajet depuis Bordeaux n’a aucune source automatique fiable.
  La distance à vol d’oiseau est calculée sur les coordonnées INSEE, elle
  est exacte, mais ce n’est pas un temps de trajet.

---

## Tier 1 (8 villes)

### Arcachon

`/consultant-seo-arcachon` · Bassin d'Arcachon · 33120 · INSEE 33009

| Donnée | Valeur | Source |
|---|---|---|
| Population | 11 092 | geo.api.gouv.fr |
| Établissements actifs | 7 475 | recherche-entreprises.api.gouv.fr |
| Distance de Bordeaux | 51.9 km à vol d’oiseau | coordonnées INSEE |
| Temps de trajet | **non disponible** | à mesurer toi-même |

**Secteurs dominants**

1. Activités immobilières : 2 640 établissements
2. Commerce, réparation d’automobiles : 785 établissements
3. Activités spécialisées, scientifiques et techniques : 723 établissements
4. Santé humaine et action sociale : 470 établissements
5. Hébergement et restauration : 454 établissements

**Communes couvertes (1)**

Biganos.

**Villes voisines maillées** : la-teste-de-buch, lege-cap-ferret, ares, cestas, lacanau

**Trois questions pour t’aider à écrire**

1. Quel type de client t’appelle depuis Arcachon, et pour quel problème concret ?
2. Le premier secteur ici est « Activités immobilières ». Est-ce que ça correspond à ce que tu vois sur le terrain, ou la demande réelle est-elle ailleurs ?
3. Qu’est-ce qui change concrètement pour un client à Arcachon par rapport à Bordeaux : concurrence, zone de chalandise, saisonnalité ?

### Bordeaux

`/consultant-seo-bordeaux` · Métropole · 33000 · INSEE 33063

| Donnée | Valeur | Source |
|---|---|---|
| Population | 267 991 | geo.api.gouv.fr |
| Établissements actifs | **non disponible**, API plafonnée à 10 000 | à sourcer autrement |
| Distance de Bordeaux | 0 km à vol d’oiseau | coordonnées INSEE |
| Temps de trajet | **non disponible** | à mesurer toi-même |

**Secteurs dominants** : non disponibles pour cette commune.

**Communes couvertes** : aucune. Cette ville ne récupère aucune commune supprimée.

**Villes voisines maillées** : le-bouscat, bruges, eysines, lormont, floirac

**Trois questions pour t’aider à écrire**

1. Quel type de client t’appelle depuis Bordeaux, et pour quel problème concret ?
2. Quel est le tissu économique de la commune, tel que tu le constates toi-même ?
3. Qu’est-ce qui change concrètement pour un client à Bordeaux par rapport à Bordeaux : concurrence, zone de chalandise, saisonnalité ?

### La Teste-de-Buch

`/consultant-seo-la-teste-de-buch` · Bassin d'Arcachon · 33260 · INSEE 33529

| Donnée | Valeur | Source |
|---|---|---|
| Population | 27 566 | geo.api.gouv.fr |
| Établissements actifs | **non disponible**, API plafonnée à 10 000 | à sourcer autrement |
| Distance de Bordeaux | 56.2 km à vol d’oiseau | coordonnées INSEE |
| Temps de trajet | **non disponible** | à mesurer toi-même |

**Secteurs dominants** : non disponibles pour cette commune.

**Communes couvertes (3)**

Gujan-Mestras, Le Teich, Salles.

**Villes voisines maillées** : arcachon, lege-cap-ferret, ares, cestas, lacanau

**Trois questions pour t’aider à écrire**

1. Quel type de client t’appelle depuis La Teste-de-Buch, et pour quel problème concret ?
2. Quel est le tissu économique de la commune, tel que tu le constates toi-même ?
3. Qu’est-ce qui change concrètement pour un client à La Teste-de-Buch par rapport à Bordeaux : concurrence, zone de chalandise, saisonnalité ?

### Lège-Cap-Ferret

`/consultant-seo-lege-cap-ferret` · Bassin d'Arcachon · 33950 · INSEE 33236

| Donnée | Valeur | Source |
|---|---|---|
| Population | 7 909 | geo.api.gouv.fr |
| Établissements actifs | 6 023 | recherche-entreprises.api.gouv.fr |
| Distance de Bordeaux | 48.3 km à vol d’oiseau | coordonnées INSEE |
| Temps de trajet | **non disponible** | à mesurer toi-même |

**Secteurs dominants**

1. Activités immobilières : 2 361 établissements
2. Commerce, réparation d’automobiles : 564 établissements
3. Hébergement et restauration : 440 établissements
4. Activités spécialisées, scientifiques et techniques : 426 établissements
5. Construction : 309 établissements

**Communes couvertes** : aucune. Cette ville ne récupère aucune commune supprimée.

**Villes voisines maillées** : ares, arcachon, la-teste-de-buch, lacanau, saint-medard-en-jalles

**Trois questions pour t’aider à écrire**

1. Quel type de client t’appelle depuis Lège-Cap-Ferret, et pour quel problème concret ?
2. Le premier secteur ici est « Activités immobilières ». Est-ce que ça correspond à ce que tu vois sur le terrain, ou la demande réelle est-elle ailleurs ?
3. Qu’est-ce qui change concrètement pour un client à Lège-Cap-Ferret par rapport à Bordeaux : concurrence, zone de chalandise, saisonnalité ?

### Mérignac

`/consultant-seo-merignac` · Métropole · 33700 · INSEE 33281

| Donnée | Valeur | Source |
|---|---|---|
| Population | 78 090 | geo.api.gouv.fr |
| Établissements actifs | **non disponible**, API plafonnée à 10 000 | à sourcer autrement |
| Distance de Bordeaux | 8.4 km à vol d’oiseau | coordonnées INSEE |
| Temps de trajet | **non disponible** | à mesurer toi-même |

**Secteurs dominants** : non disponibles pour cette commune.

**Communes couvertes** : aucune. Cette ville ne récupère aucune commune supprimée.

**Villes voisines maillées** : pessac, eysines, le-bouscat, talence, bordeaux

**Trois questions pour t’aider à écrire**

1. Quel type de client t’appelle depuis Mérignac, et pour quel problème concret ?
2. Quel est le tissu économique de la commune, tel que tu le constates toi-même ?
3. Qu’est-ce qui change concrètement pour un client à Mérignac par rapport à Bordeaux : concurrence, zone de chalandise, saisonnalité ?

### Pessac

`/consultant-seo-pessac` · Métropole · 33600 · INSEE 33318

| Donnée | Valeur | Source |
|---|---|---|
| Population | 67 339 | geo.api.gouv.fr |
| Établissements actifs | **non disponible**, API plafonnée à 10 000 | à sourcer autrement |
| Distance de Bordeaux | 11.4 km à vol d’oiseau | coordonnées INSEE |
| Temps de trajet | **non disponible** | à mesurer toi-même |

**Secteurs dominants** : non disponibles pour cette commune.

**Communes couvertes (1)**

Canéjan.

**Villes voisines maillées** : merignac, gradignan, talence, cestas, villenave-dornon

**Trois questions pour t’aider à écrire**

1. Quel type de client t’appelle depuis Pessac, et pour quel problème concret ?
2. Quel est le tissu économique de la commune, tel que tu le constates toi-même ?
3. Qu’est-ce qui change concrètement pour un client à Pessac par rapport à Bordeaux : concurrence, zone de chalandise, saisonnalité ?

### Saint-Médard-en-Jalles

`/consultant-seo-saint-medard-en-jalles` · Métropole · 33160 · INSEE 33449

| Donnée | Valeur | Source |
|---|---|---|
| Population | 32 910 | geo.api.gouv.fr |
| Établissements actifs | 6 601 | recherche-entreprises.api.gouv.fr |
| Distance de Bordeaux | 15.8 km à vol d’oiseau | coordonnées INSEE |
| Temps de trajet | **non disponible** | à mesurer toi-même |

**Secteurs dominants**

1. Activités immobilières : 1 231 établissements
2. Commerce, réparation d’automobiles : 821 établissements
3. Santé humaine et action sociale : 746 établissements
4. Activités spécialisées, scientifiques et techniques : 615 établissements
5. Construction : 504 établissements

**Communes couvertes (1)**

Martignas-sur-Jalle.

**Villes voisines maillées** : saint-aubin-de-medoc, le-taillan-medoc, merignac, eysines, pessac

**Trois questions pour t’aider à écrire**

1. Quel type de client t’appelle depuis Saint-Médard-en-Jalles, et pour quel problème concret ?
2. Le premier secteur ici est « Activités immobilières ». Est-ce que ça correspond à ce que tu vois sur le terrain, ou la demande réelle est-elle ailleurs ?
3. Qu’est-ce qui change concrètement pour un client à Saint-Médard-en-Jalles par rapport à Bordeaux : concurrence, zone de chalandise, saisonnalité ?

### Talence

`/consultant-seo-talence` · Métropole · 33400 · INSEE 33522

| Donnée | Valeur | Source |
|---|---|---|
| Population | 46 338 | geo.api.gouv.fr |
| Établissements actifs | **non disponible**, API plafonnée à 10 000 | à sourcer autrement |
| Distance de Bordeaux | 6.3 km à vol d’oiseau | coordonnées INSEE |
| Temps de trajet | **non disponible** | à mesurer toi-même |

**Secteurs dominants** : non disponibles pour cette commune.

**Communes couvertes** : aucune. Cette ville ne récupère aucune commune supprimée.

**Villes voisines maillées** : begles, gradignan, villenave-dornon, floirac, bordeaux

**Trois questions pour t’aider à écrire**

1. Quel type de client t’appelle depuis Talence, et pour quel problème concret ?
2. Quel est le tissu économique de la commune, tel que tu le constates toi-même ?
3. Qu’est-ce qui change concrètement pour un client à Talence par rapport à Bordeaux : concurrence, zone de chalandise, saisonnalité ?

---

## Tier 2 (12 villes)

### Arès

`/consultant-seo-ares` · Bassin d'Arcachon · 33740 · INSEE 33011

| Donnée | Valeur | Source |
|---|---|---|
| Population | 6 482 | geo.api.gouv.fr |
| Établissements actifs | 2 400 | recherche-entreprises.api.gouv.fr |
| Distance de Bordeaux | 40 km à vol d’oiseau | coordonnées INSEE |
| Temps de trajet | **non disponible** | à mesurer toi-même |

**Secteurs dominants**

1. Activités immobilières : 631 établissements
2. Santé humaine et action sociale : 286 établissements
3. Commerce, réparation d’automobiles : 243 établissements
4. Autres activités de services : 195 établissements
5. Construction : 152 établissements

**Communes couvertes (3)**

Andernos-les-Bains, Audenge, Lanton.

**Villes voisines maillées** : lege-cap-ferret, arcachon, lacanau, la-teste-de-buch, saint-medard-en-jalles

**Trois questions pour t’aider à écrire**

1. Quel type de client t’appelle depuis Arès, et pour quel problème concret ?
2. Le premier secteur ici est « Activités immobilières ». Est-ce que ça correspond à ce que tu vois sur le terrain, ou la demande réelle est-elle ailleurs ?
3. Qu’est-ce qui change concrètement pour un client à Arès par rapport à Bordeaux : concurrence, zone de chalandise, saisonnalité ?

### Bègles

`/consultant-seo-begles` · Métropole · 33130 · INSEE 33039

| Donnée | Valeur | Source |
|---|---|---|
| Population | 31 831 | geo.api.gouv.fr |
| Établissements actifs | **non disponible**, API plafonnée à 10 000 | à sourcer autrement |
| Distance de Bordeaux | 7.2 km à vol d’oiseau | coordonnées INSEE |
| Temps de trajet | **non disponible** | à mesurer toi-même |

**Secteurs dominants** : non disponibles pour cette commune.

**Communes couvertes (1)**

Latresne.

**Villes voisines maillées** : villenave-dornon, talence, floirac, gradignan, bordeaux

**Trois questions pour t’aider à écrire**

1. Quel type de client t’appelle depuis Bègles, et pour quel problème concret ?
2. Quel est le tissu économique de la commune, tel que tu le constates toi-même ?
3. Qu’est-ce qui change concrètement pour un client à Bègles par rapport à Bordeaux : concurrence, zone de chalandise, saisonnalité ?

### Coutras

`/consultant-seo-coutras` · Libournais · 33230 · INSEE 33138

| Donnée | Valeur | Source |
|---|---|---|
| Population | 8 678 | geo.api.gouv.fr |
| Établissements actifs | 2 042 | recherche-entreprises.api.gouv.fr |
| Distance de Bordeaux | 43 km à vol d’oiseau | coordonnées INSEE |
| Temps de trajet | **non disponible** | à mesurer toi-même |

**Secteurs dominants**

1. Activités immobilières : 391 établissements
2. Commerce, réparation d’automobiles : 304 établissements
3. Construction : 186 établissements
4. Autres activités de services : 177 établissements
5. Santé humaine et action sociale : 152 établissements

**Communes couvertes (5)**

Pineuilh, Saint-Denis-de-Pile, Saint-Savin, Saint-Seurin-sur-l'Isle, Sainte-Foy-la-Grande.

**Villes voisines maillées** : libourne, lormont, floirac, bruges, bordeaux

**Trois questions pour t’aider à écrire**

1. Quel type de client t’appelle depuis Coutras, et pour quel problème concret ?
2. Le premier secteur ici est « Activités immobilières ». Est-ce que ça correspond à ce que tu vois sur le terrain, ou la demande réelle est-elle ailleurs ?
3. Qu’est-ce qui change concrètement pour un client à Coutras par rapport à Bordeaux : concurrence, zone de chalandise, saisonnalité ?

### Eysines

`/consultant-seo-eysines` · Métropole · 33320 · INSEE 33162

| Donnée | Valeur | Source |
|---|---|---|
| Population | 24 825 | geo.api.gouv.fr |
| Établissements actifs | 6 342 | recherche-entreprises.api.gouv.fr |
| Distance de Bordeaux | 5.1 km à vol d’oiseau | coordonnées INSEE |
| Temps de trajet | **non disponible** | à mesurer toi-même |

**Secteurs dominants**

1. Activités immobilières : 1 137 établissements
2. Commerce, réparation d’automobiles : 804 établissements
3. Construction : 682 établissements
4. Santé humaine et action sociale : 587 établissements
5. Activités spécialisées, scientifiques et techniques : 578 établissements

**Communes couvertes (1)**

Le Haillan.

**Villes voisines maillées** : bruges, le-bouscat, le-taillan-medoc, bordeaux, merignac

**Trois questions pour t’aider à écrire**

1. Quel type de client t’appelle depuis Eysines, et pour quel problème concret ?
2. Le premier secteur ici est « Activités immobilières ». Est-ce que ça correspond à ce que tu vois sur le terrain, ou la demande réelle est-elle ailleurs ?
3. Qu’est-ce qui change concrètement pour un client à Eysines par rapport à Bordeaux : concurrence, zone de chalandise, saisonnalité ?

### Floirac

`/consultant-seo-floirac` · Métropole · 33270 · INSEE 33167

| Donnée | Valeur | Source |
|---|---|---|
| Population | 18 300 | geo.api.gouv.fr |
| Établissements actifs | 5 032 | recherche-entreprises.api.gouv.fr |
| Distance de Bordeaux | 6 km à vol d’oiseau | coordonnées INSEE |
| Temps de trajet | **non disponible** | à mesurer toi-même |

**Secteurs dominants**

1. Activités immobilières : 798 établissements
2. Construction : 660 établissements
3. Commerce, réparation d’automobiles : 630 établissements
4. Activités spécialisées, scientifiques et techniques : 511 établissements
5. Santé humaine et action sociale : 493 établissements

**Communes couvertes (6)**

Bouliac, Carignan-de-Bordeaux, Créon, Fargues-Saint-Hilaire, Sadirac, Tresses.

**Villes voisines maillées** : begles, lormont, bordeaux, talence, villenave-dornon

**Trois questions pour t’aider à écrire**

1. Quel type de client t’appelle depuis Floirac, et pour quel problème concret ?
2. Le premier secteur ici est « Activités immobilières ». Est-ce que ça correspond à ce que tu vois sur le terrain, ou la demande réelle est-elle ailleurs ?
3. Qu’est-ce qui change concrètement pour un client à Floirac par rapport à Bordeaux : concurrence, zone de chalandise, saisonnalité ?

### Gradignan

`/consultant-seo-gradignan` · Métropole · 33170 · INSEE 33192

| Donnée | Valeur | Source |
|---|---|---|
| Population | 26 952 | geo.api.gouv.fr |
| Établissements actifs | 6 694 | recherche-entreprises.api.gouv.fr |
| Distance de Bordeaux | 10.8 km à vol d’oiseau | coordonnées INSEE |
| Temps de trajet | **non disponible** | à mesurer toi-même |

**Secteurs dominants**

1. Activités immobilières : 1 502 établissements
2. Activités spécialisées, scientifiques et techniques : 691 établissements
3. Santé humaine et action sociale : 673 établissements
4. Commerce, réparation d’automobiles : 668 établissements
5. Autres activités de services : 505 établissements

**Communes couvertes (1)**

Léognan.

**Villes voisines maillées** : talence, villenave-dornon, pessac, begles, merignac

**Trois questions pour t’aider à écrire**

1. Quel type de client t’appelle depuis Gradignan, et pour quel problème concret ?
2. Le premier secteur ici est « Activités immobilières ». Est-ce que ça correspond à ce que tu vois sur le terrain, ou la demande réelle est-elle ailleurs ?
3. Qu’est-ce qui change concrètement pour un client à Gradignan par rapport à Bordeaux : concurrence, zone de chalandise, saisonnalité ?

### Lacanau

`/consultant-seo-lacanau` · Médoc · 33680 · INSEE 33214

| Donnée | Valeur | Source |
|---|---|---|
| Population | 5 739 | geo.api.gouv.fr |
| Établissements actifs | 3 532 | recherche-entreprises.api.gouv.fr |
| Distance de Bordeaux | 42.6 km à vol d’oiseau | coordonnées INSEE |
| Temps de trajet | **non disponible** | à mesurer toi-même |

**Secteurs dominants**

1. Activités immobilières : 1 157 établissements
2. Hébergement et restauration : 334 établissements
3. Commerce, réparation d’automobiles : 325 établissements
4. Activités spécialisées, scientifiques et techniques : 293 établissements
5. Santé humaine et action sociale : 201 établissements

**Communes couvertes (1)**

Hourtin.

**Villes voisines maillées** : ares, saint-medard-en-jalles, lege-cap-ferret, saint-aubin-de-medoc, le-taillan-medoc

**Trois questions pour t’aider à écrire**

1. Quel type de client t’appelle depuis Lacanau, et pour quel problème concret ?
2. Le premier secteur ici est « Activités immobilières ». Est-ce que ça correspond à ce que tu vois sur le terrain, ou la demande réelle est-elle ailleurs ?
3. Qu’est-ce qui change concrètement pour un client à Lacanau par rapport à Bordeaux : concurrence, zone de chalandise, saisonnalité ?

### Le Bouscat

`/consultant-seo-le-bouscat` · Métropole · 33110 · INSEE 33069

| Donnée | Valeur | Source |
|---|---|---|
| Population | 25 081 | geo.api.gouv.fr |
| Établissements actifs | 8 756 | recherche-entreprises.api.gouv.fr |
| Distance de Bordeaux | 1.5 km à vol d’oiseau | coordonnées INSEE |
| Temps de trajet | **non disponible** | à mesurer toi-même |

**Secteurs dominants**

1. Activités immobilières : 2 383 établissements
2. Activités spécialisées, scientifiques et techniques : 1 062 établissements
3. Commerce, réparation d’automobiles : 882 établissements
4. Santé humaine et action sociale : 791 établissements
5. Construction : 489 établissements

**Communes couvertes** : aucune. Cette ville ne récupère aucune commune supprimée.

**Villes voisines maillées** : bordeaux, bruges, eysines, talence, lormont

**Trois questions pour t’aider à écrire**

1. Quel type de client t’appelle depuis Le Bouscat, et pour quel problème concret ?
2. Le premier secteur ici est « Activités immobilières ». Est-ce que ça correspond à ce que tu vois sur le terrain, ou la demande réelle est-elle ailleurs ?
3. Qu’est-ce qui change concrètement pour un client au Bouscat par rapport à Bordeaux : concurrence, zone de chalandise, saisonnalité ?

### Libourne

`/consultant-seo-libourne` · Libournais · 33500 · INSEE 33243

| Donnée | Valeur | Source |
|---|---|---|
| Population | 25 036 | geo.api.gouv.fr |
| Établissements actifs | 8 852 | recherche-entreprises.api.gouv.fr |
| Distance de Bordeaux | 28.3 km à vol d’oiseau | coordonnées INSEE |
| Temps de trajet | **non disponible** | à mesurer toi-même |

**Secteurs dominants**

1. Activités immobilières : 1 928 établissements
2. Commerce, réparation d’automobiles : 1 300 établissements
3. Santé humaine et action sociale : 722 établissements
4. Activités spécialisées, scientifiques et techniques : 718 établissements
5. Autres activités de services : 558 établissements

**Communes couvertes (9)**

Castillon-la-Bataille, Cézac, Galgon, Izon, Marsas, Saint-Emilion, Saint-Magne-de-Castillon, Targon, Vayres.

**Villes voisines maillées** : coutras, lormont, floirac, begles, bordeaux

**Trois questions pour t’aider à écrire**

1. Quel type de client t’appelle depuis Libourne, et pour quel problème concret ?
2. Le premier secteur ici est « Activités immobilières ». Est-ce que ça correspond à ce que tu vois sur le terrain, ou la demande réelle est-elle ailleurs ?
3. Qu’est-ce qui change concrètement pour un client à Libourne par rapport à Bordeaux : concurrence, zone de chalandise, saisonnalité ?

### Lormont

`/consultant-seo-lormont` · Métropole · 33310 · INSEE 33249

| Donnée | Valeur | Source |
|---|---|---|
| Population | 25 769 | geo.api.gouv.fr |
| Établissements actifs | 7 088 | recherche-entreprises.api.gouv.fr |
| Distance de Bordeaux | 5.5 km à vol d’oiseau | coordonnées INSEE |
| Temps de trajet | **non disponible** | à mesurer toi-même |

**Secteurs dominants**

1. Construction : 1 169 établissements
2. Commerce, réparation d’automobiles : 1 011 établissements
3. Activités immobilières : 867 établissements
4. Santé humaine et action sociale : 615 établissements
5. Activités spécialisées, scientifiques et techniques : 586 établissements

**Communes couvertes (11)**

Ambarès-et-Lagrave, Artigues-près-Bordeaux, Bassens, Carbon-Blanc, Cenon, Montussan, Saint-André-de-Cubzac, Saint-Loubès, Saint-Sulpice-et-Cameyrac, Sainte-Eulalie, Yvrac.

**Villes voisines maillées** : floirac, bordeaux, le-bouscat, bruges, begles

**Trois questions pour t’aider à écrire**

1. Quel type de client t’appelle depuis Lormont, et pour quel problème concret ?
2. Le premier secteur ici est « Construction ». Est-ce que ça correspond à ce que tu vois sur le terrain, ou la demande réelle est-elle ailleurs ?
3. Qu’est-ce qui change concrètement pour un client à Lormont par rapport à Bordeaux : concurrence, zone de chalandise, saisonnalité ?

### Saint-Aubin-de-Médoc

`/consultant-seo-saint-aubin-de-medoc` · Médoc · 33160 · INSEE 33376

| Donnée | Valeur | Source |
|---|---|---|
| Population | 7 769 | geo.api.gouv.fr |
| Établissements actifs | 1 888 | recherche-entreprises.api.gouv.fr |
| Distance de Bordeaux | 15.1 km à vol d’oiseau | coordonnées INSEE |
| Temps de trajet | **non disponible** | à mesurer toi-même |

**Secteurs dominants**

1. Activités immobilières : 590 établissements
2. Santé humaine et action sociale : 191 établissements
3. Activités spécialisées, scientifiques et techniques : 180 établissements
4. Commerce, réparation d’automobiles : 175 établissements
5. Construction : 135 établissements

**Communes couvertes (7)**

Arsac, Avensan, Blaye, Castelnau-de-Médoc, Pauillac, Saint-Laurent-Médoc, Sainte-Hélène.

**Villes voisines maillées** : saint-medard-en-jalles, le-taillan-medoc, eysines, bruges, merignac

**Trois questions pour t’aider à écrire**

1. Quel type de client t’appelle depuis Saint-Aubin-de-Médoc, et pour quel problème concret ?
2. Le premier secteur ici est « Activités immobilières ». Est-ce que ça correspond à ce que tu vois sur le terrain, ou la demande réelle est-elle ailleurs ?
3. Qu’est-ce qui change concrètement pour un client à Saint-Aubin-de-Médoc par rapport à Bordeaux : concurrence, zone de chalandise, saisonnalité ?

### Villenave-d'Ornon

`/consultant-seo-villenave-dornon` · Métropole · 33140 · INSEE 33550

| Donnée | Valeur | Source |
|---|---|---|
| Population | 42 545 | geo.api.gouv.fr |
| Établissements actifs | 9 414 | recherche-entreprises.api.gouv.fr |
| Distance de Bordeaux | 10.2 km à vol d’oiseau | coordonnées INSEE |
| Temps de trajet | **non disponible** | à mesurer toi-même |

**Secteurs dominants**

1. Activités immobilières : 1 990 établissements
2. Commerce, réparation d’automobiles : 1 135 établissements
3. Construction : 990 établissements
4. Santé humaine et action sociale : 850 établissements
5. Activités spécialisées, scientifiques et techniques : 819 établissements

**Communes couvertes (4)**

Cadaujac, Castres-Gironde, La Brède, Saint-Caprais-de-Bordeaux.

**Villes voisines maillées** : begles, talence, gradignan, floirac, bordeaux

**Trois questions pour t’aider à écrire**

1. Quel type de client t’appelle depuis Villenave-d'Ornon, et pour quel problème concret ?
2. Le premier secteur ici est « Activités immobilières ». Est-ce que ça correspond à ce que tu vois sur le terrain, ou la demande réelle est-elle ailleurs ?
3. Qu’est-ce qui change concrètement pour un client à Villenave-d'Ornon par rapport à Bordeaux : concurrence, zone de chalandise, saisonnalité ?

---

## Tier 3 (6 villes)

### Bazas

`/consultant-seo-bazas` · Sud-Gironde · 33430 · INSEE 33036

| Donnée | Valeur | Source |
|---|---|---|
| Population | 4 854 | geo.api.gouv.fr |
| Établissements actifs | 1 607 | recherche-entreprises.api.gouv.fr |
| Distance de Bordeaux | 55.1 km à vol d’oiseau | coordonnées INSEE |
| Temps de trajet | **non disponible** | à mesurer toi-même |

**Secteurs dominants**

1. Activités immobilières : 291 établissements
2. Commerce, réparation d’automobiles : 182 établissements
3. Autres activités de services : 152 établissements
4. Santé humaine et action sociale : 149 établissements
5. Agriculture, sylviculture et pêche : 141 établissements

**Communes couvertes** : aucune. Cette ville ne récupère aucune commune supprimée.

**Villes voisines maillées** : langon, villenave-dornon, begles, gradignan, floirac

**Trois questions pour t’aider à écrire**

1. Quel type de client t’appelle depuis Bazas, et pour quel problème concret ?
2. Le premier secteur ici est « Activités immobilières ». Est-ce que ça correspond à ce que tu vois sur le terrain, ou la demande réelle est-elle ailleurs ?
3. Qu’est-ce qui change concrètement pour un client à Bazas par rapport à Bordeaux : concurrence, zone de chalandise, saisonnalité ?

### Bruges

`/consultant-seo-bruges` · Métropole · 33520 · INSEE 33075

| Donnée | Valeur | Source |
|---|---|---|
| Population | 20 020 | geo.api.gouv.fr |
| Établissements actifs | 6 235 | recherche-entreprises.api.gouv.fr |
| Distance de Bordeaux | 3.3 km à vol d’oiseau | coordonnées INSEE |
| Temps de trajet | **non disponible** | à mesurer toi-même |

**Secteurs dominants**

1. Activités immobilières : 1 276 établissements
2. Activités spécialisées, scientifiques et techniques : 690 établissements
3. Commerce, réparation d’automobiles : 636 établissements
4. Santé humaine et action sociale : 563 établissements
5. Construction : 516 établissements

**Communes couvertes (5)**

Ambès, Blanquefort, Bourg, Ludon-Médoc, Parempuyre.

**Villes voisines maillées** : le-bouscat, bordeaux, eysines, le-taillan-medoc, lormont

**Trois questions pour t’aider à écrire**

1. Quel type de client t’appelle depuis Bruges, et pour quel problème concret ?
2. Le premier secteur ici est « Activités immobilières ». Est-ce que ça correspond à ce que tu vois sur le terrain, ou la demande réelle est-elle ailleurs ?
3. Qu’est-ce qui change concrètement pour un client à Bruges par rapport à Bordeaux : concurrence, zone de chalandise, saisonnalité ?

### Cestas

`/consultant-seo-cestas` · Sud-Gironde · 33610 · INSEE 33122

| Donnée | Valeur | Source |
|---|---|---|
| Population | 16 666 | geo.api.gouv.fr |
| Établissements actifs | 4 408 | recherche-entreprises.api.gouv.fr |
| Distance de Bordeaux | 19.1 km à vol d’oiseau | coordonnées INSEE |
| Temps de trajet | **non disponible** | à mesurer toi-même |

**Secteurs dominants**

1. Activités immobilières : 918 établissements
2. Commerce, réparation d’automobiles : 512 établissements
3. Activités spécialisées, scientifiques et techniques : 425 établissements
4. Santé humaine et action sociale : 406 établissements
5. Construction : 356 établissements

**Communes couvertes (5)**

Belin-Béliet, Le Barp, Marcheprime, Mios, Saint-Jean-d'Illac.

**Villes voisines maillées** : pessac, gradignan, merignac, talence, villenave-dornon

**Trois questions pour t’aider à écrire**

1. Quel type de client t’appelle depuis Cestas, et pour quel problème concret ?
2. Le premier secteur ici est « Activités immobilières ». Est-ce que ça correspond à ce que tu vois sur le terrain, ou la demande réelle est-elle ailleurs ?
3. Qu’est-ce qui change concrètement pour un client à Cestas par rapport à Bordeaux : concurrence, zone de chalandise, saisonnalité ?

### Langon

`/consultant-seo-langon` · Sud-Gironde · 33210 · INSEE 33227

| Donnée | Valeur | Source |
|---|---|---|
| Population | 7 674 | geo.api.gouv.fr |
| Établissements actifs | 3 289 | recherche-entreprises.api.gouv.fr |
| Distance de Bordeaux | 45.3 km à vol d’oiseau | coordonnées INSEE |
| Temps de trajet | **non disponible** | à mesurer toi-même |

**Secteurs dominants**

1. Activités immobilières : 581 établissements
2. Commerce, réparation d’automobiles : 541 établissements
3. Santé humaine et action sociale : 409 établissements
4. Autres activités de services : 250 établissements
5. Activités spécialisées, scientifiques et techniques : 241 établissements

**Communes couvertes (4)**

La Réole, Monségur, Podensac, Sauveterre-de-Guyenne.

**Villes voisines maillées** : bazas, villenave-dornon, begles, gradignan, floirac

**Trois questions pour t’aider à écrire**

1. Quel type de client t’appelle depuis Langon, et pour quel problème concret ?
2. Le premier secteur ici est « Activités immobilières ». Est-ce que ça correspond à ce que tu vois sur le terrain, ou la demande réelle est-elle ailleurs ?
3. Qu’est-ce qui change concrètement pour un client à Langon par rapport à Bordeaux : concurrence, zone de chalandise, saisonnalité ?

### Le Taillan-Médoc

`/consultant-seo-le-taillan-medoc` · Médoc · 33320 · INSEE 33519

| Donnée | Valeur | Source |
|---|---|---|
| Population | 11 073 | geo.api.gouv.fr |
| Établissements actifs | 2 237 | recherche-entreprises.api.gouv.fr |
| Distance de Bordeaux | 9.2 km à vol d’oiseau | coordonnées INSEE |
| Temps de trajet | **non disponible** | à mesurer toi-même |

**Secteurs dominants**

1. Activités immobilières : 489 établissements
2. Commerce, réparation d’automobiles : 241 établissements
3. Construction : 230 établissements
4. Activités spécialisées, scientifiques et techniques : 220 établissements
5. Santé humaine et action sociale : 211 établissements

**Communes couvertes (2)**

Le Pian-Médoc, Macau.

**Villes voisines maillées** : eysines, saint-aubin-de-medoc, bruges, le-bouscat, saint-medard-en-jalles

**Trois questions pour t’aider à écrire**

1. Quel type de client t’appelle depuis Le Taillan-Médoc, et pour quel problème concret ?
2. Le premier secteur ici est « Activités immobilières ». Est-ce que ça correspond à ce que tu vois sur le terrain, ou la demande réelle est-elle ailleurs ?
3. Qu’est-ce qui change concrètement pour un client au Taillan-Médoc par rapport à Bordeaux : concurrence, zone de chalandise, saisonnalité ?

### Soulac-sur-Mer

`/consultant-seo-soulac-sur-mer` · Médoc · 33780 · INSEE 33514

| Donnée | Valeur | Source |
|---|---|---|
| Population | 3 100 | geo.api.gouv.fr |
| Établissements actifs | 2 022 | recherche-entreprises.api.gouv.fr |
| Distance de Bordeaux | 81 km à vol d’oiseau | coordonnées INSEE |
| Temps de trajet | **non disponible** | à mesurer toi-même |

**Secteurs dominants**

1. Activités immobilières : 898 établissements
2. Commerce, réparation d’automobiles : 197 établissements
3. Hébergement et restauration : 186 établissements
4. Activités spécialisées, scientifiques et techniques : 104 établissements
5. Santé humaine et action sociale : 89 établissements

**Communes couvertes (2)**

Saint-Ciers-sur-Gironde, Vendays-Montalivet.

**Villes voisines maillées** : lacanau, saint-aubin-de-medoc, saint-medard-en-jalles, le-taillan-medoc, eysines

**Trois questions pour t’aider à écrire**

1. Quel type de client t’appelle depuis Soulac-sur-Mer, et pour quel problème concret ?
2. Le premier secteur ici est « Activités immobilières ». Est-ce que ça correspond à ce que tu vois sur le terrain, ou la demande réelle est-elle ailleurs ?
3. Qu’est-ce qui change concrètement pour un client à Soulac-sur-Mer par rapport à Bordeaux : concurrence, zone de chalandise, saisonnalité ?
