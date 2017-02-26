
//TODO add in checks for max and min values in formula
// remove tombstone add gameover instead, restart

var connect = new Connect({
    projectId: '58a83b83ba2ddd08c013f840',
    apiKey: 'D4494DDA2DE9DE353171F71BD7CC96AF-11501ACE74907B43FE6CEDEA75B63BD55D5C52AE3E187928F2C3DC52340716D6D9A3BFFEE922A938339D38B85EECE8156D9CF11F64503FF994E9FBA125D7DC58'
});
var connectQuery = new Connect({
  projectId: '58a83b83ba2ddd08c013f840',
  apiKey: 'CF7C99D4FB11862B555778CC87A818C3-1D6DE9BA652EB82CBD237E56EC439448980641BD2C3E246133C08F75DEF66B946DFB917DF7E99CEF8E43C175E93EDDBEFC066DB6C834ABF07284D45782ABBD2C'
})
var chance = new Chance();
var uniqueName = chance.first() + '-' + chance.integer({min: 0, max: 100000});
var stats = {name: uniqueName};
// "use strict";
var images = [];

// var chew_audio;
// var drink_audio;
var complete_chew_tid;
var complete_drink_tid;
var Mathz = {};

$(document).ready(function() {
  $('#test1').show();
  function showModalInfo() {
    console.log(document.getElementById('stats'));
    document.getElementById('test1').style.display = 'block';
  }
});


Mathz.round = function(number, precision) {
    var factor = Math.pow(10, precision);
    var tempNumber = number * factor;
    var roundedTempNumber = Math.round(tempNumber);
    return roundedTempNumber / factor;
};

var vue = new Vue({
  el: "#app",
  template: "#vueroot",
  data: function(){
    return {
      showStats:false,
      configCarbsReferenceUnit: 15,
      configMinSafeBGL: 4,
      configMaxSafeBGL: 8,
      configCriticalHighBGL: 20,
      foodValue: 15,
      foodUnits: 1,
      insulinUnits: 1,
      insulinUnitsInSystem: 0,
      currentFood: null,
      feedbackMessages: [],
      playerHeartsValue: 20,
      playerHeartsMax: 20,
      playerFoodValue: 20,
      playerFoodMax: 20,
      playerInsulinInSystem: 4,
      playerInsulinMax: 20,
      playerCarbsInStomach: 10, // current carbs
      playerCarbsMax: 100,
      playerName: uniqueName,
      playerIsDead: false,
      playerBGLValue: 5, // value
      playerBGLMAX:30,
      playerBGLDisplayMax:20,
      gameLoopInterval: 6000,
      gameLoopTimer: null,
      bglisLow:false,
      bglisHigh: false,
      foods : foodlist(),
      chew_audio:null,
      drink_audio:null,
      insulineDoseUnits:5,
      currentFoodValue: 0,
      metabolism: {
        carbsAbsorptionRate: 2, // how many carbs are absorbed per tick
        carbsPerInsulinUnit: 7.5, // how many grams of carbs are metabolise per insulin unit
        carbsToHealthMagicNumber: 20, // how many carbs convert to 1 unit of player health when metabolise; 0-20 health range
        BGLCorrectionPerInsulinUnitMagicNumber: 1, // how many BGL points drop per one unit of insulin without carbs
        // *Computed at run-time
        carbsToBGLMagicNumber: 1, // how many carbs convert to one point of BGL when unmetabolised
        // *Computed at run-time
        insulinAbsorptionRate: 2, // how many units of insulin are absorbed per cycle
      },
      particlesObject: {speed: 0, size: 0, color: ''},

    };
  },
  created: function(){
    initInsulinLoop(this.playerHeartsMax, this.playerHeartsValue, this.playerBGLMAX, this.playerBGLValue, this.playerFoodMax, this.playerFoodValue, this.playerCarbsMax, this.playerCarbsInStomach, this.playerInsulinMax, this.playerInsulinInSystem);
    this.startGameLoop();
    // how many carbs convert to one point of BGL when unmetabolised
    this.metabolism.carbsToBGLMagicNumber = this.metabolism.carbsPerInsulinUnit * this.metabolism.BGLCorrectionPerInsulinUnitMagicNumber;
    // Naively match carbs and insulin absorption - with a slight bias to carb absorption to allow recovery from lows
    // how many units of insulin are absorbed per cycle
    this.metabolism.insulinAbsorptionRate = parseFloat(this.metabolism.carbsAbsorptionRate) / parseFloat(this.metabolism.carbsPerInsulinUnit) * 0.8;

  },
  methods: {
    chewFood: function (food) {
      this.currentFood = food;
      if (this.chew_audio != null) {
        this.chew_audio.pause();
        this.chew_audio.currentTime = 0;
      }

      var rand = Math.floor((Math.random() * 2) + 1);
       this.chew_audio = new Audio('./mp3/minecraft_chewing_'+rand+'.mp3');

      this.chew_audio.play();

      complete_chew_tid = setTimeout(this.eatFood, 1541.224);

    },
    slurpPotion: function () {
      if (this.drink_audio != null) {
        this.drink_audio.pause();
        this.drink_audio.currentTime = 0;
      }
      this.drink_audio = new Audio('./mp3/minecraft_drinking_potion_1.mp3');
      this.drink_audio.play();
      complete_drink_tid = setTimeout(this.takeInsulin, 1671.837);
    },
    stopSlurp: function() {
      if (!this.drink_audio.ended) {
        clearInterval(complete_drink_tid);
      }
      this.drink_audio.pause();
      this.drink_audio.currentTime = 0;
    },
    stopChew : function() {
      if (!this.chew_audio.ended) {
        clearInterval(complete_chew_tid);
      }
      this.chew_audio.pause();
      this.chew_audio.currentTime = 0;
    },
    startGameLoop: function () {
      console.log('this.gameLoopInterval', this.gameLoopInterval);
      this.gameLoopTimer = setTimeout(this.gameLoop, this.gameLoopInterval);
    },
    stopGameLoop: function () {
      clearInterval(this.gameLoopTimer);
    },
    gameLoop: function () {

      var lowerBoundHealthyBGL = 4;
      var upperBoundHealthyBGL = 7;

      // this.calculateParticleEffects(this.playerBGLValue);

      // if ((this.playerBGLValue < lowerBoundHealthyBGL) || isNaN(this.playerBGLValue)) {
      //   console.log('BGL too low: ', Mathz.round(this.playerBGLValue, 1));
      // this.calculateParticleEffects(this.playerBGLValue);
      // } else {
      //   console.log('BGL NORMAL: ', this.playerBGLValue);
      // }
      console.log("In this tick:");

      // Absorb carbs


      // stats.carbsOnBoard = this.playerCarbsInStomach;
      // stats.carbsAbsorption = carbsAbsorbingIntoBloodstream;


      // Absorb insulin
      // stats.insulinOnboard = this.playerInsulinInSystem;
      // stats.insulinAbsorption = insulinAbsorbed;


      // Calculate insulin requirement


      // Glucose is absorbed from the bloodstream into the cells, providing health
      // Absorption of glucose into cells is proportional to insulin absorbed


      // Calculate and apply insulin and carbs interaction to health



        // Glucose is absorbed from the bloodstream into the cells, providing health
        // Absorption of glucose into cells is proportional to insulin absorbed


        // Insulin absorbed above the carb absorption causes the Blood Glucose Level to drop


            healthAndFoodTick();
             insulinTick();
        this.playerHeartsValue = getHearts();
        this.playerInsulinInSystem = parseFloat(getInsulin());
        this.playerCarbsInStomach = getCarbs();
        this.playerFoodValue = getFood();
        this.playerBGLValue = getBGL();

       if (this.playerHeartsValue <= 0) {

          this.playerIsDead = true
         $(".flashHealth").addClass("flashHealthTrigger-ZEROED");
          this.stopGameLoop();
       }
        
   

      /**
       *  GetConnect.io stats and visualization
       * */

      stats.BGL = this.playerBGLValue;
      connect.push('spa-stats-collection', stats);

      var query = connectQuery.query("spa-stats-collection")
      .select({"sum": "BGL"})
      .filter({
          "name": this.playerName
      });

      var resultsFactory = function() {
        return query.execute()
          .then(function (results) {
              var newResults = results.clone();
              // modify the new results
              //console.log(newResults);
              return newResults;
          });
      }

      var chart = Connect.visualize(resultsFactory)
      .as('chart')
      .inside('#chart')
      .with({
        chart: {
          type: "bar"
        }
      })
      .draw();

      if (this.gameLoopInterval  > 3000) {
        this.gameLoopInterval -= 100;
      }
      this.gameLoopTimer = setTimeout(this.gameLoop, this.gameLoopInterval);
    },
    eatFood: function(){
      addFood(parseInt(this.currentFood.restoration));
      addCarbs(parseInt(this.currentFood.carbs));
      this.playerFoodValue = getFood();
      this.playerCarbsInStomach = getCarbs();
    },
    takeInsulin: function(){
      addInsultin(this.insulineDoseUnits);
      this.playerInsulinInSystem = getInsulin();
      // Ensure not exceed max!
    },
    bglReferenceUnit: function(){
      return this.configCarbsReferenceUnit * 0.25;
    },
    applySideEffects: function(){
      // if (this.bloodGlucose < this.configMinSafeBGL){
      //   this.feedbackMessages.push("USR MSG: Hypoglycemic shock. My player dies without immediate emergency medical intervention.");
      // }
      //
      // if (this.bloodGlucose > this.configMaxSafeBGL){
      //   if (this.bloodGlucose > this.configCriticalHighBGL) {
      //     this.feedbackMessages.push("USR MSG: Diabetic Ketoacidosis Attack (DKA). Without medical intervention my player loses consciousness and will die.");
      //   }
      //   else {
      //     this.feedbackMessages.push("USR MSG: Hyperglycemia. My BGL is too high (> "+ this.configMaxSafeBGL+") not enough insulin! It causes damage to my player health");
      //   }
      // }
    },
    clearFeedback: function(){
      this.feedbackMessages = [];
    },
    calculateParticleEffects: function(BGL) {
      var veryLowBGL = 2;
      var lowBGL = 4;
      var highBGL = 10;
      var veryHighBGL = 13;
      var extremeBGL = 15;
      var lowColor = '#ff0000';
      var highColor = '#ff00eb';
      var startObj = {};

      if ((BGL <= veryLowBGL) || isNaN(BGL)) {
        startObj = {
          speed: 15,
          size: 20,
          color: lowColor,
          number: 400,
        };
        this.flashHealth('redDark');
      } else if (BGL < lowBGL) {
        startObj = {
          speed: 7,
          size: 10,
          color: lowColor,
          number: 200,
        };
        this.flashHealth('redLight');
      } else if (BGL > extremeBGL) {
        startObj = {
          speed: 5,
          size: 15,
          color: highColor,
          number: 400,
        };
        this.flashHealth('greenLight');
      } else if (BGL > veryHighBGL) {
        startObj = {
          speed: 3,
          size: 10,
          color: highColor,
          number: 300,
        };
        this.flashHealth('greenDark');
      } else if (BGL >= highBGL) {
        startObj = {
          speed: 1,
          size: 5,
          color: highColor,
          number: 100,
        };
        this.flashHealth('greenDeathly');
      } else {
        stopBGL();
      }

      if ((startObj.speed !== this.particlesObject.speed) ||
          (startObj.size !== this.particlesObject.size) ||
          (startObj.color !== this.particlesObject.color)) {
            // console.log("----------------------->NEW DATA");
            this.particlesObject = startObj;
            // console.log("----------------------->THE OBJ", this.particlesObject);
            startBGL(this.particlesObject);
      }
    },

    spellCast: function() {
      console.log('rip');
      this.playerHeartsValue -= 1;
    },

    flashHealth: function(color) {
      if (this.playerIsDead) { return; }
      // let timeout = Math.round(this.gameLoopInterval / 4);
      //if (timeout < 1000) { timeout = 1000; }
      let timeout = 500;

      switch(color) {
        case 'redDark':
          $(".flashHealth").addClass("flashHealthTrigger-DARKRED");
          setTimeout(function() {
            $(".flashHealth").removeClass("flashHealthTrigger-DARKRED");
          }, timeout);
          break;
        case 'redLight':
          $(".flashHealth").addClass("flashHealthTrigger-LIGHTRED");
          setTimeout(function() {
            $(".flashHealth").removeClass("flashHealthTrigger-LIGHTRED");
          }, timeout);
          break;
        case 'greenLight':
          $(".flashHealth").addClass("flashHealthTrigger-PURPLE");
          setTimeout(function() {
            $(".flashHealth").removeClass("flashHealthTrigger-PURPLE");
          }, timeout);
          break;
        case 'greenDark':
          $(".flashHealth").addClass("flashHealthTrigger-PURPLE");
          setTimeout(function() {
            $(".flashHealth").removeClass("flashHealthTrigger-PURPLE");
          }, timeout);
          break;
        case 'greenDeathly':
          $(".flashHealth").addClass("flashHealthTrigger-PURPLE");
          setTimeout(function() {
            $(".flashHealth").removeClass("flashHealthTrigger-PURPLE");
          }, timeout);
          break;
        default:
          // Do Nothing
      }
    },
    hideInfo: function() {
      this.showStats = true;
    }
  }
});
