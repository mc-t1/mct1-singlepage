


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
var vue = new Vue({
  el: "#app",
  template: "#vueroot",
  data: function(){
    return {
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
        carbsAbsorptionRate:2, // how many carbs are absorbed per tick
        carbsPerInsulinUnit:7.5, // how many grams of carbs are metabolise per insulin unit
        carbsToHealthMagicNumber:20; // how many carbs convert to 1 unit of player health when metabolise; 0-20 health range
        BGLCorrectionPerInsulinUnitMagicNumber:2; // how many BGL points drop per one unit of insulin without carbs
        carbsToEnergyHealthNumber: 1;
        // *Computed at run-time
        carbsToBGLMagicNumber: 1; // how many carbs convert to one point of BGL when unmetabolised
        // *Computed at run-time
        insulinAbsorptionRate: 1; // how many units of insulin are absorbed per cycle
      },
      particlesObject: {speed: 0, size: 0, color: ''},
    };
  },
  created: function(){
    this.startGameLoop();
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
      this.gameLoopTimer = setInterval(this.iterateExhaustion, this.gameLoopInterval);
    },
    stopGameLoop: function () {
      clearInterval(this.gameLoopTimer);
    },
    iterateExhaustion: function () {
      // how many carbs convert to one point of BGL when unmetabolised
      this.metabolism.carbsToBGLMagicNumber = this.metabolism.carbsPerInsulinUnit * this.metabolism.BGLCorrectionPerInsulinUnitMagicNumber; 
      // Naively match carbs and insulin absorption
      // how many units of insulin are absorbed per cycle
      this.metabolism.insulinAbsorptionRate = this.carbsAbsorptionRate / this.carbsPerInsulinUnit; 
      var carbsAbsorbingIntoBloodstream;
      var insulinAbsorbed;

      this.calculateParticleEffects(this.playerBGLValue);

      console.log("In this tick:");

      // Absorb carbs
      if (this.playerCarbsInStomach - this.metabolism.carbsAbsorptionRate > 0) {
          carbsAbsorbingIntoBloodstream = this.metabolism.carbsAbsorptionRate;
      } else {
          carbsAbsorbingIntoBloodstream = this.playerCarbsInStomach;
      }

      stats.carbsOnBoard = this.playerCarbsInStomach;
      stats.carbsAbsorption = carbsAbsorbingIntoBloodstream;
      console.log(`I started with ${this.playerCarbsInStomach} grams of carbs in my stomach`);
      console.log(`I am absorbing ${carbsAbsorbingIntoBloodstream} grams of carbs into my bloodstream`);

      this.playerCarbsInStomach -= carbsAbsorbingIntoBloodstream;

      // Absorb insulin
      if (this.playerInsulinInSystem - metabolism.insulinAbsorptionRate > 0) {
          insulinAbsorbed = this.playerInsulinInSystem - metabolism.insulinAbsorptionRate;
      } else {
          insulinAbsorbed = this.playerInsulinInSystem;
      }

      stats.insulinOnboard = this.playerInsulinInSystem;
      stats.insulinAbsorption = insulinAbsorbed;
      console.log(`I started with ${this.playerInsulinInSystem} units of insulin in my system`);
      console.log(`I am absorbing ${insulinAbsorbed} units of insulin`);

      this.playerInsulinInSystem -= insulinAbsorbed;

      // Calculate insulin requirement

      var insulinNeededToMetaboliseCarbsInBloodstream = (carbsAbsorbingIntoBloodstream / metabolism.carbsPerInsulinUnit);

      console.log(`I need to absorb ${insulinNeededToMetaboliseCarbsInBloodstream} units of insulin to remain neutral BGL`);

      // Calculate and apply insulin and carbs interaction to health

      if (insulinAbsorbed < insulinNeededToMetaboliseCarbsInBloodstream) { // BGL will rise
          if (this.playerInsulinInSystem === 0) {
            console.log(`I didn't take enough insulin`);
          } else {
            console.log(`I didn't absorb enough insulin`);
          }
          // Glucose is absorbed from the bloodstream into the cells, providing health
          // Absorption of glucose into cells is proportional to insulin absorbed
          var carbsConvertedToHealth = metabolism.carbsPerInsulinUnit * insulinAbsorbed;
          this.playerHeartsValue += carbsConvertedToHealth / metabolism.carbsToHealthMagicNumber;

          // Here glucose that was not absorbed remains in the blood and raises blood glucose level
          var excessCarbs = carbsAbsorbingIntoBloodstream - carbsConvertedToHealth;
          this.playerBGLValue = this.playerBGLValue + (excessCarbs / metabolism.carbsToBGLMagicNumber);
          console.log(`I have ${excessCarbs} in my bloodstream now`);
      }

      if (insulinAbsorbed === insulinNeededToMetaboliseCarbsInBloodstream) {
        if (insulinNeededToMetaboliseCarbsInBloodstream !== 0) {
          console.log('That was just the right amount!');
          var carbsConvertedToHealth = carbsAbsorbingIntoBloodstream * metabolism.carbsToHealthMagicNumber;
          this.playerHeartsValue += carbsConvertedToHealth;
        }
      }

      if (insulinAbsorbed > insulinNeededToMetaboliseCarbsInBloodstream) { // BGL will be neutral or will drop
        if (this.playerBGLValue < 8) {
          console.log(`I absorbed too much insulin in this tick`);
        }
        console.log(`I have ${carbsAbsorbingIntoBloodstream} grams of carbs in my bloodstream`);

        // Glucose is absorbed from the bloodstream into the cells, providing health
        // Absorption of glucose into cells is proportional to insulin absorbed
        var carbsConvertedToHealth = carbsAbsorbingIntoBloodstream * metabolism.carbsToHealthMagicNumber;
        this.playerHeartsValue += carbsConvertedToHealth;

        // Insulin absorbed above the carb absorption causes the Blood Glucose Level to drop
        var excessInsulin = insulinAbsorbed - (carbsConvertedToHealth / metabolism.carbsPerInsulinUnit);
        var oldBGLValue = this.playerBGLValue;
        var newBGLValue = this.playerBGLValue - (excessInsulin * metabolism.BGLCorrectionPerInsulinUnitMagicNumber);
        
        if (newBGLValue <= 0) {
          this.playerBGLValue = 0;
        } else {
          this.playerBGLValue = newBGLValue;
        }
        console.log(`My BGL went from ${oldBGLValue} to ${newBGLValue}`);

        if (this.playerBGLValue < this.lowerBoundHealthyBGL) {
          // Insulin used to metabolise carbs that were absorbed this tick
          var insulinUsedToMetaboliseCarbsThisTick = (carbsConvertedToHealth / metabolism.carbsPerInsulinUnit);
          // Insulin used to reduce BGL into the health range in this tick
          var insulinUsedToReduceBGLWithinRangeThisTick = (oldBGLValue - upperBoundHealthyBGL) / metabolism.carbsPerInsulinUnit;
          // This is the amount of insulin that was "too much" to absorb in this tick
          var excessInsulin = insulinAbsorbed - (insulinUsedToMetaboliseCarbsThisTick + insulinUsedToReduceBGLWithinRangeThisTick);

          console.log(`I absorbed ${excessInsulin} units above my requirement`);
        }
        console.log(` ${excessInsulin} `);
      }
      console.log(`My BGL is ${this.playerBGLValue}`);

      if (this.playerFoodValue > 0) {
        this.playerFoodValue -= 1;
      }
      else if (this.playerHeartsValue > 0) {
        this.playerHeartsValue -= 1;
      }
      else {
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
              console.log(newResults);
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

    },
    eatFood: function(){
      var newFoodValue = parseInt(this.playerFoodValue) + parseInt(this.currentFood.restoration);
      if (newFoodValue > 20) {
        this.playerFoodValue = 20;
      } else {
        this.playerFoodValue = newFoodValue;
      }

      var newCarbValue = parseInt(this.playerCarbsInStomach) + parseInt(this.currentFood.carbs);
      if (newCarbValue > 100) {
        this.playerCarbsInStomach = 100;
      } else {
        this.playerCarbsInStomach = newCarbValue;
      }
      this.updateSimpleModel();
    },
    takeInsulin: function(){
      this.playerInsulinInSystem += this.insulineDoseUnits;
      // Ensure not exceed max!
      this.playerInsulinInSystem = this.playerInsulinInSystem > this.playerInsulinMax ? this.playerInsulinMax : this.playerInsulinInSystem;
      // this.insulinUnitsInSystem += this.insulinUnits;
      // this.feedbackMessages.push("CMD RUN: /t1 take " + this.insulinUnits + " insulin");
      //
      // this.feedbackMessages.push("USR MSG: you took " + this.insulinUnits + " units of insulin");
      // this.updateSimpleModel();
    },
    updateSimpleModel: function(){
      // increase bgl
    //
    //   console.log(this.playerFoodValue);
    //   console.log(this.currentFoodValue);
    //
    //   msg_bgl_changes = "USR MSG: Your stomach digests " + this.carbsInSystem;
    //
    //   if(this.carbsInSystem > 0) {
    //   //  this.feedbackMessages.push(msg_bgl_changes + " which raises you blood glucose level to " + this.bloodGlucose);
    //     this.feedbackMessages.push("USR MSG: The equation was: BGL = BGL + (carbs in system * 0.25)");
    //   }
    //   this.carbsInSystem = 0;
    //
    //   // decrease bgl by amount of insulin in system, to a maximum of zero
    //   var toAbsorb = this.insulinUnitsInSystem * this.bglReferenceUnit();
    //
    // //  toAbsorbDiffBGL = this.bloodGlucose - toAbsorb;
    //   actualAbsorbedInsulin = 0;
    //
    //   if (toAbsorbDiffBGL < 0) {
    //     actualAbsorbedInsulin = this.insulinUnitsInSystem - Math.abs(toAbsorbDiffBGL/this.bglReferenceUnit());
    //   }
    //   else {
    //     actualAbsorbedInsulin = this.insulinUnitsInSystem;
    //   }
    // //  this.bloodGlucose -= actualAbsorbedInsulin * this.bglReferenceUnit();
    //   // -- check level of magic --
    //
    //   this.insulinUnitsInSystem -= actualAbsorbedInsulin;
    //
    //   if(actualAbsorbedInsulin > 0) {
    //     this.feedbackMessages.push("USR MSG: " + actualAbsorbedInsulin + " units of insulin were used to process your blood glucose");
    //     this.feedbackMessages.push("USR MSG: You gained health");
    //   }else {
    //     this.feedbackMessages.push("USR MSG: No blood glucose was processed into health.");
    //   }
    //
    //   this.feedbackMessages.push("USR MSG: You have " + this.insulinUnitsInSystem + " insulin in your system");

      // we can't have negative blood glucose, it is really just unused (excess) insulin
      // update insulin & blood glucose to show this

      //finished making changes to player t1 stats
      //what does this mean for player health / side effects
      this.applySideEffects();
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
      var highColor = '#00ff00';
      var startObj = {};
      var flashColor = undefined;

      if ((BGL < veryLowBGL) || isNaN(BGL)) {
        startObj = {
          speed: 5,
          size: 15,
          color: lowColor,
          number: 300,
        };
        flashColor = lowColor;
      } else if (BGL < lowBGL) {
        startObj = {
          speed: 2,
          size: 10,
          color: lowColor,
          number: 150,
        };
        flashColor = lowColor;
      } else if (BGL > extremeBGL) {
        startObj = {
          speed: 5,
          size: 15,
          color: highColor,
          number: 400,
        };
        flashColor = highColor;
      } else if (BGL > veryHighBGL) {
        startObj = {
          speed: 3,
          size: 10,
          color: highColor,
          number: 300,
        };
        flashColor = highColor;
      } else if (BGL > highBGL) {
        startObj = {
          speed: 1,
          size: 5,
          color: highColor,
          number: 100,
        };
        flashColor = highColor;
      } else {
        stopBGL();
        flashColor = undefined;
      }

      if ((startObj.speed !== this.particlesObject.speed) || 
          (startObj.size !== this.particlesObject.size) ||
          (startObj.color !== this.particlesObject.color)) {
            // console.log("----------------------->NEW DATA");
            this.particlesObject = startObj;
            // console.log("----------------------->THE OBJ", this.particlesObject);
            startBGL(this.particlesObject);
            this.flashHealth();
      }
    },
    flashHealth: function(color) {
      if (!color) { return }

      console.log('------------------------>Flash Colour: ', color);
      
    },
  }
});
