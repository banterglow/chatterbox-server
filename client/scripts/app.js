// YOUR CODE HERE:
// $(document).ready(function() {

//2011-08-21T18:02:52.249Z
//2017-12-08T18:12:81.4648-08:00
// where={"createdAt":{"$gte":{"__type":"Date","iso":"2011-08-21T18:02:52.249Z"}}}
// where={"createdAt":{"$gte":{"__type":"Date","iso":"2017-12-08T19:12:18.249Z"}}}


let app = {
  allChats: {},
  roomList: {},
  friendList: {},
  server: 'http://127.0.0.1:3000/classes/messages',
  currentRoom: null,
  currentRoomChats: [],
  lastUpdate: {
    createdAt: {
      $gte: {
        __type: 'Date',
        iso: moment().utc().format()
      }
    }
  },
  init: function() {
    app.fetch();
    // setInterval(app.fetch, 3000); //interval
    // setInterval(app.updateRender, 2000, app.currentRoom);
    // app.addFriend();
  },
  render: function(selectedRoom) {
    // console.log('RENDER HAS RUN' + app.lastUpdate.createdAt.$gte.iso);
    for (var chat in app.allChats) {
      var text = _.escape(app.allChats[chat].text);
      var username = _.escape(app.allChats[chat].username);
      var timeStamp = moment(new Date(_.escape(app.allChats[chat].createdAt))).format('LLLL');
      var timeElapsed = moment(new Date(_.escape(app.allChats[chat].createdAt))).fromNow();
      var roomName = _.escape(app.allChats[chat].roomname);
      if (roomName === selectedRoom) {
        $('#chats').append($(`<div class="chatBody ${roomName} ${username}"><div class='usernameClass'><strong>${username}</strong></div><p class="messageText" style="color: black">${text}</p><p class="timestamp">${timeElapsed}</p></div>`));
      }
      // $('#chats').append($(`<div class="chatBody ${roomName}"><p><strong>${username}</strong><br>${text}</p><p class="timestamp">${timeStamp}</p></div>`));
    }
  },
  updateRender: function(selectedRoom) {
    while (app.currentRoomChats.length > 0) {
      var text = _.escape(app.currentRoomChats[0].text);
      var username = _.escape(app.currentRoomChats[0].username);
      var timeStamp = moment(new Date(_.escape(app.currentRoomChats[0].createdAt))).format('LLLL');
      var timeElapsed = moment(new Date(_.escape(app.currentRoomChats[0].createdAt))).fromNow();
      console.log(`update render ${timeElapsed}`);
      var roomName = _.escape(app.currentRoomChats[0].roomname);
      $('#chats').prepend($(`<div class="chatBody ${roomName} ${username}"><div class='usernameClass'><strong>${username}</strong></div><p class="messageText" style="color: black">${text}</p><p class="timestamp">${timeElapsed}</p></div>`));
      app.currentRoomChats.shift();
    }
  },
  fetch: function() {
    // $.get(app.server, updateFeed);
    // console.log(app.server + JSON.stringify(app.lastUpdate));
    $.ajax({
      // This is the url you should use to communicate with the parse API server.
      url: app.server,
      type: 'GET',
      contentType: 'application/json',
      success: function(data) {
        app.lastUpdate.createdAt.$gte.iso = moment().utc().format();
        console.log(data);
        for (var i = 0; i < data.results.length; i++) {
          if (_.escape(data.results[i].username) !== 'Chatterberts') {
            // renders new rooms based on incoming messages
            app.renderRoom(_.escape(data.results[i].roomname));
            // adds all messages to allChat object
            app.allChats[_.escape(data.results[i].createdAt)] = data.results[i];
            if (data.results[i].roomname === app.currentRoom) {
              app.currentRoomChats.push(data.results[i]);
            }
          }   
        }
      },
      error: function (data) {
        // See: https://developer.mozilla.org/en-US/docs/Web/API/console.error
        console.error('chatterbox: Failed to receive message', data);
      }
    });
  },
  send: function(message) {
    $.ajax({
      // This is the url you should use to communicate with the parse API server.
      url: app.server,
      type: 'POST',
      data: message,
      contentType: 'application/json',
      success: function (data) {
        console.log('chatterbox: Message sent');
      },
      error: function (data) {
        // See: https://developer.mozilla.org/en-US/docs/Web/API/console.error
        console.error('chatterbox: Failed to send message', data);
      }
    });
  },
  handleSubmit: function() {
    var message = {
      username: window.location.search.slice(10),
      text: $('#messageInput').val(),
      roomname: $('#roomSelect').val(),
      createdAt: moment(new Date(_.escape(moment().format()))).format('LLLL')
    };
    console.log(message);
    $('#messageInput').val('');
    app.renderMessage(message);
    app.fetch();
  },
  renderMessage: function(message) {
    app.send(JSON.stringify(message));
    //below is just for the spec test
    var timeElapsed = moment(new Date(_.escape(message.createdAt))).fromNow();
    $('#chats').prepend($(`<div class="chatBody ${message.roomname} ${message.username}"><div class='usernameClass'><strong>${message.username}</strong></div><p class="messageText" style="color: black">${message.text}</p><p class="timestamp">${timeElapsed}</p></div>`));
  },
  clearMessages: function() {
    $('#chats').empty();
  },
  renderRoom: function(room) {
    if (!app.roomList[room] && room !== '') {
      $('#roomSelect').append($(`<option value="${room}">${room}</option>`));
      app.roomList[room] = room;
    }
    
  },
  createRoom: function() {
    var roomName = $('#newRoomInput').val(); 
    $('#newRoomInput').val('');
    $('#roomSelect').append($(`<option class="${roomName}" value="${roomName}">${roomName}</option>`));
    app.enterRoom(roomName);
  },
  enterRoom: function() {
    // var selectedRoom = $('#roomSelect ${roomName} option:selected').val();
    // console.log(selectedRoom);
    // $('.roomName').attr('selected', 'selected');
    var roomName = $('#roomSelect').val(); 
    console.log(`entered ${roomName}`);
    app.clearMessages();
    app.currentRoom = roomName;
    app.render(roomName);
  },
  addFriend: function(username) {
    app.friendList[username] = username;
    // $(`${username}`).css('cursor', 'pointer');
    // $(`.${username}`).addClass('friend');
    let styleFriend = $(`<style>.${username} { background-color: #F2F2F2; color: #8258FA; }</style>`);
    
    $('body').append(styleFriend);
  }
};

app.init();

// $.ajax({
//     url: app.server,
//     method: 'POST',
//     data: JSON.stringify(message),
//     contentType: 'application/json',
//     success: function (data) {
//         console.log('chatterbox: Message sent');
//     },
//     error: function (data) {
//         // See: https://developer.mozilla.org/en-US/docs/Web/API/console.error
//         console.error('chatterbox: Failed to send message', data);
//     }
// });


$(document).ready(function() {
  $('#submitButton').on('click', app.handleSubmit);

  $('#messageInput').keypress(function(e) {
    if (e.keyCode === 13) {
      $('#submitButton').trigger('click');
    }
  });

  // $('#messageInput').on('keypress', app.handleSubmit);

  $('#createRoomButton').on('click', app.createRoom);

  $('#newRoomInput').keypress(function(e) {
    if (e.keyCode === 13) {
      $('#createRoomButton').trigger('click');
    }
  });

  $('#roomSelect').on('change', app.enterRoom);

  $('#chats').on('click', 'div.usernameClass', function() {
    let username = $(this).text();
    app.addFriend(username);
  }); 
  /* slide effect - first append it as hidden, then slide reveal it.
  var temp = '<div class="newli"><div>1</div><div>2</div><div>3</div><div>4</div></div>';
  function runEffect() {
      $(temp).insertAfter('#add').show("blind", {
          direction: "up"
      }, 1000);
  };
  CSS

  .newli {
      display: none;
  }
  */

  //set interval






});
