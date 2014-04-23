function heartbeat () {

  console.log('bump');

  setTimeout(heartbeat, 100);

}

heartbeat();
