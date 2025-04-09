// Ce fichier contiendra les fonctionnalités JavaScript pour le site du sentier pédagogique
document.addEventListener('DOMContentLoaded', function() {
    console.log('Site du sentier pédagogique chargé');
    
    // Charger le header commun
    loadHeader();
    
    // Charger le footer commun
    loadFooter();
    
    // Initialiser le popup d'image
    initImagePopup();
    
    // Fonction pour charger dynamiquement les arrêts (sera implémentée une fois que nous aurons les données)
    // Pour l'instant, nous utiliserons des données statiques dans les fichiers HTML
});

/**
 * Charge le header commun dans toutes les pages
 */
function loadHeader() {
    const headerElement = document.querySelector('header .container');
    
    if (headerElement) {
        // Déterminer si nous sommes sur la page d'accueil ou une page d'arrêt
        const isHomePage = window.location.pathname.indexOf('/arrets/') === -1;
        const basePath = isHomePage ? '' : '../';
        
        // Charger le contenu du header
        fetch(`${basePath}includes/header.html`)
            .then(response => response.text())
            .then(html => {
                headerElement.innerHTML = html;
                
                // Ajuster les chemins des images selon la page
                const pnrLogo = document.getElementById('pnr-logo');
                const cenLogo = document.getElementById('cen-logo');
                
                if (pnrLogo) {
                    pnrLogo.src = `${basePath}img/2 - Logo du PNR Millevaches.jpg`;
                }
                
                if (cenLogo) {
                    cenLogo.src = `${basePath}img/logos/logo_CEN_NA_2019.jpg`;
                }
            })
            .catch(error => {
                console.error('Erreur lors du chargement du header:', error);
                // En cas d'erreur, afficher un header de secours
                headerElement.innerHTML = `
                    <h1>Sentier Pédagogique</h1>
                    <p>Découvrez le Parc Naturel Régional de Millevaches en Limousin</p>
                `;
            });
    }
}

/**
 * Charge le footer commun dans toutes les pages
 */
function loadFooter() {
    const footerElement = document.querySelector('footer .container');
    
    if (footerElement) {
        // Déterminer si nous sommes sur la page d'accueil ou une page d'arrêt
        const isHomePage = window.location.pathname.indexOf('/arrets/') === -1;
        const basePath = isHomePage ? '' : '../';
        
        // Charger le contenu du footer
        fetch(`${basePath}includes/footer.html`)
            .then(response => response.text())
            .then(html => {
                // Remplacer les chemins relatifs si nécessaire
                if (isHomePage) {
                    // Sur la page d'accueil, le chemin doit être img/logos/...
                    html = html.replace('../img/logos/', 'img/logos/');
                }
                footerElement.innerHTML = html;
            })
            .catch(error => {
                console.error('Erreur lors du chargement du footer:', error);
                // En cas d'erreur, afficher un footer de secours
                footerElement.innerHTML = `
                    <p>&copy; 2025 Sentier pédagogique de Saint-Merd-les-Oussines. Tous droits réservés.</p>
                    <p>CEN Nouvelle-Aquitaine</p>
                `;
            });
    }
}

/**
 * Initialise le popup d'image pour les images zoomables
 */
function initImagePopup() {
    // Créer les éléments du popup s'ils n'existent pas déjà
    if (!document.querySelector('.image-popup-overlay')) {
        const popupOverlay = document.createElement('div');
        popupOverlay.className = 'image-popup-overlay';
        
        const popupContainer = document.createElement('div');
        popupContainer.className = 'image-popup-container';
        
        const popupImage = document.createElement('img');
        popupImage.className = 'popup-image';
        popupImage.alt = 'Image agrandie';
        
        const closeButton = document.createElement('button');
        closeButton.className = 'close-popup';
        closeButton.innerHTML = '&times;';
        closeButton.setAttribute('aria-label', 'Fermer');
        
        popupContainer.appendChild(popupImage);
        popupContainer.appendChild(closeButton);
        popupOverlay.appendChild(popupContainer);
        document.body.appendChild(popupOverlay);
        
        // Ajouter les événements pour fermer le popup
        closeButton.addEventListener('click', closeImagePopup);
        popupOverlay.addEventListener('click', function(e) {
            if (e.target === popupOverlay) {
                closeImagePopup();
            }
        });
        
        // Ajouter un événement pour fermer avec la touche Escape
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape') {
                closeImagePopup();
            }
        });
    }
    
    // Ajouter la classe zoomable-image et l'événement de clic uniquement à l'image des missions du CEN
    // Vérifier si nous sommes sur la page d'arrêt 5 ou sur la page d'accueil
    const cenMissionImages = document.querySelectorAll('img[src*="6 - Carte des 5 grandes missions du CEN.jpg"]');
    
    cenMissionImages.forEach(img => {
        img.classList.add('zoomable-image');
        img.addEventListener('click', function() {
            openImagePopup(this.src, this.alt);
        });
        
        // Ajouter également l'événement au hint de clic s'il existe
        const clickHint = img.parentElement.querySelector('.image-click-hint');
        if (clickHint) {
            clickHint.addEventListener('click', function() {
                openImagePopup(img.src, img.alt);
            });
        }
    });
}

/**
 * Ouvre le popup d'image avec l'image spécifiée
 */
function openImagePopup(src, alt) {
    const popupOverlay = document.querySelector('.image-popup-overlay');
    const popupImage = document.querySelector('.popup-image');
    
    if (popupOverlay && popupImage) {
        popupImage.src = src;
        popupImage.alt = alt || 'Image agrandie';
        
        // Afficher le popup
        popupOverlay.style.display = 'flex';
        document.body.style.overflow = 'hidden'; // Empêcher le défilement de la page
    }
}

/**
 * Ferme le popup d'image
 */
function closeImagePopup() {
    const popupOverlay = document.querySelector('.image-popup-overlay');
    
    if (popupOverlay) {
        popupOverlay.style.display = 'none';
        document.body.style.overflow = ''; // Réactiver le défilement de la page
    }
}


document.addEventListener('DOMContentLoaded', function() {
  // Fonction pour détecter si l'utilisateur est sur mobile
  function isMobileDevice() {
    return /Mobi|Android/i.test(navigator.userAgent);
  }

  // Afficher le popup si l'utilisateur est sur mobile
  if (isMobileDevice()) {
    const popup = document.getElementById('orientation-popup');
    if (popup) {
      popup.style.display = 'flex';
    }
  }
});

/**
 * Ferme le popup d'orientation
 */
function closeOrientationPopup() {
  const popup = document.getElementById('orientation-popup');
  if (popup) {
    popup.style.display = 'none';
  }
}
