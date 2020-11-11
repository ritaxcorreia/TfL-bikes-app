/* global google:ignore */

// 1. Get user’s location.

if (navigator.geolocation) {
	// const success = (data) => console.log(data);
	// const error = (err) => console.log(err);
	// const options = { timeout: 5000 };

	// handles the success case and the error case, and if it timesout
	navigator.geolocation.getCurrentPosition(createMap, logError);
} else {
	// handle UI if navigator.geolocation is not available
}

//logs Error
function logError(err) {
	console.log("Error occurred fetching location", err);
}

// 2. Render a Google map.
// 3. Center Google Maps on user’s location
let map;
let marker;

function createMap(position) {
	const { latitude, longitude } = position.coords;
	map = new google.maps.Map(document.getElementById("map"), {
		center: { lat: latitude, lng: longitude },
		zoom: 14,
	});

	getBikeData();
}

// 4. Create request to TFL for bike information.
function getBikeData() {
	fetch("https://api.tfl.gov.uk/bikepoint")
		.then((response) => response.json())
		.then(addBikeMarkers);
}

// 5. Parse API response and add locations to map.
function addBikeMarkers(bikepoints) {
	bikepoints.forEach((bikepoint) => {
		const bikeLocation = { lat: bikepoint.lat, lng: bikepoint.lon };
		marker = new google.maps.Marker({
			position: bikeLocation,
			map: map,
			icon: iconBase,
		});

		createBikeInfo(bikepoint, marker);
	});
}

// 6. Create an information window for when a user selects a bike point

function createBikeInfo(bikepoint, marker) {
	console.log(bikepoint);
	const numberOfBikesAvailable = bikepoint.additionalProperties.find(
		(obj) => {
			return obj.key === "NbBikes";
		}
	).value;
	console.log("number of Bikes", numberOfBikesAvailable);

	const numberOfSpacesAvailable = bikepoint.additionalProperties.find(
		(obj) => {
			return obj.key === "NbEmptyDocks";
		}
	).value;

	const numberOfDocks = bikepoint.additionalProperties.find((obj) => {
		return obj.key === "NbDocks";
	}).value;

	const bikeInfo = {
		numberOfBikesAvailable,
		numberOfSpacesAvailable,
		numberOfDocks,
	};

	console.log("marker is", marker);
	// This will add the bike info to each marker, when the user clicks on it
	marker.addListener("click", () => {
		createInfoWindowForMarker(marker, bikepoint, bikeInfo);
	});
}

let infoWindow;

function createInfoWindowForMarker(marker, bikepoint, bikeInfo) {
	if (infoWindow) {
		infoWindow.close();
	}

	let bikeAvailabilityPercentage = Math.round(
		(bikeInfo.numberOfBikesAvailable / bikeInfo.numberOfDocks) * 100
	);

	infoWindow = new google.maps.InfoWindow({
		content: `
        <div> 
        <img class="bike" src="./images/bike.jpg">
        <h3>${bikepoint.commonName}</h3>
          <p>Number of available bikes: ${bikeInfo.numberOfBikesAvailable}</p>
          <p>Number of available spaces: ${bikeInfo.numberOfSpacesAvailable}</p>
          <p>Number of docks: ${bikeInfo.numberOfDocks}</p>
          <p>Bike availabilty: ${bikeAvailabilityPercentage}%</p>
        </div>
        `,
	});

	infoWindow.open(map, marker);
	map.setCenter(marker.getPosition());
}

const iconBase = {
	url: "./images/bike_icon.png",
	scaledSize: new google.maps.Size(40, 45), // scaled size
	origin: new google.maps.Point(0, 0), // origin
	anchor: new google.maps.Point(0, 0),
};
