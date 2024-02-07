// Tableau initial pour stocker les données JSON
let initialData;

// Fonction pour afficher les éléments en fonction des filtres
function displayData(data) {
    const dataContainer = document.getElementById('data-container');
    dataContainer.innerHTML = '';

    data.forEach(element => {
        const item = document.createElement('article');
        const startTime = new Date(element.starttime);
        const dayStart = startTime.getDate();
        const monthStart = startTime.getMonth() + 1;
        const yearStart = startTime.getFullYear();
        const dateDebutFrancaise = `${dayStart < 10 ? '0' : ''}${dayStart}-${monthStart < 10 ? '0' : ''}${monthStart}-${yearStart}`;

        // Conversion de la date de fin au format français
        const endTime = new Date(element.endtime);
        const dayEnd = endTime.getDate();
        const monthEnd = endTime.getMonth() + 1;
        const yearEnd = endTime.getFullYear();
        const dateFinFrancaise = `${dayEnd < 10 ? '0' : ''}${dayEnd}-${monthEnd < 10 ? '0' : ''}${monthEnd}-${yearEnd}`;

        item.innerHTML = `
            <p>Type: ${element.short_description}</p>
            <p>Description: ${element.description}</p>
            <p>Rue: ${element.location.location_description}</p>
            <p>Date de début : ${dateDebutFrancaise}</p>
            <p>Date de fin : ${dateFinFrancaise}</p>
            <br>
            <hr>
            <br>
        `;
        dataContainer.appendChild(item);
    });
}

// Filtrer les données en fonction des sélections
function filterData() {
    const selectedShortDescription = document.getElementById('shortDescriptionFilter').value;
    const selectedDescription = document.getElementById('descriptionFilter').value;
    const selectedRue = document.getElementById('rueFilter').value;
    const selectedDate = new Date(document.getElementById('start').value);

    const filteredData = initialData.filter(element => {
        const incidentStartDate = new Date(element.starttime);
        const incidentEndDate = new Date(element.endtime);
        return (
            (selectedShortDescription === 'all' || element.short_description === selectedShortDescription) &&
            (selectedDescription === 'all' || element.description === selectedDescription) &&
            (selectedRue === 'all' || element.location.location_description === selectedRue) &&
            (selectedDate >= incidentStartDate && selectedDate <= incidentEndDate)
        );
    });

    displayData(filteredData);
}

// Chargement du document
document.addEventListener('DOMContentLoaded', function () {
    // Récupération des données JSON avec fetch
    fetch('https://carto.g-ny.org/data/cifs/cifs_waze_v2.json')
        .then(function (response) {
            if (!response.ok) {
                throw new Error('Erreur de récupération des données JSON');
            }
            return response.json();
        })
        .then(function (data) {
            initialData = data.incidents;

            // Remplir les menus déroulants avec des options uniques
            const shortDescriptions = [...new Set(initialData.map(item => item.short_description))];
            const descriptions = [...new Set(initialData.map(item => item.description))];
            const rues = [...new Set(initialData.map(item => item.location.location_description))];

            const shortDescriptionFilter = document.getElementById('shortDescriptionFilter');
            const descriptionFilter = document.getElementById('descriptionFilter');
            const rueFilter = document.getElementById('rueFilter');

            // Créer les options par défaut "all"
            shortDescriptionFilter.innerHTML = '<option value="all">Tout afficher</option>';
            descriptionFilter.innerHTML = '<option value="all">Tout afficher</option>';
            rueFilter.innerHTML = '<option value="all">Tout afficher</option>';

            // Remplir les options avec les valeurs uniques
            shortDescriptions.forEach(value => {
                shortDescriptionFilter.innerHTML += `<option value="${value}">${value}</option>`;
            });

            descriptions.forEach(value => {
                descriptionFilter.innerHTML += `<option value="${value}">${value}</option>`;
            });

            rues.forEach(value => {
                rueFilter.innerHTML += `<option value="${value}">${value}</option>`;
            });

            // Gestion de l'événement de filtrage
            document.getElementById('start').addEventListener('change', filterData);

            // Afficher les données par défaut
            displayData(initialData);
        })
        .catch(function (error) {
            console.error(error);
        });
});
