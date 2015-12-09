//Wait for document to be ready before we do anything

var buttons = {};
var game = new Game();

//var context = new AudioContext();
var context; 
var oscillator;
var errorOscillator;
var errorGainNode;
var errorTime = 1000;
var screenTimer;

var buttonDelay = 500;

var digit1;
var digit2;
var strictLED;

function init(){
  setupAudio();
  setupButtons();
  setupError();
  setupScreen();
  game.generate();
  updateDisplay();
}

function setupAudio(){
  window.AudioContext = window.AudioContext || window.webkitAudioContext  || false;
  context = new AudioContext();
  if(context){
    oscillator = context.createOscillator();
    errorOscillator = context.createOscillator();
    errorGainNode = context.createGain();
  } else {
    alert('Audio Contect not supported on this browser');
  }
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
    that.userTimeout = 2000;
    that.stepTimer = 2000;
    that.strict = false;
  };
  this.gameInit();
  return this;
}

/*Game.prototype.generate = function(){
  this.moves = [];
  for(var i=0;i<20;i++){
    this.moves.push(Math.floor(Math.random()*4)+1);
  }
};*/

Game.prototype.generate = function(){
  this.moves = [];
  for(var i=0;i<2;i++){
    this.moves.push(Math.floor(Math.random()*4)+1);
  }
};

//Toggle the game on/off
Game.prototype.mainSwitch = function(state){
  //Toggle tje state
  this.on = !this.on;
  if(this.on){
    //Blink the screen
    blinkScreen('--');
    //Set the switch to on by adding the 'slider-on' class
    document.querySelector('.slider').setAttribute('class', 'slider slider-on');
    //Enable the buttons hover state
  } else {
    //Set the switch to off by removing the 'slider-on' class
    document.querySelector('.slider').setAttribute('class', 'slider');
    //Disable the buttons hover state
    disableButtons();
    //Turn all buttons off
    allButtonsOff();
    //Disable the user or demo timers
    clearTimeout(this.userTimer);
    clearTimeout(screenTimer);
    //Stop and demos or timers
    this.gameInit();
    this.on = false;
    //Turn screen off
    updateDisplay();
  }
};

Game.prototype.toggleStrict = function(){
  if(this.on){
    this.strict = !this.strict;
    updateStrictButtonLED();
  }
};

Game.prototype.startGame = function(){
  if(this.running === true){
    this.running = false;
    this.restart();
  } else {
    this.running = true;
    this.generate();
    this.demoLength = 0;
    this.demoID = 0;
    this.userID = 0;
    this.userTimer = undefined;
    this.running = true;
    this.demo = true;
    this.running = true;
    this.demoStep();
  }
};

Game.prototype.demoStep = function(){
  var that = this;
  if(this.demoLength <4){
    this.stepTimer = 2000;
  }else if(this.demoLength < 9){
    this.stepTimer = 1500;
  } else if(this.demoLength < 13){
    this.stepTimer = 1000;
  } else {
    this.stepTimer = 700;
  }
  if(this.demoID <= this.demoLength && this.on){
    //Disable the buttons
    disableButtons();
    updateDisplay(this.demoID+1);
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
    setTimeout(function(){game.demoStep();},that.stepTimer);
  } else if (this.on){
    enableButtons();
    this.running = true;
    this.demo = false;
    this.userWait();
  }
};

Game.prototype.failure = function(){
  //Show an error to the user
  errorAlert();
  var that = this;
  //Check to see if we're being strict or not
  if(this.strict === false){
    //If we're not, reset the demoID and userID and restart the demo
    this.demo = true;
    this.demoID = 0;
    this.userID = 0;
    setTimeout(function(){game.demoStep();},errorTime+500);
  } else {
    //If we are being strict then fully reset the game and start again
    setTimeout(function(){
      that.startGame();
    },errorTime+500);
  }
};

Game.prototype.winner = function() {
  console.log('winner');
  this.gameInit();
  disableButtons();
  this.on = true;
  //Blink the screen
  scrollWinner();
  var that = this;
  //this.mainSwitch();
  setTimeout(function(){
    that.startGame();
  },5000);
};

Game.prototype.restart = function() {
    var that = this;
    this.mainSwitch();
  setTimeout(function(){
    that.mainSwitch();
  },100);
  setTimeout(function(){
    that.startGame();
  },1500);
};

Game.prototype.userTimedout = function(){
  this.failure();
};

Game.prototype.userWait = function(){
  var that = this;
  this.userTimer = setTimeout(function(){
    that.userTimedout();
  },this.userTimeout);
};

//User has pressed button
Game.prototype.buttonPressed = function(button){
  //Clear the timeout waiting for input
  if(!this.demo){
    clearTimeout(this.userTimer);
    //Check to see if it's the correct button
    if(parseInt(button,10) === this.moves[this.userID]){
      //Test to see if this is the last button in the current sequnce
      if(this.userID === this.demoLength){
        //If so check so see if it's the last move
        if(this.userID === this.moves.length - 1){
          this.winner();
        }else{
          //If not start the next sequnce
          this.userID = 0;
          this.demoID = 0;
          this.demoLength ++;
          this.demo = true;
          //Delay the next demo run so we have enough time for the buttons to turn off
          setTimeout(function(thisObject){thisObject.demoStep();},buttonDelay+500,this);
        }
      } else {
        //Else this is not the last button the user needs to enter, so increase the user is and restart the timer waiting for input.
        this.userID ++;
        this.userWait();
      }
    } else {
    //Incorrect button press so call the failure method.
      this.failure();
    }
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

  //Toggle Strict Mode
  document.querySelector('.strict-button-container').addEventListener('click', function(){
    game.toggleStrict();
  });

}

function setupError(){
  errorOscillator.connect(errorGainNode);
  errorOscillator.frequency.value = 250;
  errorOscillator.start();
}


function enableButtons(){
  var buttons = document.getElementsByClassName("simonButton");
  for(var i = 0;i<buttons.length;i++){
    buttons[i].classList.add('button-enabled');
  }
}

function disableButtons(){
  var buttons = document.getElementsByClassName("simonButton");
  for(var i = 0;i<buttons.length;i++){
    buttons[i].classList.remove('button-enabled');
  }
}

function allButtonsOff(){
  var buttonsList = document.getElementsByClassName('simonButton');
  for(var i=0; i<buttonsList.length; i++){
    buttonsList[i].classList.remove('button-'+buttonsList[i].id+'-on');
    buttons["button" + buttonsList[i].id].stopTone();
  }
}

function errorAlert(){
  errorGainNode.connect(context.destination);
  errorGainNode.gain.value = 2;
  blinkScreen('!!');
  setTimeout(function(){
    errorGainNode.gain.value = 0;
    errorGainNode.disconnect(context.destination);
  },errorTime);
}

function setupScreen(){
  digit1 = document.querySelector('.digit1-inner');
  digit2 = document.querySelector('.digit2-inner');
  strictLED = document.querySelector('.strict-led');
}

function createScrenText(screenMessage){
  var screenArray = ['',''];
  if(screenMessage){
    var screenMessageSplit = (typeof screenMessage  === 'string') ? screenMessage.split('') : (screenMessage.toString()).split('');
    screenMessageSplit = (screenMessageSplit.length == 1) ? ['0',screenMessageSplit[0]] : screenMessageSplit;
    screenArray[0] = (screenMessageSplit[0]);
    screenArray[1] = (screenMessageSplit[1]);
  }
  return screenArray;
}

function updateDisplay(screenMessage){
  writeScreen(createScrenText(screenMessage));
}

function writeScreen(messageArray){
  if(game.on){
    digit1.textContent = messageArray[0];
    digit2.textContent = messageArray[1];
  } else {
    digit1.textContent = '';
    digit2.textContent = '';
  }
}

function blinkScreen(screenMessage){
  var screenMessageSplit = createScrenText(screenMessage);
  writeScreen(screenMessageSplit);
  setTimeout(function(){
    writeScreen(['','']);
  },500);
  setTimeout(function(){
    writeScreen(screenMessageSplit);
  },1000);
}

function updateStrictButtonLED(){
  if(game.strict){
    strictLED.classList.add('strict-led-on');
  } else {
    strictLED.classList.remove('strict-led-on');
  }
}

function scrollWinner(){
  var winnerString = 'Winner!';
  var winnerArray = winnerString.split('');
  var timerCount = 0;
  for(var i=0;i<(winnerArray.length + 2); i++){
    timerCount += 500;
    console.log(timerCount);
    var digits = [];
    var digit1Scroll = (i-1>=0 && i-1 < winnerArray.length) ? winnerArray[i-1] : '';
    var digit2Scroll = (i>=0 && i < winnerArray.length) ? winnerArray[i] : '';
    digits.push(digit1Scroll);
    digits.push(digit2Scroll);
    (function (digits2){
      setTimeout(function(){
        digit1.textContent = digits2[0];
        digit2.textContent = digits2[1];
      },timerCount);
    })(digits);
  }
}