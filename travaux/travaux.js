// variables globales
let map;
let markers = [];
let json;
const worksIcon = L.icon({

    iconUrl: "img/travaux-routiers.png",
    iconSize: [40.80],//taille icone 
    iconAnchor: [22.94],//point of the icon which will correspond to marker's location

});

document.addEventListener('DOMContentLoaded', function () {
    // bouton date
    document.getElementById('start').addEventListener('input', function () {

        for (let i = 0; i < markers.length; i++) {
            map.removeLayer(markers[i]);
        }

        loadDatas(new Date(document.getElementById("start").value));
    });

    map = L.map('map').setView([48.692054, 6.184417], 13);
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    }).addTo(map);

    loadDatas(new Date());

});


// récup du Json
function loadDatas(dateSelect) {
    fetch('https://carto.g-ny.org/data/cifs/cifs_waze_v2.json')
        .then(function (response) {
            return response.json();
        })
        .then(function (data) {
            json = data;

            for (let i = 0; i < json.incidents.length; i++) {
                let allinfo = json.incidents[i];


                //coordonnées
                let allcoord = json.incidents[i].location.polyline;
                let long = allcoord.split(' ');



                //format date francaise
                //date debut travaux

                let startTime = json.incidents[i].starttime;

                let dateStartFr = new Date(startTime);
                let dayStart = dateStartFr.getDate();
                let monthStart = dateStartFr.getMonth() + 1;
                let yearStart = dateStartFr.getFullYear();
                let dateDebutFrancaise = `${dayStart}/${monthStart}/${yearStart}`;

                //date fin travaux  

                let endTime = json.incidents[i].endtime;

                let dateEndFr = new Date(endTime);
                let day = dateEndFr.getDate();
                let month = dateEndFr.getMonth() + 1;
                let year = dateEndFr.getFullYear();
                let dateFinFrancaise = `${day}/${month}/${year}`;



                //debut de si //Condition pour afficher travaux en cours a la date d'aujourd'hui

                if (dateSelect >= dateStartFr && dateSelect <= dateEndFr) {

                    //marqueur travaux

                    //marqueur personnalisé
                    

                    let marker = L.marker([long[0], long[1]], { icon: worksIcon }).addTo(map);

                    //popup description

                    let popupContent = '<p> Type : ' + allinfo.short_description + '<p>' +
                        '<p> Lieu : ' + allinfo.location.location_description + '<p>' +
                        '<p> Date de début : ' + dateDebutFrancaise + '<p>' +
                        '<p> Date de fin : ' + dateFinFrancaise + '<p>'

                    let popup = L.popup()
                        .setLatLng([long[0], long[1]])
                        .setContent(popupContent);

                    marker.bindPopup(popup);
                    markers.push(marker);

                } //fin de if

            }

                // sélection des éléments par leurs id
                const selectShortDescription = document.getElementById('shortDescriptionFilter');
                const selectRue = document.getElementById('rueFilter');
                const selectDescription = document.getElementById('descriptionFilter');

                const shortDescriptionOptions = new Set();
                const rueOptions = new Set();
                const descriptionOptions = new Set();

                // pour associer les éléments du json aux id
                json.incidents.forEach(element => {
                    shortDescriptionOptions.add(element.short_description);
                    rueOptions.add(element.location.location_description);
                    descriptionOptions.add(element.description);
                });


                // tri par ordre alpha
                const sortedShortDescriptionOptions = [...shortDescriptionOptions].sort();
                const sortedRueOptions = [...rueOptions].sort();
                const sortedDescriptionOptions = [...descriptionOptions].sort();

                // créa des options pour le menu déroulant
                sortedShortDescriptionOptions.forEach(option => {
                    const optionElement = document.createElement('option');
                    optionElement.value = option;
                    optionElement.textContent = option;
                    selectShortDescription.appendChild(optionElement);
                });

                sortedRueOptions.forEach(rue => {
                    const rueOption = document.createElement('option');
                    rueOption.value = rue;
                    rueOption.textContent = rue;
                    selectRue.appendChild(rueOption);
                });

                sortedDescriptionOptions.forEach(description => {
                    const descriptionOption = document.createElement('option');
                    descriptionOption.value = description;
                    // Utilisez la méthode split pour diviser la chaîne en fonction de "Voirie:"
                    const splitDescription = description.split('Voirie:');
                    // Assurez-vous que la chaîne a été correctement divisée en deux parties
                    if (splitDescription.length === 2) {
                        // Utilisez la deuxième partie (index 1) comme contenu de l'option
                        descriptionOption.textContent = splitDescription[1].trim(); // trim() pour enlever les espaces inutiles
                    } else {
                        // Si la chaîne n'a pas été correctement divisée, utilisez la chaîne d'origine
                        descriptionOption.textContent = description;
                    }
                    selectDescription.appendChild(descriptionOption);
                });

                // modif l'affichage des markers pour ne voir que ceux sélectionnés
                selectShortDescription.addEventListener('change', () => {
                    const selectedShortDescription = selectShortDescription.value;
                    filterMarkersByShortDescription(selectedShortDescription);
                });

                selectRue.addEventListener('change', () => {
                    const selectedRue = selectRue.value;
                    filterMarkersByRue(selectedRue);
                });

                selectDescription.addEventListener('change', () => {
                    const selectedDescription = selectDescription.value;
                    filterMarkersByDescription(selectedDescription);
                });
            });
};

// filtre en fonction de la short_description
function filterMarkersByShortDescription(selectedShortDescription) {
    // supprimer les markers non désirés
    markers.forEach(marker => map.removeLayer(marker));
    // pour filtrer les éléments json
    if (selectedShortDescription === "all") {
        // Afficher tous les marqueurs en cas de sélection "Tous les incidents"
        markers.forEach(marker => map.addLayer(marker));
    } else {
        const filteredElements = json.incidents.filter(item => item.short_description === selectedShortDescription);
        // rajoute les markers désirés
        filteredElements.forEach(element => {
            const long = element.location.polyline.split(' ');
            const marker = L.marker([parseFloat(long[0]), parseFloat(long[1])] ,{icon:worksIcon}).addTo(map);
            // créa de la popup des markers désirés
            const popupContent = `<p>Type: ${element.short_description}</p>` +
                `<p>Lieu: ${element.location.location_description}</p>` +
                `<p>Date de début: ${element.starttime.split('T')[0]}</p>` +
                `<p>Date de fin: ${element.endtime.split('T')[0]}</p>`;
            marker.bindPopup(popupContent);
            markers.push(marker);
        });
    }
}
// filtre en fonction de la rue
function filterMarkersByRue(selectedRue) {
    // supprimer les markers non désirés
    markers.forEach(marker => map.removeLayer(marker));
    if (selectedRue === "all") {
        // Afficher tous les marqueurs en cas de sélection "Tous les incidents"
        markers.forEach(marker => map.addLayer(marker));
    } else {
        // pour filtrer les éléments json
        const filteredElements = json.incidents.filter(item => item.location.location_description === selectedRue);
        // rajoute les markers désirés
        filteredElements.forEach(element => {
            const long = element.location.polyline.split(' ');
            const marker = L.marker([parseFloat(long[0]), parseFloat(long[1])],{icon:worksIcon}).addTo(map);
            // créa de la popup des markers désirés
            const popupContent = `<p>Type: ${element.short_description}</p>` +
                `<p>Lieu: ${element.location.location_description}</p>` +
                `<p>Date de début: ${element.starttime.split('T')[0]}</p>` +
                `<p>Date de fin: ${element.endtime.split('T')[0]}</p>`;
            marker.bindPopup(popupContent);
            markers.push(marker);
        });
    }
}

// filtre en fonction de la description
function filterMarkersByDescription(selectedDescription) {
    // supprimer les markers non désirés
    markers.forEach(marker => map.removeLayer(marker));
    if (selectedDescription === "all") {
        // Afficher tous les marqueurs en cas de sélection "Tous les incidents"
        markers.forEach(marker => map.addLayer(marker));
    } else {
        // pour filtrer les éléments json
        const filteredElements = json.incidents.filter(item => item.description.includes(selectedDescription));
        // rajoute les markers désirés  
        filteredElements.forEach(element => {
            const long = element.location.polyline.split(' ');
            const marker = L.marker([parseFloat(long[0]), parseFloat(long[1])],{icon:worksIcon}).addTo(map);
            // créa de la popup des markers désirés
            const popupContent = `<p>Type: ${element.short_description}</p>` +
                `<p>Lieu: ${element.location.location_description}</p>` +
                `<p>Date de début: ${element.starttime.split('T')[0]}</p>` +
                `<p>Date de fin: ${element.endtime.split('T')[0]}</p>`;
            marker.bindPopup(popupContent);
            markers.push(marker);
        });
    }
}
