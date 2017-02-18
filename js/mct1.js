


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
      playerInsulinValue: 0,
      playerInsulinMax: 20,
      playerCarbsValue: 0, // current carbs
      playerCarbsMax: 100,
      playerName:'Billy',
      playerIsDead: false,
      playerBGLValue: 5,
      playerBGLMAX:30,
      playerBGLDisplayMax:20,
      gameLoopInterval: 5000,
      gameLoopTimer: null,
      bglisLow:false,
      bglisHigh: false,
      foods : foodList(),
      chew_audio:null,
      drink_audio:null,
      insulineDoseUnits:5,
      currentFoodValue: 0,

      //modaled info
      carbsAbsorptionRate:2, // how many carbs are absorbed per cycle
      insulinAbsorptionRate:0.5, // how many units of insulin are absorbed per cycle
      carbsPerInsulinUnit:15, // how many grams of carbs are metabolise per insulin unit
      carbsToHealthMagicNumber:10, // how many carbs convert to 1 unit of player health when metabolised
      carbsToBGLMagicNumber:8, // how many carbs convert to one point of BGL when unmetabolised
      BGLCorrectionPerInsulinUnitMagicNumber:2, // how many BGL points drop per one unit of insulin without carbs
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

      var carbsAbsorbed;
      var insulinAbsorbed;

      // Absorb carbs
      if (this.playerCarbsValue - this.carbsAbsorptionRate > 0) {
          carbsAbsorbed = this.playerCarbsValue - this.carbsAbsorptionRate;
      } else {
          carbsAbsorbed = this.playerCarbsValue;
      }

      this.playerCarbsValue -= carbsAbsorbed;

      // Absorb insulin

      if (this.playerInsulinValue - this.insulinAbsorptionRate > 0) {
          insulinAbsorbed = this.playerInsulinValue - this.insulinAbsorptionRate;
      } else {
          insulinAbsorbed = this.playerInsulinValue;
      }

      this.playerInsulinValue -= insulinAbsorbed;

      // Calculate insulin requirement

      var insulinNeeded = (carbsAbsorbed / this.carbsPerInsulinUnit);

      // Calculate and apply insulin and carbs interaction to health

      if (insulinAbsorbed < insulinNeeded) { // BGL will rise
          var carbsConvertedToHealth = this.carbsPerInsulinUnit * insulinAbsorbed;
          var excessCarbs = carbsAbsorbed - carbsConvertedToHealth;
          this.playerHeartsValue += carbsConvertedToHealth / this.carbsToHealthMagicNumber;
          this.playerBGLValue = this.playerBGLValue + (excessCarbs / this.carbsToBGLMagicNumber);
      }

      if (insulinAbsorbed >= insulinNeeded) { // BGL will be neutral or will drop
          var carbs
      }
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

      var newCarbValue = parseInt(this.playerCarbsValue) + parseInt(this.currentFood.carbs);
      if (newCarbValue > 100) {
        this.playerCarbsValue = 100;
      } else {
        this.playerCarbsValue = newCarbValue;
      }
      this.updateSimpleModel();
    },
    takeInsulin: function(){
      this.playerInsulinValue += this.insulineDoseUnits;
      // Ensure not exceed max!
      this.playerInsulinValue = this.playerInsulinValue > this.playerInsulinMax ? this.playerInsulinMax : this.playerInsulinValue;
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
