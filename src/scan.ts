import * as readline from 'readline';

const rl: any = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  terminal: false
});

rl.on('line', function(line: any){
    console.log(line);
})
