// Initialisation de la carte du sentier pédagogique
document.addEventListener('DOMContentLoaded', function() {
    // Vérifier si l'élément de carte existe
    const mapElement = document.getElementById('sentier-map');
    if (!mapElement) return;

    console.log('Initialisation de la carte...');

    // Initialiser la carte avec une vue sur la Corrèze (France)
    const map = L.map('sentier-map').setView([45.3, 1.8], 10);

    // Ajouter un fond de carte OpenStreetMap
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19
    }).addTo(map);

    // Fonction pour charger les données GeoJSON
    function loadGeoJSON() {
        console.log('Chargement des données GeoJSON...');
        
        // Charger les données du sentier (déjà en WGS84)
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
                
                // Ajouter le sentier à la carte avec un style en pointillés bleus
                const sentierLayer = L.geoJSON(data, {
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
                    })
                    .then(data => {
                        return { sentierLayer, arretsData: data };
                    });
            })
            .then(({ sentierLayer, arretsData }) => {
                console.log('Données des arrêts chargées:', arretsData);
                
                // Ajouter les arrêts à la carte avec des marqueurs noirs
                const arretsLayer = L.geoJSON(arretsData, {
                    onEachFeature: function(feature, layer) {
                        const coordsArray = feature.geometry.coordinates;
                        
                        // Si c'est un MultiPoint, on crée plusieurs marqueurs
                        if (feature.geometry.type === "MultiPoint") {
                            coordsArray.forEach(coords => {
                                const marker = L.circleMarker([coords[1], coords[0]], {
                                    radius: 8,
                                    fillColor: '#000',
                                    color: '#fff',
                                    weight: 2,
                                    opacity: 1,
                                    fillOpacity: 0.8
                                }).bindPopup(/* contenu ici */);
                
                                marker.addTo(map);
 
                // Créer un groupe de couches pour ajuster la vue
                const allLayers = L.featureGroup([sentierLayer, arretsLayer]);
                
                // Ajuster la vue de la carte pour montrer tous les éléments
                map.fitBounds(allLayers.getBounds(), { padding: [30, 30] });
            })
            .catch(error => {
                console.error('Erreur lors du chargement des données GeoJSON:', error);
                mapElement.innerHTML = '<p class="error-message">Impossible de charger la carte. Veuillez réessayer plus tard.</p>';
            });
    }

    // Charger les données GeoJSON
    loadGeoJSON();
});