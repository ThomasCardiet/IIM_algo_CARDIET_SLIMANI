const lat = 48.89347;
const lon = 2.232;
let map = null;

let selectedUserIndex = -1;
let ownerId = -1;

let rooms = [];
let currentRoomId = -1;

let chooseMapPosition = false;

let leftTimeInterval = null;

const lineColors = ['red', 'blue', 'black', 'green', 'yellow', 'orange'];

const loginCoordsHtml = document.querySelector('#login__coords');

const restaurants = [
  {
    lat: 48.89676,
    lng: 2.229,
    marker: null,
    name: 'KFC',
    img: 'https://media-cdn.tripadvisor.com/media/photo-s/05/cf/59/60/kfc-jaux.jpg',
  },
  {
    lat: 48.8979,
    lng: 2.2252,
    marker: null,
    name: 'MCDonald',
    img: 'https://media.mcdonalds.fr/media/d5/28/8d/d5288d1b71c580c24bd5da511c2656251640d1ec?auto=webp',
  },
  {
    lat: 48.89433,
    lng: 2.2243,
    marker: null,
    name: 'BurgerKing',
    img: 'https://static.observatoiredelafranchise.fr/images/ckfinder/images/2020/07/17/burger-king-ext-live-7bc2e3.png',
  },
];

const users = {
  speed: 5,
  icon: {
    iconUrl: 'img/user.png',
    iconSize: [40, 50],
    iconAnchor: [25, 50],
    popupAnchor: [-3, -76],
  },
  iconOwner: {
    iconUrl: 'img/owner.png',
    iconSize: [50, 60],
    iconAnchor: [25, 50],
    popupAnchor: [-3, -76],
  },
  list: [],
};

let arrival = {
  lat: 48.89351,
  lng: 2.22698,
  marker: null,
  name: "Point d'arrivée",
  iconOptions: {
    draggable: true,
    icon: {
      iconUrl: 'img/red.png',
      iconSize: [40, 50],
      iconAnchor: [25, 50],
      popupAnchor: [-3, -76],
      draggable: true,
    },
  },
};

// GET ROOM MIAM HOUR
function getMiam() {
  return new Date(rooms[currentRoomId].miam);
}

// ADD USER
function addUser(user, owner = false) {
  const newUser = {
    id: user.id,
    name: user.name,
    restaurant: user.restaurant,
    position: user.position,
    marker: createMarker({
      position: user.position,
      iconOptions: { icon: L.icon(owner ? users.iconOwner : users.icon) },
      name: user.name,
    }),
    lines: [],
    lineColor: lineColors[Math.floor(Math.random() * lineColors.length)],
  };

  users.list.push(newUser);

  if (owner) {
    const userIndex = users.list.length - 1;
    printMapInformations(getInformationsToLunch(userIndex), userIndex);
    ownerId = userIndex;
  }

  printUsers();
  updateTrajectLines(newUser);

  addMessage(
    `${user.id === ownerId ? `Vous avez` : `${user.name} a`} rejoint la salle`
  );
}

//GET USER
function getUser(id) {
  return users.list.find((user) => user.id === id);
}

// ADD USERS
function addUsers(users) {
  users.forEach((user) => {
    addUser(user);
  });

  printUsers();
}

// REMOVE USER
function removeUser(id) {
  const user = users.list.find((user) => user.id === id);
  if (user) {
    removeUserLines(user);
    map.removeLayer(user.marker);
  }
  users.list = users.list.filter((user) => user.id !== id);
  printUsers();
  addMessage(`${user.name} a quitté la salle`);
}

// UPDATE USER MARKER POSITION
function updateUserPosition(id, position) {
  const user = users.list.find((user) => user.id === id);
  const marker = user.marker;
  marker.setLatLng([position.lat, position.lng]);
  user.position = marker._latlng;
  updateTrajectLines(user);
  printMapInformations(getInformationsToLunch(selectedUserIndex));
}

// UPDATE TRAJECT OF ALL USERS
function updateUsersTraject() {
  users.list.forEach((user) => {
    getTrajectDistance(user);
  });
}

// ADD MARKER
function createMarker(data) {
  const marker = L.marker(
    [data.position.lat, data.position.lng],
    data.iconOptions
  ).addTo(map);

  marker.bindPopup(data.name);

  return marker;
}

// GET DISTANCE (en Km)
function getDistance(A, B) {
  const R = 6371e3;
  const φ1 = (A.lat * Math.PI) / 180;
  const φ2 = (B.lat * Math.PI) / 180;
  const Δφ = ((B.lat - A.lat) * Math.PI) / 180;
  const Δλ = ((B.lng - A.lng) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return (R * c) / 1000;
}

// REMOVE USER LINES
function removeUserLines(user) {
  user.lines.forEach((line) => {
    line.remove();
  });
}

// DRAW OR REDRAW LINES OF USER'S TRAJECT
function updateTrajectLines(user) {
  const restaurant = restaurants[user.restaurant];

  removeUserLines(user);

  user.lines = [];

  user.lines.push(
    L.polyline([user.position, restaurant], {
      color: user.lineColor,
    }).addTo(map)
  );

  user.lines.push(
    L.polyline([restaurant, arrival], { color: user.lineColor }).addTo(map)
  );
}

// GET ALL TRAJECT DISTANCE
function getTrajectDistance(user) {
  updateTrajectLines(user);

  const restaurant = restaurants[user.restaurant];
  return (
    getDistance(user.position, restaurant) + getDistance(restaurant, arrival)
  );
}

// GET ALL TRAJECT TIME
function getTrajectTime(user) {
  return getTrajectDistance(user) / users.speed;
}

// UPDATE ARRIVAL MARKER
function updateArrival(position, force = false) {
  arrival.lat = position.lat;
  arrival.lng = position.lng;
  if (force) {
    arrival.marker.setLatLng([arrival.lat, arrival.lng]);
  }

  updateUsersTraject();
  if (selectedUserIndex !== -1)
    printMapInformations(getInformationsToLunch()[selectedUserIndex]);
}

// GET ALL TIMEOUT
function getInformationsToLunch(id = -1) {
  function getInformations(user) {
    return {
      name: user.name,
      distance: getTrajectDistance(user),
      time: getTrajectTime(user),
      timeOut: new Date(
        getMiam().getTime() - 1000 * (60 * (getTrajectTime(user) * 100))
      ),
    };
  }

  return id !== -1
    ? getInformations(users.list.find((user) => user.id === id))
    : users.list.map((user) => getInformations(user));
}

// INIT MAP
function initMap() {
  if (map) map.remove();
  map = L.map('map').setView([lat, lon], 15);

  L.tileLayer('https://{s}.tile.openstreetmap.fr/osmfr/{z}/{x}/{y}.png', {
    minZoom: 1,
    maxZoom: 20,
  }).addTo(map);

  Object.values(restaurants).forEach((restaurant) => {
    restaurant.marker = createMarker({
      position: {
        lat: restaurant.lat,
        lng: restaurant.lng,
      },
      name: restaurant.name,
    });
  });

  users.list.forEach((user) => {
    user.marker = createMarker({
      position: user.position,
      iconOptions: { icon: L.icon(users.icon) },
      name: user.name,
    });
  });

  arrival.marker = createMarker({
    position: {
      lat: arrival.lat,
      lng: arrival.lng,
    },
    iconOptions: {
      ...arrival.iconOptions,
      icon: L.icon(arrival.iconOptions.icon),
    },
    name: arrival.name,
  });
}

// START LEFT TIME INTERVAL
function startLeftTimeInterval(time = 60, socket = null) {
  if (leftTimeInterval) clearInterval(leftTimeInterval);

  return setInterval(() => {
    // UPDATE OWNER LOCATION
    map
      .locate({
        enableHighAccuracy: true,
      })
      .on('locationfound', (e) => {
        updateUserPosition(ownerId, e.latlng);
        if (socket) socket.emit('newUserPosition', ownerId, e.latlng);
      });

    // UPDATE INFORMATIONS SELECTED USER POPUP
    printMapInformationsget(InformationsToLunch(ownerId));
  }, time * 1000);
}
