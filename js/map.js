// Initialisation de la carte du sentier pédagogique
document.addEventListener('DOMContentLoaded', function() {
    // Vérifier si l'élément de carte existe
    const mapElement = document.getElementById('sentier-map');
    if (!mapElement) return;

    console.log('Initialisation de la carte...');

    // Initialiser la carte avec une vue sur la France
    const map = L.map('sentier-map').setView([45.6, 2.5], 7);

    // Ajouter un fond de carte OpenStreetMap
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19
    }).addTo(map);

    // Fonction pour charger les données GeoJSON
    function loadGeoJSON() {
        console.log('Chargement des données GeoJSON...');
        
        // Charger les données du sentier
        fetch('./couches_webmapping/sentiers.geojson')
            .then(response => {
                console.log('Réponse du serveur pour sentiers.geojson:', response.status);
                if (!response.ok) {
                    throw new Error('Impossible de charger le fichier sentiers.geojson');
                }
                return response.json();
            })
            .then(data => {
                console.log('Données du sentier chargées:', data);
                
                // Créer un tableau pour stocker les coordonnées converties
                const convertedFeatures = [];
                
                // Parcourir chaque feature
                data.features.forEach(feature => {
                    // Créer une copie de la feature
                    const convertedFeature = JSON.parse(JSON.stringify(feature));
                    
                    // Convertir les coordonnées Lambert 93 en WGS84
                    if (feature.geometry.type === 'MultiLineString') {
                        convertedFeature.geometry.coordinates = feature.geometry.coordinates.map(lineString => {
                            return lineString.map(coord => {
                                // Utiliser des coordonnées approximatives pour le test
                                // Dans une version finale, il faudrait utiliser proj4js pour la conversion
                                const lat = (coord[1] - 6500000) / 100000 + 45.5;
                                const lng = (coord[0] - 600000) / 100000 + 2.0;
                                return [lat, lng];
                            });
                        });
                    }
                    
                    convertedFeatures.push(convertedFeature);
                });
                
                // Créer un objet GeoJSON avec les features converties
                const convertedData = {
                    type: 'FeatureCollection',
                    features: convertedFeatures
                };
                
                // Ajouter le sentier à la carte avec un style en pointillés bleus
                L.geoJSON(convertedData, {
                    style: {
                        color: '#0066cc',
                        weight: 3,
                        opacity: 0.8,
                        dashArray: '5, 10',
                        lineCap: 'round'
                    }
                }).addTo(map);
                
                // Charger les données des arrêts
                return fetch('./couches_webmapping/arrets.geojson')
                    .then(response => {
                        console.log('Réponse du serveur pour arrets.geojson:', response.status);
                        if (!response.ok) {
                            throw new Error('Impossible de charger le fichier arrets.geojson');
                        }
                        return response.json();
                    });
            })
            .then(data => {
                console.log('Données des arrêts chargées:', data);
                
                // Créer un tableau pour stocker les coordonnées converties
                const convertedFeatures = [];
                
                // Parcourir chaque feature
                data.features.forEach(feature => {
                    // Créer une copie de la feature
                    const convertedFeature = JSON.parse(JSON.stringify(feature));
                    
                    // Convertir les coordonnées Lambert 93 en WGS84
                    if (feature.geometry.type === 'MultiPoint') {
                        convertedFeature.geometry.coordinates = feature.geometry.coordinates.map(point => {
                            // Utiliser des coordonnées approximatives pour le test
                            // Dans une version finale, il faudrait utiliser proj4js pour la conversion
                            const lat = (point[1] - 6500000) / 100000 + 45.5;
                            const lng = (point[0] - 600000) / 100000 + 2.0;
                            return [lat, lng];
                        });
                    }
                    
                    convertedFeatures.push(convertedFeature);
                });
                
                // Créer un objet GeoJSON avec les features converties
                const convertedData = {
                    type: 'FeatureCollection',
                    features: convertedFeatures
                };
                
                // Ajouter les arrêts à la carte avec des marqueurs noirs
                L.geoJSON(convertedData, {
                    pointToLayer: function(feature, latlng) {
                        return L.circleMarker(latlng, {
                            radius: 8,
                            fillColor: '#000',
                            color: '#fff',
                            weight: 2,
                            opacity: 1,
                            fillOpacity: 0.8
                        });
                    },
                    onEachFeature: function(feature, layer) {
                        // Créer le contenu du popup pour chaque arrêt
                        const arretId = feature.properties.id;
                        const arretName = feature.properties.Arrêts;
                        
                        const popupContent = `
                            <div class="arret-popup">
                                <h3>Arrêt ${arretId}</h3>
                                <p>${arretName}</p>
                                <a href="arrets/arret${arretId}.html">Découvrir cet arrêt</a>
                            </div>
                        `;
                        
                        // Ajouter le popup au marqueur
                        layer.bindPopup(popupContent);
                    }
                }).addTo(map);
                
                // Ajuster la vue de la carte pour montrer tous les éléments
                map.setView([45.6, 2.5], 15);
            })
            .catch(error => {
                console.error('Erreur lors du chargement des données GeoJSON:', error);
                mapElement.innerHTML = '<p class="error-message">Impossible de charger la carte. Veuillez réessayer plus tard.</p>';
            });
    }

    // Charger les données GeoJSON
    loadGeoJSON();
});