var connect = new Connect({
    projectId: '58a83b83ba2ddd08c013f840',
    apiKey: 'D4494DDA2DE9DE353171F71BD7CC96AF-11501ACE74907B43FE6CEDEA75B63BD55D5C52AE3E187928F2C3DC52340716D6D9A3BFFEE922A938339D38B85EECE8156D9CF11F64503FF994E9FBA125D7DC58'
});
var chance = new Chance();
var uniqueName = chance.first() + chance.integer({min: 0, max: 534532453212322});
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
      playerInsulinInSystem: 0,
      playerInsulinMax: 20,
      playerCarbsInStomach: 0, // current carbs
      playerCarbsMax: 100,
      playerName: uniqueName,
      playerIsDead: false,
      playerBGLValue: 5, // value
      playerBGLMAX:30,
      playerBGLDisplayMax:20,
      gameLoopInterval: 5000,
      gameLoopTimer: null,
      bglisLow:false,
      bglisHigh: false,
      foods : foodlist(),
      chew_audio:null,
      drink_audio:null,
      insulineDoseUnits:5,
      currentFoodValue: 0,

      //modaled info
      carbsAbsorptionRate:2, // how many carbs are absorbed per cycle
      insulinAbsorptionRate:0.5, // how many units of insulin are absorbed per cycle
      carbsPerInsulinUnit:15, // how many grams of carbs are metabolise per insulin unit
      carbsToHealthMagicNumber: 20, // how many carbs convert to 1 unit of player health when metabolise; 0-20 health range
      carbsToBGLMagicNumber:8, // how many carbs convert to one point of BGL when unmetabolised
      BGLCorrectionPerInsulinUnitMagicNumber: 2, // how many BGL points drop per one unit of insulin without carbs
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

      var carbsAbsorbingIntoBloodstream;
      var insulinAbsorbed;
      var toLowBGL = 5;
      var toHighBGL = 10;
      console.log("BGL Value: ",this.playerBGLValue)
      if (this.playerBGLValue > toLowBGL) {
        //if value is less then certain playerBGL do stuff
      }
      if (this.playerBGLValue < toHighBGL) {
        //if value is higher then certain playerBGL do otheer stuff
      }
      
      console.log("In this tick:");

      // Absorb carbs
      if (this.playerCarbsInStomach - this.carbsAbsorptionRate > 0) {
          carbsAbsorbingIntoBloodstream = this.playerCarbsInStomach - this.carbsAbsorptionRate;
      } else {
          carbsAbsorbingIntoBloodstream = this.playerCarbsInStomach;
      }

      stats.carbsOnBoard = this.playerCarbsInStomach;
      stats.carbsAbsorption = carbsAbsorbingIntoBloodstream;
      console.log(`I started with ${this.playerCarbsInStomach} grams of carbs in my stomach`);
      console.log(`I am absorbing ${carbsAbsorbingIntoBloodstream} grams of carbs into my bloodstream`);

      this.playerCarbsInStomach -= carbsAbsorbingIntoBloodstream;

      // Absorb insulin
      if (this.playerInsulinInSystem - this.insulinAbsorptionRate > 0) {
          insulinAbsorbed = this.playerInsulinInSystem - this.insulinAbsorptionRate;
      } else {
          insulinAbsorbed = this.playerInsulinInSystem;
      }

      stats.insulinOnboard = this.playerInsulinInSystem;
      stats.insulinAbsorption = insulinAbsorbed;
      console.log(`I started with ${this.playerInsulinInSystem} units of insulin in my system`);
      console.log(`I am absorbing ${insulinAbsorbed} units of insulin`);

      this.playerInsulinInSystem -= insulinAbsorbed;

      // Calculate insulin requirement

      var insulinNeededToMetaboliseCarbsInBloodstream = (carbsAbsorbingIntoBloodstream / this.carbsPerInsulinUnit);

      console.log(`I need to absorb ${insulinNeededToMetaboliseCarbsInBloodstream} units of insulin to remain neutral BGL`);

      // Calculate and apply insulin and carbs interaction to health

      if (insulinAbsorbed < insulinNeededToMetaboliseCarbsInBloodstream) { // BGL will rise
          if (this.playerInsulinInSystem === 0) {
            console.log(`I didn't take enough insulin`);
          } else {
            console.log(`I didn't absorb enough insulin`);
          }
          var carbsConvertedToHealth = this.carbsPerInsulinUnit * insulinAbsorbed;
          var excessCarbs = carbsAbsorbingIntoBloodstream - carbsConvertedToHealth;
          console.log(`I have ${excessCarbs} in my bloodstream now`);
          this.playerHeartsValue += carbsConvertedToHealth / this.carbsToHealthMagicNumber;
          this.playerBGLValue = this.playerBGLValue + (excessCarbs / this.carbsToBGLMagicNumber);
      }

      if (insulinAbsorbed >= insulinNeededToMetaboliseCarbsInBloodstream) { // BGL will be neutral or will drop
        if (this.playerBGLValue < 8) {
          console.log(`I absorbed too much insulin in this tick`);
        }
        var carbsConvertedToHealth = carbsAbsorbingIntoBloodstream * this.carbsToEnergyHealthNumber;
        var excessInsulin = insulinAbsorbed - (carbsConvertedToHealth / this.carbsPerInsulinUnit);
        this.playerHeartsValue += carbsConvertedToHealth;
        this.playerBGLValue -= (excessInsulin * this.BGLCorrectionPerInsulinUnitMagicNumber);
        if (this.playerBGLValue < 4) {
          // This is naive - a portion of this "excess Insulin" may in fact be a correction dose
          // To get this part right requires discounting the excessInsulin (insulin above carb absorption)
          // for any correction effect on high BGL, then reporting the difference
          console.log(`I absorbed ${excessInsulin} units above my requirement [*see comment]`);
        }
      }
      console.log(`My BGL is ${BGL}`);
      stats.BGL = this.playerBGLValue;
      connect.push('spa-stats-collection', stats);

      if (this.playerFoodValue > 0) {
        this.playerFoodValue -= 1;
      }
      else if (this.playerHeartsValue > 0) {
        this.playerHeartsValue -= 1;
      }
      else {
        this.stopGameLoop();
      }

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
    }
  }
});
