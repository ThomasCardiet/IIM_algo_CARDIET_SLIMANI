const ICONS = {
  star: `
    <svg
      width="16"
      height="17"
      viewBox="0 0 16 17"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M8.00006 13.3001L4.30006 16.1251C4.11673 16.2751 3.91673 16.3458 3.70006 16.3371C3.4834 16.3291 3.29173 16.2668 3.12506 16.1501C2.9584 16.0334 2.8294 15.8751 2.73806 15.6751C2.64606 15.4751 2.64173 15.2584 2.72506 15.0251L4.15006 10.4001L0.525063 7.8251C0.325063 7.69176 0.200063 7.51676 0.150063 7.3001C0.100063 7.08343 0.108396 6.88343 0.175063 6.7001C0.24173 6.51676 0.358396 6.3541 0.525063 6.2121C0.691729 6.07076 0.891729 6.0001 1.12506 6.0001H5.60006L7.05006 1.2001C7.1334 0.966764 7.26273 0.787431 7.43806 0.662098C7.61273 0.537431 7.80006 0.475098 8.00006 0.475098C8.20006 0.475098 8.3874 0.537431 8.56206 0.662098C8.7374 0.787431 8.86673 0.966764 8.95006 1.2001L10.4001 6.0001H14.8751C15.1084 6.0001 15.3084 6.07076 15.4751 6.2121C15.6417 6.3541 15.7584 6.51676 15.8251 6.7001C15.8917 6.88343 15.9001 7.08343 15.8501 7.3001C15.8001 7.51676 15.6751 7.69176 15.4751 7.8251L11.8501 10.4001L13.2751 15.0251C13.3584 15.2584 13.3544 15.4751 13.2631 15.6751C13.1711 15.8751 13.0417 16.0334 12.8751 16.1501C12.7084 16.2668 12.5167 16.3291 12.3001 16.3371C12.0834 16.3458 11.8834 16.2751 11.7001 16.1251L8.00006 13.3001Z"
        fill="black"
      />
    </svg>`,
};

// PRINT ROOMS
const roomsListHtml = document.querySelector('#rooms__list');
function printRooms() {
  roomsListHtml.innerHTML = '';
  Object.values(rooms).forEach((room, index) => {
    roomsListHtml.innerHTML += `<li class="rooms__list__item" data-room="${index}"">
      ROOM ${index} - ${room.users.length} personne(s)
    </li>`;
  });
}

// TOGGLE ROOMS POPUP
const roomsHtml = document.querySelector('#rooms');
function toggleRoomPopup(toggle) {
  roomsHtml.style.display = toggle ? 'block' : 'none';
}

printRooms();

// PRINT ROOM NAME
const roomNameHtml = document.querySelector('#room__name');
function printRoomName() {
  roomNameHtml.innerHTML = `ROOM ${currentRoomId}`;
}

// PRINT RESTAURANTS LIST
const restaurantListHtml = document.querySelector('.restaurants__list');
function printRestaurants() {
  restaurantListHtml.innerHTML = '';
  restaurants.forEach((restaurant, index) => {
    restaurantListHtml.innerHTML += `<li class="restaurants__list__item" data-restaurant="${index}">
      <div class="restaurants__list__item__image">
        <img
          src="${restaurant.img}"
          alt=""
        />
      </div>

      <div class="restaurants__list__item__content">
        <div class="restaurants__list__item__name">
          <h3>${restaurant.name}</h3>
        </div>
        <div class="restaurants__list__item__address">Address 1</div>
        <div class="restaurants__list__item__phone">Phone 1</div>
        <div class="restaurants__list__item__website">Website 1</div>
      </div>
    </li>`;
  });
}

printRestaurants();

// PRINT USERS LIST
const usersListHtml = document.querySelector('.users__list');
function printUsers() {
  usersListHtml.innerHTML = '';
  users.list.forEach((user, index) => {
    const isOwner = ownerId === user.id;
    const isSelectedUser = selectedUserIndex === user.id;
    usersListHtml.innerHTML += `<li class="users__list__item ${
      isOwner ? 'owner' : ''
    }  ${isSelectedUser ? 'selected' : ''}"
    
    data-id="${user.id}"
    onClick="printMapInformations(getInformationsToLunch(${index}), ${index});">
      ${isOwner ? 'Vous: ' : ''} ${user.name}${ICONS.star}
    </li>
    
    `;
  });
}

printUsers();

// PRINT MAP INFOS AND LEGEND
const mapInformationsHtml = document.querySelector('#map__informations');
const mapUsersInfosHtml = document.querySelector('.map__user__infos');

function printMapBanner(data) {
  mapInformationsHtml.innerHTML = `miam -> ${getMiam().toLocaleDateString(
    'fr-fr',
    {
      day: 'numeric',
      year: 'numeric',
      month: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
    }
  )} : ${data.name} doit partir -> ${data.timeOut.toLocaleDateString('fr-fr', {
    day: 'numeric',
    year: 'numeric',
    month: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
  })}`;
}

function printMapUserInfos(user) {
  mapUsersInfosHtml.innerHTML = `
  <p class="map__user__name">Nom: ${user.name}</p>
  <p class="map__user__restaurant">Restaurant: ${
    restaurants[user.restaurant].name
  }</p>
  <p class="map__user__remain">Restant: ${Math.round(
    getInformationsToLunch(user.id).time * 100
  )} min</p>`;
}

function printMapInformations(data, index = -1) {
  if (index !== -1) {
    selectedUserIndex = index;
    const usersListHtml = document.querySelector('.users__list');

    Object.values(usersListHtml.children).forEach((item) => {
      const userId = parseInt(item.dataset.id);

      console.log(item);
      userId === selectedUserIndex
        ? item.classList.add('selected')
        : item.classList.remove('selected');
    });
  }

  const user = getUser(selectedUserIndex);

  printMapBanner(data);
  printMapUserInfos(user);
}

// INIT LOGIN POPUP SELECT
const loginSelectRestaurant = document.querySelector('#login__restaurant');
function initLoginPopup() {
  restaurants.forEach((restaurant, index) => {
    loginSelectRestaurant.innerHTML += `<option value="${index}">${restaurant.name}</option>`;
  });
}

initLoginPopup();

// TOGGLE MAP FULLSCREEN MARKER SELECTOR
const mapHtml = document.querySelector('#map');
function toggleMapFullScreen(toggle = true) {
  arrival.marker.dragging._draggable._enabled = !toggle;
  chooseMapPosition = toggle;
  map.invalidateSize();
  mapHtml.classList.toggle('fullscreen', toggle);
}

// TOGGLE LOGIN POPUP
const loginPopupHtml = document.querySelector('#login');
const overlayHtml = document.querySelector('.overlay');
function toggleLoginPopup(toggle) {
  loginPopupHtml.style.display = toggle ? 'block' : 'none';
  overlayHtml.style.display = toggle ? 'block' : 'none';
}

// ADD MESSAGE TO CHAT
const messageBoxHtml = document.querySelector('#messages__box');
function addMessage(message) {
  messageBoxHtml.innerHTML += `<li>${message}</li>`;
}

// PRINT ERROR
const errorHtml = document.querySelector('.map__error');
function printError(message, delay = 3000) {
  errorHtml.innerHTML = message;
  function toggleErrorBlock(toggle) {
    errorHtml.style.opacity = toggle ? 1 : 0;
  }
  toggleErrorBlock(true);
  setTimeout(() => {
    toggleErrorBlock(false);
  }, delay);
}
