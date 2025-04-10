# 🌿 Sentier Pédagogique de Saint-Merd-les-Oussines

## 📍 Présentation

Bienvenue sur le dépôt du **Sentier Pédagogique de Saint-Merd-les-Oussines**, un projet numérique qui met en valeur le patrimoine naturel et culturel du Plateau de Millevaches dans le Parc Naturel Régional de Millevaches en Limousin.

Ce site web accompagne les visiteurs le long d'un parcours balisé à travers différents points d'intérêt (arrêts). À chaque arrêt, les visiteurs peuvent scanner un QR code qui les dirige vers une page web dédiée contenant des informations détaillées, des photos, et des contenus interactifs sur la nature, l'histoire et le patrimoine local.

## 🗺️ Fonctionnalités

- **Carte interactive** sur chaque page d'arrêt avec localisation précise
- **Contenu multimédia** : photos, vidéos et fichiers audio
- **Adaptation responsive** pour une consultation optimale sur tous les appareils
- **Interface intuitive** pour une navigation facile entre les différents arrêts
- **Conversion de coordonnées** entre les systèmes de projection Lambert 93 et WGS84

## 🔧 Technologies utilisées

- HTML5, CSS3, JavaScript
- [Leaflet](https://leafletjs.com/) pour les cartes interactives
- [Proj4js](http://proj4js.org/) pour la conversion des coordonnées géographiques
- [Font Awesome](https://fontawesome.com/) pour les icônes
- Déploiement via GitHub Pages

## 📱 Utilisation

Le site est accessible à l'adresse : [https://cen-nouvelle-aquitaine.github.io/Sentier_pedagogique19/](https://cen-nouvelle-aquitaine.github.io/Sentier_pedagogique19/)

Pour une expérience optimale :
1. Scannez les QR codes présents sur les panneaux du sentier
2. Explorez les informations détaillées de chaque arrêt
3. Utilisez la carte interactive pour vous situer sur le parcours
4. Naviguez entre les différents arrêts à l'aide des liens de navigation

## 🌳 Structure du projet

```
sentier_pedagogique_19/
├── arrets/               # Pages HTML pour chaque arrêt du sentier
├── audio/                # Fichiers audio (chants d'oiseaux, etc.)
├── couches_webmapping/   # Données géographiques (GeoJSON)
├── css/                  # Feuilles de style
├── img/                  # Images et photos
├── includes/             # Éléments HTML réutilisables (header, footer)
├── js/                   # Scripts JavaScript
├── videos/               # Fichiers vidéo
└── index.html            # Page d'accueil
```

## 🔄 Particularités techniques

- Les fichiers GeoJSON utilisent la projection Lambert 93 (EPSG:2154) et sont convertis en WGS84 pour l'affichage sur Leaflet
- Un point sur la carte peut être associé à plusieurs arrêts via la propriété "arrets" dans le fichier GeoJSON
- Le script de carte est réutilisé sur toutes les pages d'arrêt pour éviter la duplication de code

## 📝 Licence

Ce projet est développé par le Conservatoire d'Espaces Naturels (CEN) de Nouvelle-Aquitaine.

## 📞 Contact

Pour toute question ou suggestion concernant ce projet, veuillez contacter le CEN Nouvelle-Aquitaine.

---

*Projet réalisé dans le cadre de la valorisation des espaces naturels du Parc Naturel Régional de Millevaches en Limousin.*
