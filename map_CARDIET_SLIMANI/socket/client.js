(function ($) {
  var socket = io.connect('http://localhost:3000');

  // ROOMS PART ----------------------------------------------------------------

  let intervalUpdateRooms = null;

  // SELECT ROOM
  function selectRoom(id) {
    toggleRoomPopup(false);
    socket.emit('selectRoom', id);
  }

  function createUpdateRoomsInterval() {
    if (intervalUpdateRooms) clearInterval(intervalUpdateRooms);
    socket.emit('getRooms');
    return setInterval(() => {
      socket.emit('getRooms');
    }, 2000);
  }

  intervalUpdateRooms = createUpdateRoomsInterval();

  socket.on('initRooms', (newRooms) => {
    rooms = newRooms;

    printRooms();

    const roomsChildren = document.querySelector('#rooms__list').children;
    Object.values(roomsChildren).forEach((li) => {
      li.addEventListener('click', (e) => {
        const roomId = parseInt(e.target.dataset.room);
        selectRoom(roomId);
      });
    });
  });

  const roomChangeHtml = document.querySelector('#room__change');
  roomChangeHtml.addEventListener('click', (e) => {
    if (ownerId !== -1 && currentRoomId !== -1)
      socket.emit('removeUser', ownerId, currentRoomId);
    if (leftTimeInterval) clearInterval(leftTimeInterval);
    e.preventDefault();
    socket.emit('getRooms');
    toggleRoomPopup(true);
    users.list = [];
    printUsers();
  });

  const roomAddHtml = document.querySelector('#rooms__add');
  roomAddHtml.addEventListener('click', (e) => {
    e.preventDefault();
    socket.emit('newRoom');
  });

  // MAP PART ------------------------------------------------------------------

  const chatCommands = {
    setMiam,
  };

  // INIT DATA
  function initData() {
    toggleLoginPopup(true);

    initMap();

    map
      .locate({
        setView: true,
        enableHighAccuracy: true,
      })
      .on('locationfound', (e) => {
        loginCoordsHtml.value = `${e.latlng.lat};${e.latlng.lng}`;
      });

    // SETUP POSITION SELECTOR LOGIN
    map.on('click', (e) => {
      if (chooseMapPosition) {
        toggleMapFullScreen(false);
        loginCoordsHtml.value = `${e.latlng.lat};${e.latlng.lng}`;
      }
    });

    // ON DRAG ARRIVAL MARKER
    arrival.marker.on('drag', () => {
      const newPosition = {
        lat: arrival.marker._latlng.lat,
        lng: arrival.marker._latlng.lng,
      };

      updateArrival(newPosition);
      socket.emit('dragArrival', newPosition);
    });
  }

  $('#loginform').submit((event) => {
    event.preventDefault();

    const name = $('#name').val();
    const coords = $('#login__coords').val().split(';');

    if (!name || !coords) return printError('Veuillez remplir tous les champs');

    if (users.list.find((user) => user.name === name))
      return printError('Ce nom est déjà pris');

    const user = {
      id: users.list.length,
      name: name,
      restaurant: parseInt($('#login__restaurant').val()),
      position: {
        lat: parseFloat(coords[0]),
        lng: parseFloat(coords[1]),
      },
    };

    addUser(user, true);

    toggleLoginPopup(false);

    socket.emit('login', user);

    leftTimeInterval = startLeftTimeInterval(5);
  });

  // ON SEND CHAT MESSAGE
  $('#form__message').submit((event) => {
    event.preventDefault();

    const message = $('#chat__message').val();

    const isCommand = message.charAt(0) === '/';

    let data = null;

    const user = users.list.find((user) => user.id === ownerId);

    if (isCommand) {
      const command = message.substring(1);
      const args = command.split(' ');
      const params = {
        function: args[0].toLowerCase(),
        value: args[1],
      };

      const functionName = Object.keys(chatCommands).find(
        (key) => key.toLowerCase() === params.function
      );

      if (!functionName) return printError('Commande inconnue');

      const error = chatCommands[functionName](params.value);
      if (error) return printError(error);

      addMessage(`Commande "${functionName}" executée`);

      data = params;
    } else {
      data = message;
      addMessage(`${user.name}: ${message}`);
    }

    socket.emit(
      'chat',
      {
        userName: user.name,
        data,
      },
      isCommand
    );

    $('#chat__message').val('');
  });

  // CHANGE MIAM HOUR
  function setMiam(value) {
    if (value < getMiam().getHours()) return 'Cette heure est déjà passée';

    socket.emit('setMiam', value, currentRoomId);
    rooms[currentRoomId].miam = new Date(
      new Date().setHours(parseInt(value), 0, 0)
    );
    if (selectedUserIndex !== -1)
      printMapInformations(getInformationsToLunch()[selectedUserIndex]);
  }

  //ON RESTAURANT CLICK

  function updateUserRestaurant(userId, restaurantId) {
    const user = getUser(userId);

    const userIndex = users.list.indexOf(user);

    users.list[userIndex].restaurant = restaurantId;

    updateTrajectLines(user);
  }

  const restaurantChildrenHtml =
    document.querySelector('.restaurants__list').children;

  Object.values(restaurantChildrenHtml).forEach((li) => {
    li.addEventListener('click', (e) => {
      const restaurantId = parseInt(li.dataset.restaurant);

      updateUserRestaurant(ownerId, restaurantId);
      socket.emit('updateUserRestaurant', ownerId, restaurantId, currentRoomId);
    });
  });

  socket.on('initData', (users, roomId) => {
    currentRoomId = roomId;
    printRoomName();

    initData();

    addUsers(users);
  });

  socket.on('addUser', (user, roomId) => {
    if (currentRoomId === roomId && map) addUser(user);
  });

  socket.on('removeUser', (userId, roomId) => {
    if (currentRoomId === roomId && map) removeUser(userId);
  });

  socket.on('updateArrival', (position) => {
    updateArrival(position, true);
  });

  socket.on('sendCommand', (values, roomId) => {
    if (currentRoomId !== roomId) return;
    const functionName = Object.keys(chatCommands).find(
      (key) => key.toLowerCase() === values.data.function
    );

    chatCommands[functionName](values.data.value);
    addMessage(`Commande "${functionName}" executée`);

  });

  socket.on('sendMessage', (values, roomId) => {
    console.log(currentRoomId, roomId);
    if (currentRoomId !== roomId) return;
    addMessage(`${values.userName}: ${values.data}`);
  });

  socket.on('updateUserPosition', (id, position) => {
    updateUserPosition(id, position);
  });

  socket.on('updateUserRestaurant', (userId, restaurantId, roomId) => {
    if (currentRoomId !== roomId) return;
    updateUserRestaurant(userId, restaurantId);
  });
})(jQuery);
