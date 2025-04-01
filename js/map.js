// Initialisation de la carte du sentier pédagogique
document.addEventListener('DOMContentLoaded', function() {
    // Fonction d'initialisation de la carte qui peut être appelée sur n'importe quelle page
    function initMap(mapElementId, currentArretId = null) {
        // Vérifier si l'élément de carte existe
        const mapElement = document.getElementById(mapElementId);
        if (!mapElement) return;

        console.log('Initialisation de la carte...', currentArretId ? `Arrêt actuel: ${currentArretId}` : 'Page d\'accueil');

        // Extraire le numéro d'arrêt à partir de l'URL si non fourni
        if (!currentArretId && window.location.pathname.includes('/arrets/arret')) {
            const match = window.location.pathname.match(/\/arrets\/arret(\d+)\.html/);
            if (match && match[1]) {
                currentArretId = match[1];
                console.log(`Numéro d'arrêt extrait de l'URL: ${currentArretId}`);
            }
        }

        // Initialiser la carte avec une vue sur la Corrèze (France)
        const map = L.map(mapElementId).setView([45.6328, 2.0425], 16);

        // Définir les différents fonds de carte
        const osmLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
            maxZoom: 19
        });

        const satelliteLayer = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
            attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community',
            maxZoom: 19
        });

        // Ajouter le fond de carte OSM par défaut
        osmLayer.addTo(map);

        // Créer un contrôle de couches pour permettre à l'utilisateur de choisir le fond de carte
        const baseMaps = {
            "OpenStreetMap": osmLayer,
            "Satellite": satelliteLayer
        };

        // Créer des groupes de couches pour les sentiers et les arrêts
        const sentierLayer = L.layerGroup().addTo(map);
        const arretsLayer = L.layerGroup().addTo(map);

        // Ajouter le contrôle de couches à la carte
        L.control.layers(baseMaps, {
            "Sentier": sentierLayer,
            "Arrêts": arretsLayer
        }, {
            position: 'topright'
        }).addTo(map);

        // Ajouter un contrôle d'échelle
        L.control.scale({
            imperial: false,
            metric: true
        }).addTo(map);

        // Variable pour stocker les coordonnées de l'arrêt actuel
        let currentArretCoords = null;
        
        // Créer un marqueur par défaut pour l'arrêt actuel si aucune correspondance n'est trouvée dans le GeoJSON
        let defaultMarkerAdded = false;

        // Fonction pour charger les données GeoJSON
        function loadGeoJSON() {
            console.log('Chargement des données GeoJSON...');
            
            // Déterminer le chemin relatif pour les fichiers GeoJSON
            const isArretPage = window.location.href.includes('/arrets/');
            const basePath = isArretPage ? '../' : './';
            
            // Charger les données du sentier
            fetch(`${basePath}couches_webmapping/sentiers.geojson`)
                .then(response => {
                    console.log('Réponse du serveur pour sentiers.geojson:', response.status);
                    if (!response.ok) {
                        throw new Error(`Impossible de charger le fichier sentiers.geojson (${response.status})`);
                    }
                    return response.json();
                })
                .then(data => {
                    console.log('Données du sentier chargées:', data);
                    
                    // Ajouter le sentier à la carte avec un style en pointillés bleus
                    L.geoJSON(data, {
                        style: {
                            color: '#0066cc',
                            weight: 3,
                            opacity: 0.8,
                            dashArray: '5, 10',
                            lineCap: 'round'
                        }
                    }).addTo(sentierLayer);
                    
                    // Charger les données des arrêts
                    return fetch(`${basePath}couches_webmapping/arrets.geojson`);
                })
                .then(response => {
                    console.log('Réponse du serveur pour arrets.geojson:', response.status);
                    if (!response.ok) {
                        throw new Error(`Impossible de charger le fichier arrets.geojson (${response.status})`);
                    }
                    return response.json();
                })
                .then(data => {
                    console.log('Données des arrêts chargées:', data);
                    
                    // Ajouter les arrêts à la carte avec des marqueurs noirs
                    const arretGeoJSON = L.geoJSON(data, {
                        pointToLayer: function(feature, latlng) {
                            const arretId = feature.properties.id;
                            const arretsAssocies = feature.properties.arrets ? feature.properties.arrets.split(',').map(a => a.trim()) : [arretId.toString()];
                            
                            // Vérifier si l'arrêt actuel est associé à ce point
                            const isCurrentArretAssociated = currentArretId && arretsAssocies.includes(currentArretId.toString());
                            
                            // Si ce point est associé à l'arrêt actuel, le marquer en rouge
                            if (isCurrentArretAssociated) {
                                console.log(`Point ${arretId} marqué en rouge car associé à l'arrêt ${currentArretId}`);
                                currentArretCoords = latlng;
                                defaultMarkerAdded = true;
                                return L.circleMarker(latlng, {
                                    radius: 10,
                                    fillColor: '#ff0000',
                                    color: '#fff',
                                    weight: 2,
                                    opacity: 1,
                                    fillOpacity: 0.8
                                });
                            } else {
                                return L.circleMarker(latlng, {
                                    radius: 8,
                                    fillColor: '#000',
                                    color: '#fff',
                                    weight: 2,
                                    opacity: 1,
                                    fillOpacity: 0.8
                                });
                            }
                        },
                        onEachFeature: function(feature, layer) {
                            // Créer le contenu du popup pour chaque arrêt
                            const arretId = feature.properties.id;
                            const arretName = feature.properties.Arrêts || `Arrêt ${arretId}`;
                            const arretsAssocies = feature.properties.arrets ? feature.properties.arrets.split(',').map(a => a.trim()) : [arretId.toString()];
                            
                            console.log(`Point ${arretId} - Arrêts associés:`, arretsAssocies, `Arrêt actuel: ${currentArretId}`);
                            
                            // Vérifier si l'arrêt actuel est associé à ce point
                            const isCurrentArretAssociated = currentArretId && arretsAssocies.includes(currentArretId.toString());
                            
                            let popupContent = `
                                <div class="arret-popup">
                                    <h3>Point ${arretId}</h3>
                                    <p>${arretName}</p>
                            `;
                            
                            popupContent += `<div class="arrets-associes">`;
                            
                            // Ajouter des liens vers chaque arrêt associé
                            arretsAssocies.forEach(arretNum => {
                                const isCurrentArret = arretNum.toString() === currentArretId?.toString();
                                
                                popupContent += `<div class="arret-item ${isCurrentArret ? 'current-arret' : ''}">`;
                                popupContent += `<h4>Arrêt ${arretNum}</h4>`;
                                
                                if (isCurrentArret) {
                                    popupContent += `<p class="current-location"><strong>Vous êtes ici</strong></p>`;
                                } else {
                                    popupContent += `<a href="${basePath}arrets/arret${arretNum}.html" class="arret-link">Découvrir cet arrêt</a>`;
                                }
                                
                                popupContent += `</div>`;
                            });
                            
                            popupContent += `</div>`;
                            popupContent += `</div>`;
                            
                            // Ajouter des styles CSS pour les popups
                            const popupStyle = `
                                <style>
                                    .arret-popup {
                                        padding: 5px;
                                        max-width: 250px;
                                    }
                                    .arret-popup h3 {
                                        margin: 0 0 8px 0;
                                        color: #2e7d32;
                                        font-size: 16px;
                                    }
                                    .arret-popup h4 {
                                        margin: 8px 0 4px 0;
                                        color: #2e7d32;
                                        font-size: 14px;
                                    }
                                    .arret-popup p {
                                        margin: 5px 0;
                                    }
                                    .arrets-associes {
                                        margin-top: 10px;
                                        border-top: 1px solid #eee;
                                        padding-top: 8px;
                                    }
                                    .arret-item {
                                        margin-bottom: 8px;
                                        padding: 5px;
                                        background-color: #f9f9f9;
                                        border-radius: 4px;
                                    }
                                    .current-arret {
                                        background-color: #e8f5e9;
                                        border-left: 3px solid #2e7d32;
                                    }
                                    .current-location {
                                        color: #d32f2f;
                                    }
                                    .arret-link {
                                        display: inline-block;
                                        margin-top: 5px;
                                        color: #1976d2;
                                        text-decoration: none;
                                    }
                                    .arret-link:hover {
                                        text-decoration: underline;
                                    }
                                </style>
                            `;
                            
                            // Ajouter le popup au marqueur avec les styles CSS
                            layer.bindPopup(popupContent + popupStyle);
                            
                            // Si c'est l'arrêt actuel, ouvrir automatiquement le popup
                            if (isCurrentArretAssociated) {
                                setTimeout(() => {
                                    layer.openPopup();
                                }, 500);
                            }
                        }
                    }).addTo(arretsLayer);
                    
                    // Si nous sommes sur une page d'arrêt mais que l'arrêt n'a pas été trouvé dans le GeoJSON,
                    // créer un marqueur par défaut près du centre de la carte
                    if (currentArretId && !defaultMarkerAdded) {
                        console.log(`L'arrêt ${currentArretId} n'a pas été trouvé dans le GeoJSON, création d'un marqueur par défaut`);
                        
                        // Calculer une position approximative pour l'arrêt manquant
                        // On utilise le centre de la carte avec un léger décalage basé sur l'ID de l'arrêt
                        const center = map.getCenter();
                        const offset = 0.0005 * currentArretId;
                        const latlng = L.latLng(center.lat + offset, center.lng + offset);
                        
                        // Créer un marqueur rouge pour l'arrêt actuel
                        const marker = L.circleMarker(latlng, {
                            radius: 10,
                            fillColor: '#ff0000',
                            color: '#fff',
                            weight: 2,
                            opacity: 1,
                            fillOpacity: 0.8
                        }).addTo(arretsLayer);
                        
                        // Ajouter un popup au marqueur
                        const popupContent = `
                            <div class="arret-popup">
                                <h3>Arrêt ${currentArretId}</h3>
                                <p>Vous êtes ici</p>
                            </div>
                        `;
                        marker.bindPopup(popupContent).openPopup();
                        
                        currentArretCoords = latlng;
                    }
                    
                    // Si nous sommes sur une page d'arrêt, centrer la carte sur l'arrêt actuel
                    if (currentArretCoords) {
                        map.setView(currentArretCoords, 16);
                    } else {
                        // Sinon, ajuster la vue pour montrer tout le sentier
                        try {
                            const bounds = sentierLayer.getBounds();
                            if (bounds && bounds.isValid()) {
                                map.fitBounds(bounds, { padding: [30, 30] });
                            }
                        } catch (e) {
                            console.error('Erreur lors de l\'ajustement de la vue:', e);
                            map.setView([45.6328, 2.0425], 16);
                        }
                    }
                })
                .catch(error => {
                    console.error('Erreur lors du chargement des données GeoJSON:', error);
                    mapElement.innerHTML = '<p class="error-message">Impossible de charger la carte. Veuillez réessayer plus tard.</p>';
                });
        }

        // Charger les données GeoJSON
        loadGeoJSON();
        
        return map;
    }

    // Initialiser la carte sur la page d'accueil
    if (document.getElementById('sentier-map')) {
        initMap('sentier-map');
    }
    
    // Initialiser la carte sur les pages d'arrêt
    if (document.getElementById('arret-map')) {
        // Récupérer l'ID de l'arrêt à partir de l'URL
        const urlPath = window.location.pathname;
        const arretMatch = urlPath.match(/arret(\d+)\.html$/);
        const arretId = arretMatch ? arretMatch[1] : null;
        
        if (arretId) {
            initMap('arret-map', arretId);
        } else {
            initMap('arret-map');
        }
    }
});