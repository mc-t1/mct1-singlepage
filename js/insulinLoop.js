 
// Metabolism
    var  myCarbsAbsorptionRate = 2 // how many carbs are absorbed per tick
    var    myCarbsPerInsulinUnit = 7.5 // how many grams of carbs are metabolise per insulin unit
    var    myCarbsToHealthMagicNumber = 20 // how many carbs convert to 1 unit of player health when metabolise; 0-20 health range
    var    myBGLCorrectionPerInsulinUnitMagicNumber = 1 // how many BGL points drop per one unit of insulin without carbs
        // *Computed at run-time
    var    myCarbsToBGLMagicNumber = 1 // how many carbs convert to one point of BGL when unmetabolised
        // *Computed at run-time
    var   myInsulinAbsorptionRate = 2 // how many units of insulin are absorbed per cycle

    var carbsAbsorbingIntoBloodstream;
    var insulinAbsorbed;

    var lowerBoundHealthyBGL = 4;
    var upperBoundHealthyBGL = 7;
      

      //player stats
      var  playerCarbsInStomach = 10;
      var playerCarbsMax = 20;

      var playerInsulinInSystem = 4;
      var playerInsulinMax = 20;

      var playerHeartsMax = 20;
      var playerHeartsValue = 20;

      var playerBGLMax = 30;
      var playerBGLValue = 5;

      var playerFoodValue = 20;
      var playerFoodMax = 20;

      function healthAndFoodTick() {
        if (playerFoodValue > 0) {
        playerFoodValue -= 1;
        }
        else if (playerHeartsValue > 0) {
            playerHeartsValue -= 1;
        }

      }

      function initInsulinLoop(initPlayerHeartsMax, initPlayerHeartsValue, initPlayerBGLMax, initPlayerBGLValue, initPlayerFoodMax, initPlayerFoodValue,initPlayerCarbsMax, initPlayerCarbsInStomach, initPlayerInsulinMax, initPlayerInsulinInSystem) {
        playerHeartsMax = initPlayerHeartsMax;
        playerHeartsMax = initPlayerHeartsValue;
        playerBGLMax = initPlayerBGLMax;
        playerBGLValue = initPlayerBGLValue;
        playerFoodMax = initPlayerFoodMax;
        playerFoodValue = initPlayerFoodValue;
        playerCarbsMax = initPlayerCarbsMax;
        playerCarbsInStomach = initPlayerCarbsInStomach; 
        playerInsulinMax = initPlayerInsulinMax; 
        playerInsulinInSystem = parseFloat(initPlayerInsulinInSystem);
      }

      function getHearts() {
          return playerHeartsValue;
      }

      function setHearts(newHeartsValue) {
          playerHeartsValue = (newHeartsValue > playerHeartsMax) ? playerHeartsValue : newHeartsValue;
      }

      function getInsulin() {
          return playerInsulinInSystem;
      }

      function setInsulin(newInsulinValue) {
          playerInsulinInSystem = (newInsulinValue > playerInsulinMax) ? playerInsulinMax : newInsulinValue;
      }

      function addInsultin(insulinAdd) {
          //does not exceed max
          newInsulin = parseFloat(playerInsulinInSystem + insulinAdd);
          playerInsulinInSystem = (playerInsulinInSystem > playerInsulinMax) ? playerInsulinMax : newInsulin;
      }
    
    function getCarbs() {
        return playerCarbsInStomach;
    }

    function setCarbs(newCarbsValue) {
        playerCarbsInStomach = (newCarbsValue > playerCarbsMax) ? playerCarbsMax : newCarbsValue;
    }
    function addCarbs(newCarbsValue) {
        myNewValue = playerCarbsInStomach + newCarbsValue;
        playerCarbsInStomach = (myNewValue > playerCarbsMax) ? playerCarbsMax : myNewValue;
    }

    function getFood() {
        return playerFoodValue;
    }

    function setFood(newFoodValue) {
        playerFoodValue = (newFoodValue > playerFoodMax) ? playerFoodMax : newFoodValue;
    }

    function addFood(foodValue) {
        newFoodValue = playerFoodValue + foodValue;
        playerFoodValue = (newFoodValue > playerFoodMax) ? playerFoodMax : newFoodValue;

    }

    function getBGL() {
        return playerBGLValue
    }

    function setBGL(myBGL ) {
        playerBGLValue = (myBGL > playerBGLMax) ? playerBGLMax : myBGL ;
    }

    function addBGL(myBGLValue) {
        myBGL = playerBGLValue + myBGL;
        playerBGLValue = (myBGL > playerBGLMax) ? playerBGLMax : myBGL ;
    }

    function getMetabolism() {
       var metabolism = {
            CarbsAbsorptionRate: myCarbsAbsorptionRate,
            CarbsPerInsulinUnit :myCarbsPerInsulinUnit,
            CarbsToHealthMagicNumber : myCarbsToHealthMagicNumber,
            BGLCorrectionPerInsulinUnitMagicNumber : myBGLCorrectionPerInsulinUnitMagicNumber,

        }
        return metabolism;
    }
    function insulinTick() {
      console.log("In this tick:");

      // Absorb carbs
      if (playerCarbsInStomach - myCarbsAbsorptionRate > 0) {
          carbsAbsorbingIntoBloodstream = myCarbsAbsorptionRate;
      } else {
          carbsAbsorbingIntoBloodstream = playerCarbsInStomach;
      }

      console.log(`I started with ${playerCarbsInStomach} grams of carbs in my stomach`);
      console.log(`I am absorbing ${Math.round(carbsAbsorbingIntoBloodstream, 0)} grams of carbs into my bloodstream`);

      playerCarbsInStomach -= carbsAbsorbingIntoBloodstream;

      // Absorb insulin
      if (playerInsulinInSystem - myInsulinAbsorptionRate > 0) {
          insulinAbsorbed = myInsulinAbsorptionRate;
      } else {
          insulinAbsorbed = playerInsulinInSystem;
      }

      console.log(`I started with ${Math.round(playerInsulinInSystem, 0)} units of insulin in my system`);
      console.log(`I am absorbing ${Math.round(insulinAbsorbed, 1)} units of insulin`);

      playerInsulinInSystem -= insulinAbsorbed;

      // Calculate insulin requirement

      var insulinNeededToMetaboliseCarbsInBloodstream = (carbsAbsorbingIntoBloodstream / myCarbsPerInsulinUnit);

      var percentageOfCarbsAbsorbedToHealth = (insulinNeededToMetaboliseCarbsInBloodstream === 0) ? 0 : insulinAbsorbed / insulinNeededToMetaboliseCarbsInBloodstream;
      if (percentageOfCarbsAbsorbedToHealth > 1) {
        percentageOfCarbsAbsorbedToHealth = 1;
      }

      // Glucose is absorbed from the bloodstream into the cells, providing health
      // Absorption of glucose into cells is proportional to insulin absorbed
      var carbsThatWereMetabolised = (carbsAbsorbingIntoBloodstream * percentageOfCarbsAbsorbedToHealth);
      var healthImpact = carbsThatWereMetabolised * myCarbsToHealthMagicNumber;

      console.log(`I need to absorb ${Math.round(insulinNeededToMetaboliseCarbsInBloodstream, 1)} units of insulin to remain neutral BGL`);

      var newHeartsValue = playerHeartsValue + healthImpact;
      if (newHeartsValue > playerHeartsMax) {
        playerHeartsValue = playerHeartsMax;
      } else {
        playerHeartsValue = newHeartsValue;
      }
      // Calculate and apply insulin and carbs interaction to health

      if (insulinAbsorbed < insulinNeededToMetaboliseCarbsInBloodstream) { // BGL will rise
          if (playerInsulinInSystem === 0) {
            console.log(`I didn't take enough insulin`);
          } else {
            console.log(`I didn't absorb enough insulin`);
          }
          // Here glucose that was not absorbed remains in the blood and raises blood glucose level
          var excessCarbs = carbsAbsorbingIntoBloodstream - carbsThatWereMetabolised;
          playerBGLValue = playerBGLValue + (excessCarbs / myCarbsToBGLMagicNumber);
          console.log(`I have ${Math.round(excessCarbs, 0)} carbs in my bloodstream now`);
      }

      if (insulinAbsorbed === insulinNeededToMetaboliseCarbsInBloodstream) {
        if (insulinNeededToMetaboliseCarbsInBloodstream !== 0) {
          console.log('That was just the right amount!');
        }
      }

      if (insulinAbsorbed > insulinNeededToMetaboliseCarbsInBloodstream) { // BGL will be neutral or will drop
        if (playerBGLValue < 8) {
          console.log(`I absorbed too much insulin in this tick`);
        }
        console.log(`I have ${carbsAbsorbingIntoBloodstream} grams of carbs in my bloodstream`);

        // Glucose is absorbed from the bloodstream into the cells, providing health
        // Absorption of glucose into cells is proportional to insulin absorbed
        var carbsConvertedToHealth = carbsAbsorbingIntoBloodstream * myCarbsToHealthMagicNumber;
        var newHeartsValue = playerHeartsValue + carbsConvertedToHealth;
        if (newHeartsValue > 20) {
          playerHeartsValue = 20;
        } else {
          playerHeartsValue = newHeartsValue;
        }

        console.log(`I have ${Math.round(carbsAbsorbingIntoBloodstream, 0)} grams of carbs in my bloodstream`);

        // Insulin absorbed above the carb absorption causes the Blood Glucose Level to drop
        var excessInsulin = insulinAbsorbed - (carbsThatWereMetabolised / myCarbsPerInsulinUnit);
        var oldBGLValue = playerBGLValue;

        var newBGLValue = playerBGLValue - (excessInsulin * myBGLCorrectionPerInsulinUnitMagicNumber);

        if (newBGLValue <= 0) {
          playerBGLValue = 0;
        } else {
          playerBGLValue = newBGLValue;
        }
        console.log(`My BGL went from ${Math.round(oldBGLValue,1)} to ${Math.round(newBGLValue, 1)}`);

        if (playerBGLValue < lowerBoundHealthyBGL) {
          // Insulin used to metabolise carbs that were absorbed this tick
          var insulinUsedToMetaboliseCarbsThisTick = (carbsThatWereMetabolised / myCarbsPerInsulinUnit);
          // Insulin used to reduce BGL into the health range in this tick
          var insulinUsedToReduceBGLWithinRangeThisTick = (oldBGLValue - upperBoundHealthyBGL) / myCarbsPerInsulinUnit;
          // This is the amount of insulin that was "too much" to absorb in this tick
          var excessInsulin = insulinAbsorbed - (insulinUsedToMetaboliseCarbsThisTick + insulinUsedToReduceBGLWithinRangeThisTick);

          console.log(`I absorbed ${Math.round(excessInsulin, 0)} units above my requirement`);
        }
      }
      console.log(`My BGL is ${Math.round(playerBGLValue, 1)}`);

    if (playerBGLValue <= 0) {
        playerHeartsValue = 0;
      }
       return getMetabolism();

    }
