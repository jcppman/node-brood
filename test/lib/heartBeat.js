var count = 0;

function heartbeat () {

  console.log('bump');
  count++;

  if (count < 100) {
    setTimeout(heartbeat, 100); 
  }

}

heartbeat();
