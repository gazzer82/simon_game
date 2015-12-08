//Wait for document to be ready before we do anything

var buttons = {};
var game = new Game();

var context = new AudioContext();
var oscillator = context.createOscillator();

var buttonDelay = 500;

function init(){
  console.log('ready');
  setupButtons();
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
  this.context = this;
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
  this.setOn(buttonDelay);
  game.buttonPressed(this.id);
};

//Demo  button press
Button.prototype.flash = function(){
  this.setOn(game.stepTimer-500);
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
    document.querySelector('.button-' + this.id).classList.add('button-'+this.id+'-on');
    //Set a timer to turn the button off again, and stop the sound
    this.offTimer = setTimeout(function(button){ 
      document.querySelector('.button-' + that.id).classList.remove('button-'+that.id+'-on'); 
      that.on = false;
      that.stopTone();
    }, duration);
  }
};

//Game Object

function Game(){
  var that = this;
  this.gameInit = function(){
    that.on = false;
    that.running = false;
    that.demo = false;
    that.moves = [];
    that.demoLength = 0;
    that.demoID = 0;
    that.userID = 0;
    that.userTimer = undefined;
    that.userTimeout = 3000;
    that.stepTimer = 3000;
    that.strict = false;
  };
  this.gameInit();
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
  this.on = !this.on;
  if(this.on){
    //Set the switch to on by adding the 'slider-on' class
    document.querySelector('.slider').setAttribute('class', 'slider slider-on');
    //Enable the buttons hover state
    toggleButtons();
  } else {
    //Set the switch to off by removing the 'slider-on' class
    document.querySelector('.slider').setAttribute('class', 'slider');
    //Disable the buttons hover state
    toggleButtons();
    //Turn all buttons off
    allButtonsOff();
    //Stop and demos or timers
    this.gameInit();
    this.on = false;
  }
};

Game.prototype.startGame = function(){
  this.generate();
  this.demoLength = 0;
  this.demoID = 0;
  this.userID = 0;
  this.userTimer = undefined;
  this.running = true;
  this.demo = true;
  this.demoStep();
};

Game.prototype.demoStep = function(){
  console.log('starting demo');
  console.log(this.demoID);
  if(this.demoID <= this.demoLength && this.on){
    switch(this.moves[this.demoID]){
      case 1:
        buttons.button1.flash();
        break;
      case 2:
        buttons.button2.flash();
        break;
      case 3:
        buttons.button3.flash();
        break;
      case 4:
        buttons.button4.flash();
        break;
    }
    this.demoID ++;
    setTimeout(function(){game.demoStep();},3000);
  } else if (this.on){
    this.running = true;
    this.demo = false;
    this.userWait();
  }
};

Game.prototype.failure = function(){
  //Check to see if we're being strict or not
  if(this.strict === false){
    //If we're not, reset the demoID and userID and restart the demo
    this.demo = true;
    this.demoID = 0;
    this.userID = 0;
    this.demoStep();
  } else {
    //If we are being strict then fully reset the game and start again
    this.startGame();
  }
};

Game.prototype.userTimedout = function(){
  console.log('out of time');
  this.failure();
};

Game.prototype.userWait = function(){
  console.log('waiting for user input');
  var that = this;
  this.userTimer = setTimeout(function(){
    that.userTimedout();
  },3000);
};

//User has pressed button
Game.prototype.buttonPressed = function(button){
  //Clear the timeout waiting for input
  clearTimeout(this.userTimer);
  //Check to see if it's the correct button
  if(parseInt(button,10) === this.moves[this.userID]){
    console.log('correct button press');
    //Test to see if this is the last button in the current sequnce
    if(this.userID === this.demoLength){
      //If so check so see if it's the last move
      if(this.userID === 19){
        console.log('Winner!!');
      }else{
        //If not start the next sequnce
        this.userID = 0;
        this.demoID = 0;
        this.demoLength ++;
        this.demo = true;
        //Delay the next demo run so we have enough time for the buttons to turn off
        setTimeout(function(thisObject){thisObject.demoStep();},buttonDelay,this);
      }
    } else {
      //Else this is not the last button the user needs to enter, so increase the user is and restart the timer waiting for input.
      this.userID ++;
      this.userWait();
    }
  } else {
  //Incorrect button press so call the failure method.
    console.log('incorrect button press');
    this.failure();
  }
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
  document.querySelector('.start-button-container').addEventListener('click', function(){
    game.startGame();
  });

}


function toggleButtons(){
  var buttons = document.getElementsByClassName("simonButton");
  for(var i = 0;i<buttons.length;i++){
    buttons[i].classList.toggle('button-enabled');
  }
}

function allButtonsOff(){
  var buttonsList = document.getElementsByClassName('simonButton');
  for(var i=0; i<buttonsList.length; i++){
    buttonsList[i].classList.remove('button-'+buttonsList[i].id+'-on');
    buttons["button" + buttonsList[i].id].stopTone();
  }
}

