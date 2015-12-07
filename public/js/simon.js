//Wait for document to be ready before we do anything

var buttons = {};
var game = new Game();

var context = new AudioContext();
var oscillator = context.createOscillator();

function init(){
  console.log('ready');
  //Setup Buttons
  setupButtons();
  //oscillator.connect(context.destination);
  game.generate();
  console.log(game);
}

//Button Object

function Button(id){
  this.id = id;
  this.on = false;
  this.offTimer = undefined;

  //Create our audio gain node and oscillator
  this.gainNode = context.createGain();
  this.osc = context.createOscillator();
  this.osc.connect(this.gainNode);

  //Set it to zero
  this.gainNode.gain.value = 0;
  var that = this;

  //Set the osciallator frequency
  switch(this.id){
    case 1:
      that.osc.frequency.value = 300;
      break;
    case 2:
      that.osc.frequency.value = 350;
      break;
    case 3:
      that.osc.frequency.value = 400;
      break;
    case 4:
      that.osc.frequency.value = 450;
      break;
  }
  this.osc.start();
  return this;
}

//Fade in and connect the Oscialltor
Button.prototype.playTone = function(){
  this.gainNode.connect(context.destination);
  this.gainNode.gain.value = 1;
};

//Fade out and disconnect the Oscialltor
Button.prototype.stopTone = function(){
  this.gainNode.gain.value = 0;
  this.gainNode.disconnect(context.destination);
};

//Button has been clicked
Button.prototype.click = function(){
  this.setOn(500);
};

//Demo  button press
Button.prototype.flash = function(){
  this.setOn(3000);
};

//Generic function to light up the button and play tone
Button.prototype.setOn = function(duration){
  //Check is we're already on (debounce)
  if(!this.on && game.on){
    //Save a refernce to this to pass into the timer.
    var that = this;
    this.on = true;
    this.playTone();
    //Add the button-*-on css class to hightlight the button
    document.querySelector('.button-' + this.id).classList.toggle('button-'+this.id+'-on');
    //Set a timer to turn the button off again, and stop the sound
    this.offTimer = setTimeout(function(button){ 
      document.querySelector('.button-' + that.id).classList.toggle('button-'+that.id+'-on'); 
      that.on = false;
      that.stopTone();
    }, duration);
  }
};

//Game Object

function Game(){
  this.on = false;
  this.running = false;
  this.moves = [];
  this.demoLength = 0;
  this.demoID = 0;
  this.userID = 0;
  return this;
}

Game.prototype.generate = function(){
  this.moves = [];
  for(var i=0;i<20;i++){
    this.moves.push(Math.floor(Math.random()*4)+1);
  }
};

//Toggle the game on/off
Game.prototype.mainSwitch = function(state){
  //Toggle tje state
  game.on = !game.on;
  if(game.on){
    //Set the switch to on by adding the 'slider-on' class
    document.querySelector('.slider').setAttribute('class', 'slider slider-on');
    //Enable the buttons hover state
    toggleButtons();
  } else {
    //Set the switch to off by removing the 'slider-on' class
    document.querySelector('.slider').setAttribute('class', 'slider');
    //Disable the buttons hover state
    toggleButtons();
  }
};

Game.prototype.startGame = function(){

};

function setupButtons(){
  //Create button objects
  buttons.button1 = new Button(1);
  buttons.button2 = new Button(2);
  buttons.button3 = new Button(3);
  buttons.button4 = new Button(4);
  
  //Attach the event listeners
  //Main game buttons
  document.querySelector('.button-1').addEventListener('click', function(){
    buttons.button1.click();
  });
  document.querySelector('.button-2').addEventListener('click', function(){
    buttons.button2.click();
  });
  document.querySelector('.button-3').addEventListener('click', function(){
    buttons.button3.click();
  });
  document.querySelector('.button-4').addEventListener('click', function(){
    buttons.button4.click();
  });

  //Main game on/off button
  document.querySelector('.switch').addEventListener('click', function(){
    game.mainSwitch();
  });

  //Start game
  document.querySelector('.switch').addEventListener('click', function(){
    game.mainSwitch();
  });

}


function toggleButtons(){
  var buttons = document.getElementsByClassName("simonButton");
  for(var i = 0;i<buttons.length;i++){
    buttons[i].classList.toggle('button-enabled');
  }
}
