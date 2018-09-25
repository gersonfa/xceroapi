
  Presence.prototype.upsert = function(connectionId, meta) {
    this.client.hset(
      'presence',
      connectionId,
      JSON.stringify({
        meta: meta,
        when: Date.now()
      })
    );
  };
  
  Presence.prototype.remove = function(connectionId) {
    this.client.hdel(
      'presence',
      connectionId,
    );
  };
  
  Presence.prototype.list = function(returnPresent) {
    var active = [];
    var dead = [];
    var now = Date.now();
    var self = this;
  
    this.client.hgetall('presence', function(err, presence) {
      if (err) {
        console.error('Failed to get presence from Redis: ' + err);
        return returnPresent([]);
      }
  
      for (var connection in presence) {
        var details = JSON.parse(presence[connection]);
        details.connection = connection;
  
        if (now - details.when > 8000) {
          dead.push(details);
        } else {
          active.push(details);
        }
      }
  
      if (dead.length) {
        self._clean(dead);
      }
  
      return returnPresent(active);
    });
  };
  
  Presence.prototype._clean = function(toDelete) {
    console.log(`Cleaning ${toDelete.length} expired presences`);
    for (var presence of toDelete) {
      this.remove(presence.connection);
    }
  };


// Lower the heartbeat timeout
io.set('heartbeat timeout', 8000);
io.set('heartbeat interval', 4000);


io.on('connection', function(socket) {
  var addedUser = false;

  socket.conn.on('heartbeat', function() {
    if (!addedUser) {
      // Don't start upserting until the user has added themselves.
      return;
    }

    Presence.upsert(socket.id, {
      username: socket.username
    });
  });

  // when the client emits 'add user', this listens and executes
  socket.on('add user', function(username) {
    if (addedUser) {
      return;
    }

    // we store the username in the socket session for this client
    socket.username = username;
    Presence.upsert(socket.id, {
      username: socket.username
    });
    addedUser = true;
  });

  // when the user disconnects.. perform this
  socket.on('disconnect', function() {
    if (addedUser) {
      Presence.remove(socket.id);
    }
  });
});