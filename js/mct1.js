var dummyCarbsMap = {
  "15" : "Bread",
  "30" : "Watermelon",
  "45" : "Cookie"
};

/*var Foods = {
  "apple" : {
    'foodValue' : '10',
    'carbsValue' : '2'
  },
  "carrot" : {
    'foodValue' : '5',
    'carbsValue' : '5'
  }
}*/
// "use strict";
var images = [];
var vue = new Vue({
  el: "#app",
  template: "#vueroot",
  data: function(){
    return {
      configCarbsReferenceUnit: 15,
      configMinSafeBGL: 4,
      configMaxSafeBGL: 8,
      configCriticalHighBGL: 20,
      bloodGlucose: 0,
      foodValue: 15,
      foodUnits: 1,
      insulinUnits: 1,
      insulinUnitsInSystem: 0,
      carbsInSystem: 0,
      feedbackMessages: [],
      playerHeartsValue: 20,
      playerHeartsMax: 20,
      playerFoodValue: 20,
      playerFoodMax: 20,
      playerInsulinValue: 20,
      playerInsulinMax: 20,
      playerCarbsValue: 20,
      playerCarbsMax: 20,
      playerName:'Billy',
      playerIsDead: false,
      gameLoopInterval: 500,
      gameLoopTimer: null,
      bglisLow:false,
      bglisHigh: false,
      foods : foodList()
    };
  },
  created: function(){
    this.startGameLoop();
    console.log(this.foods);
  },
  methods: {
    chewFood: function () {
      var rand = Math.floor((Math.random() * 2) + 1);
      var audio = new Audio('./mp3/minecraft_chewing_'+rand+'.mp3');
      audio.play();
    },
    slurpPotion: function () {
      var audio = new Audio('./mp3/minecraft_drinking_potion_1.mp3');
      audio.play();
    },
    startGameLoop: function () {
      console.log('this.gameLoopInterval', this.gameLoopInterval);
      this.gameLoopTimer = setInterval(this.iterateExhaustion, this.gameLoopInterval);
    },
    stopGameLoop: function () {
      clearInterval(this.gameLoopTimer);
    },
    iterateExhaustion: function () {
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
      this.carbsInSystem += this.foodValue * this.foodUnits;
      this.feedbackMessages.push("CMD RUN: /t1 eat " + this.foodUnits + " " + dummyCarbsMap[this.foodValue.toString()]);
      this.feedbackMessages.push("USR MSG: you ate " + this.foodUnits + " pieces of " + dummyCarbsMap[this.foodValue.toString()]);
      this.updateSimpleModel();
    },
    takeInsulin: function(){
      this.insulinUnitsInSystem += this.insulinUnits;
      this.feedbackMessages.push("CMD RUN: /t1 take " + this.insulinUnits + " insulin");

      this.feedbackMessages.push("USR MSG: you took " + this.insulinUnits + " units of insulin");
      this.updateSimpleModel();
    },
    updateSimpleModel: function(){
      // increase bgl
      msg_bgl_changes = "USR MSG: Your stomach digests " + this.carbsInSystem;
      this.bloodGlucose += (
          this.carbsInSystem * 0.25
        );
      if(this.carbsInSystem > 0) {
        this.feedbackMessages.push(msg_bgl_changes + " which raises you blood glucose level to " + this.bloodGlucose);
        this.feedbackMessages.push("USR MSG: The equation was: BGL = BGL + (carbs in system * 0.25)");
      }
      this.carbsInSystem = 0;

      // decrease bgl by amount of insulin in system, to a maximum of zero
      var toAbsorb = this.insulinUnitsInSystem * this.bglReferenceUnit();

      toAbsorbDiffBGL = this.bloodGlucose - toAbsorb;
      actualAbsorbedInsulin = 0;

      if (toAbsorbDiffBGL < 0) {
        actualAbsorbedInsulin = this.insulinUnitsInSystem - Math.abs(toAbsorbDiffBGL/this.bglReferenceUnit());
      }
      else {
        actualAbsorbedInsulin = this.insulinUnitsInSystem;
      }
      this.bloodGlucose -= actualAbsorbedInsulin * this.bglReferenceUnit();
      // -- check level of magic --
      this.bglisLow = false;
      this.bglisHigh = false;
      if (this.bloodGlucose < this.configMinSafeBGL ) {
        this.bglisLow = true;
      }
      else if (this.bloodGlucose > this.configMaxSafeBGL) {
        this.bglisHigh = true;
      }
      this.insulinUnitsInSystem -= actualAbsorbedInsulin;

      if(actualAbsorbedInsulin > 0) {
        this.feedbackMessages.push("USR MSG: " + actualAbsorbedInsulin + " units of insulin were used to process your blood glucose");
        this.feedbackMessages.push("USR MSG: You gained health");
      }else {
        this.feedbackMessages.push("USR MSG: No blood glucose was processed into health.");
      }

      this.feedbackMessages.push("USR MSG: You have " + this.insulinUnitsInSystem + " insulin in your system");

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
      if (this.bloodGlucose < this.configMinSafeBGL){
        this.feedbackMessages.push("USR MSG: Hypoglycemic shock. My player dies without immediate emergency medical intervention.");
      }

      if (this.bloodGlucose > this.configMaxSafeBGL){
        if (this.bloodGlucose > this.configCriticalHighBGL) {
          this.feedbackMessages.push("USR MSG: Diabetic Ketoacidosis Attack (DKA). Without medical intervention my player loses consciousness and will die.");
        }
        else {
          this.feedbackMessages.push("USR MSG: Hyperglycemia. My BGL is too high (> "+ this.configMaxSafeBGL+") not enough insulin! It causes damage to my player health");
        }
      }
    },
    clearFeedback: function(){
      this.feedbackMessages = [];
    }
  }
});
