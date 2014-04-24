var password = process.argv[2];

if (password !== 'finalFrontier') {

  throw new Error('wrong password');

}
