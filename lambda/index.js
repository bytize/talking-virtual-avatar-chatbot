'use strict';
var cars = require("./cars.json");
var usaZipCodes = require('./zipcodes.json');
var Fuse = require("fuse-js-latest");
var parsePrice = require('parse-price');
function elicitSlot(sessionAttributes, intentName, slots, slotToElicit, message, responseCard) {
    if(responseCard !== null){
        return {
            sessionAttributes,
            dialogAction: {
                type: 'ElicitSlot',
                intentName,
                slots,
                slotToElicit,
                message,
                responseCard,
            },
        };
    } else {
        return {
            sessionAttributes,
            dialogAction: {
                type: 'ElicitSlot',
                intentName,
                slots,
                slotToElicit,
                message
            },
        };
    }
}

function confirmIntent(sessionAttributes, intentName, slots, message, responseCard) {
    return {
        sessionAttributes,
        dialogAction: {
            type: 'ConfirmIntent',
            intentName,
            slots,
            message,
            responseCard,
        },
    };
}

function close(sessionAttributes, fulfillmentState, message, responseCard) {
    return {
        sessionAttributes,
        dialogAction: {
            type: 'Close',
            fulfillmentState,
            message,
            responseCard,
        },
    };
}

function delegate(sessionAttributes, slots) {
    return {
        sessionAttributes,
        dialogAction: {
            type: 'Delegate',
            slots,
        },
    };
}

function getBrands(){
    var lookup = {};
    var items = cars;
    var result = [];

    for (var item, i = 0; item = items[i++];) {
      var name = item.brand_name;

      if (!(name in lookup)) {
        lookup[name] = 1;
        var tmp = {};
        tmp.id = item.brand_id;
        tmp.name = item.brand_name;
        result.push(tmp);
      }
    }
    return result;
}

function getCarsByBrand(id) {
    var items = cars;
    var result = [];

    for (var item, i = 0; item = items[i++];) {
      var brand_id = item.brand_id;
      if (brand_id == id) {
        result.push(item);
      }
    }
    return result;
}

function getCarsByBrandBodyType(brandId,bodyType) {
    var items = cars;
    var result = [];

    for (var item, i = 0; item = items[i++];) {
      var brand_id = item.brand_id;
      var body_type_id = item.body_type_id;
      if (brand_id == brandId && body_type_id == bodyType) {
        result.push(item);
      }
    }
    return result;
}

function getCarsByBodyType(){
    var id = req.params.id;
    var items = cars;
    var result = [];
    for (var item, i = 0; item = items[i++];) {
      var body_type_id = item.body_type_id;
      if (body_type_id == id) {
        result.push(item);
      }
    }
    return result;
}

function getCarById(id){
    var items = cars;
    var result = {};
    for (var item, i = 0; item = items[i++];) {
      var car_id = item.car_id;
      if (car_id == id) {
        result = item;
        break;
      }
    }
    return result;
}

function getCarByName(name){
    var options = {
      shouldSort: true,
      tokenize: true,
      threshold: 0.6,
      location: 0,
      distance: 100,
      maxPatternLength: 32,
      minMatchCharLength: 1,
      keys: [
        "title",
        "car_name"
    ]
    };
    var fuse = new Fuse(cars, options); 
    var result = fuse.search(name);
    if(result.length){
       return result[0];
    } else {
        return null;
    }
}

function getBrandByName(name){
    var options = {
      shouldSort: true,
      tokenize: true,
      threshold: 0.6,
      location: 0,
      distance: 100,
      maxPatternLength: 32,
      minMatchCharLength: 1,
      keys: [
        "title",
        "brand_name"
    ]
    };
    var fuse = new Fuse(cars, options); 
    var result = fuse.search(name);
    if(result.length){
        return result[0];
    } else {
        return null;
    }
};

function getBodyTypeByName(name) {
    var options = {
      shouldSort: true,
      tokenize: true,
      threshold: 0.6,
      location: 0,
      distance: 100,
      maxPatternLength: 32,
      minMatchCharLength: 1,
      keys: [
        "title",
        "body_type_name"
    ]
    };
    var fuse = new Fuse(cars, options); 
    var result = fuse.search(name);
    if(result.length){
        return result[0];
    } else {
        return null;
    }
}

function getBodyTypes(){
    var lookup = {};
    var items = cars;
    var result = [];

    for (var item, i = 0; item = items[i++];) {
      var name = item.body_type_name;

      if (!(name in lookup)) {
        lookup[name] = 1;
        var tmp = {};
        tmp.id = item.body_type_id;
        tmp.name = item.body_type_name;
        result.push(tmp);
      }
    }
    return result;
}

function getBodyTypeById(id){
    var items = cars;
    var result = {};

    for (var item, i = 0; item = items[i++];) {
      var body_type_id = item.body_type_id;

      if (id == body_type_id) {
        var tmp = {};
        tmp.id = item.body_type_id;
        tmp.name = item.body_type_name;
        result = tmp;
        break;
      }
    }
    return result;
}

function getPriceRangeByName(brandName,bodyTypeName){
    var brand = getBrandByName(brandName);
    var brand_id = brand.brand_id;
    var bodyType = getBodyTypeByName(bodyTypeName);
    var body_type_id = bodyType.body_type_id;
    var budgetCars = getCarsByBrandBodyType(brand_id,body_type_id);
    var budgets = [];
    for (var item, i = 0; item = budgetCars[i++];) {
        budgets.push(item.maximum_price);
    }
    return {
        min: Math.min.apply(null, budgets),
        max: Math.max.apply(null, budgets)
    }
}

function getCarsByBrandBodyTypeName(slots){
    var brand = getBrandByName(slots.CarBrand);
    var brand_id = brand.brand_id;
    var bodyType = getBodyTypeByName(slots.CarBodyType);
    var body_type_id = bodyType.body_type_id;
    var budget = slots.CarBudget;
    var filterCars = getCarsByBrandBodyType(brand_id,body_type_id);
    var options = [];
    for (var item, i = 0; item = filterCars[i++];) {
        if(budget <= item.minimum_price){
            options.push(item);
        }
        
    }
    return options;
}

function getBrandsOptions(){
    var brands = getBrands();
    var options = [];
    for (var item, i = 0; item = brands[i++];) {
        var tmp = {};
        tmp.text = item.name;
        tmp.value = item.name;
        options.push(tmp);  
    }
    return options;
}

function getBodyTypesOptions(){
    var bodyTypes = getBodyTypes();
    var options = [];
    for (var item, i = 0; item = bodyTypes[i++];) {
        var tmp = {};
        tmp.text = item.name;
        tmp.value = item.name;
        options.push(tmp);  
    }
    return options;
}

function getCarsByBrandBodyTypeNameOptions(slots){
    var models = getCarsByBrandBodyTypeName(slots);
    var options = [];
    for (var item, i = 0; item = models[i++];) {
        var tmp = {};
        tmp.text = item.car_name+" ($"+item.minimum_price+" - $"+item.maximum_price+")";
        tmp.value = item.car_name;
        options.push(tmp);        
    }
    return options;
}

function getZipCode(zipCode){
    console.log(zipCode);
    for (var item, i = 0; item = usaZipCodes[i++];) {
        if(item.zip == zipCode){
            return item;
        }   
    }
    return null;
}

// Build a responseCard with a title, subtitle, and an optional set of options which should be displayed as buttons.
function buildResponseCard(title, subTitle, options) {
    let buttons = null;
    if (options != null) {
        buttons = [];
        for (let i = 0; i < Math.min(5,options.length); i++) {
            buttons.push(options[i]);
        }
    }
    return {
        contentType: 'application/vnd.amazonaws.card.generic',
        version: 1,
        genericAttachments: [{
            title,
            subTitle,
            buttons,
        }],
    };
}

function buildValidationResult(isValid, violatedSlot, messageContent,responseCard, actualValue,slots) {
    return {
        isValid,
        violatedSlot,
        message: { contentType: 'PlainText', content: messageContent },
        responseCard,
        actualValue,
        newSlots: slots
    };
}

function validateCarBrand(brand,slot,slots){
    var brand = getBrandByName(brand);
    var isValid = brand?true:false;
    var value = isValid?brand.brand_name:null;
    var message = isValid?null:"We only have the following brands please select one of these";
    var responseCard = buildResponseCard('Choose from the options below', 'buttonImage',buildOptions(slot, slots));
    return buildValidationResult(isValid, slot, message,responseCard, value);
}

function validateCarBodyType(type,slot,slots){
    var type = getBodyTypeByName(type);
    var isValid = type?true:false;
    var value = isValid?type.body_type_name:null;
    var message = isValid?null:"We only have the following body styles please select one of these";
    var responseCard = buildResponseCard('Choose from the options below', 'buttonImage',buildOptions(slot, slots));
    return buildValidationResult(isValid, slot, message,responseCard, value);
}

function validateCarBudget(budget,slot,slots){
    var maxBudget = parsePrice(""+budget);
    var priceRange = getPriceRangeByName(slots.CarBrand,slots.CarBodyType);
    var isValid = (maxBudget >= priceRange.min && maxBudget <= priceRange.max);
    var value = isValid?maxBudget:null;
    var message = isValid?null:"The mentioned budget seems to be lesser, please choose a value between $"+priceRange.min+" and $"+priceRange.max;
    return buildValidationResult(isValid, slot, message,null, ""+value);
}

function validateCarModel(model,slot,slots){
    var model = getCarByName(model);
    var carChanged = false;
    if(model && model.brand_name != slots.CarBrand && model.body_type_name != slots.CarBodyType){
        carChanged = true;
    }

    var isValid = model?true:false;

    var value = isValid?model.car_name:null;
    var message = isValid?null:"The Model that you opted doesn't match our records, Please select one of these";
    var newSlots = JSON.parse(JSON.stringify(slots));
    if(!slots.CarBrand || !slots.CarBodyType){
        newSlots.CarBrand = model.brand_name;
        newSlots.CarBodyType = model.body_type_name;
        newSlots.CarBudget = ""+model.minimum_price;
    }
    var responseCard = buildResponseCard('Choose from the options below', 'buttonImage',buildOptions(slot, newSlots));

    
    if(carChanged){
        responseCard = null;
        newSlots.CarBrand = model.brand_name;
        newSlots.CarBodyType = model.body_type_name;
        newSlots.CarBudget = ""+model.minimum_price;
    }
    return buildValidationResult(isValid, slot, message,responseCard, value, newSlots);
}

function validateZipCode(zipCode,slot,slots){
    var code = getZipCode(zipCode);
    var isValid = code?true:false;
    var value = isValid?code.zip:null;
    var message = isValid?null:"Please enter a valid zip code in USA";
    return buildValidationResult(isValid, slot, message,null, value);
}

function validateSlots(slots) {
    var errors = [];
    var results = [];
    var result = {};
    var error = {};
    if(slots.CarBrand){
        result = validateCarBrand(slots.CarBrand,"CarBrand",slots);
        if(!result.isValid){
            errors.push(result);
        } else {
            results.push(result);
        }
    }

    if(slots.CarBodyType){
        result = validateCarBodyType(slots.CarBodyType,"CarBodyType",slots);
        if(!result.isValid){
            errors.push(result);
        } else {
            results.push(result);
        }
    }

    if(slots.CarBudget){
        result = validateCarBudget(slots.CarBudget,"CarBudget",slots);
        if(!result.isValid){
            errors.push(result);
        } else {
            results.push(result);
        }
    }

    if(slots.CarModel){
        result = validateCarModel(slots.CarModel,"CarModel",slots);
        if(!result.isValid){
            errors.push(result);
        } else {
            results.push(result);
        }
    }

    if(slots.ZipCode){
        result = validateZipCode(slots.ZipCode,"ZipCode",slots);
        if(!result.isValid){
            errors.push(result);
        } else {
            results.push(result);
        }
    }
    
    return {
        errors: errors,
        results: results
    }
}

function buildOptions(slot, slots){
    switch(slot){
        case "CarBrand":
            return getBrandsOptions();
            break;
        case "CarBodyType":
            return getBodyTypesOptions();
            break;
        case "CarModel":
            return getCarsByBrandBodyTypeNameOptions(slots);
            break;
    }
}

function buyNewCar(intentRequest, callback) {
    var carBrand = intentRequest.currentIntent.slots.CarBrand;
    var carBodyType = intentRequest.currentIntent.slots.CarBodyType;
    var carBudget = intentRequest.currentIntent.slots.CarBudget;
    var carModel = intentRequest.currentIntent.slots.CarModel;
    var zipCode = intentRequest.currentIntent.slots.ZipCode;
    var phoneNumber = intentRequest.currentIntent.slots.PhoneNumber;
    var source = intentRequest.invocationSource;
    var outputSessionAttributes = intentRequest.sessionAttributes || {};

    if (source === 'DialogCodeHook') {
        // Perform basic validation on the supplied input slots.  Use the elicitSlot dialog action to re-prompt for the first violation detected.
        var slots = intentRequest.currentIntent.slots;
        var validationResults = validateSlots(slots);
        if (validationResults.errors.length) {
            var validationResult = validationResults.errors[0];
            slots[`${validationResult.violatedSlot}`] = null;
            callback(elicitSlot(outputSessionAttributes, intentRequest.currentIntent.name,
            slots,validationResult.violatedSlot, validationResult.message, validationResult.responseCard));
            return;
        } if(validationResults.results.length){
             for (var slot, i = 0; slot = validationResults.results[i++];) {
                if(slot.newSlots){
                    intentRequest.currentIntent.slots = slot.newSlots;
                }
                intentRequest.currentIntent.slots[`${slot.violatedSlot}`] = slot.actualValue;
                if(slot.violatedSlot == "CarBrand"){
                    carBrand = slot.actualValue;
                }
                if(slot.violatedSlot == "CarBodyType"){
                    carBodyType = slot.actualValue;
                }
                if(slot.violatedSlot == "CarBudget"){
                    carBudget = slot.actualValue;
                }
                if(slot.violatedSlot == "CarModel"){
                    carModel = slot.actualValue;
                }
                if(slot.violatedSlot == "ZipCode"){
                    zipCode = slot.actualValue;
                }
             }
        }

        if (!carBrand) {
            callback(elicitSlot(outputSessionAttributes, intentRequest.currentIntent.name,
            intentRequest.currentIntent.slots, 'CarBrand',
            { contentType: 'PlainText', content: 'Which Brand are you looking for?' },
            buildResponseCard('Choose from the options below', 'buttonImage',
                buildOptions('CarBrand', slots))));
            return;
        }

        if (carBrand && !carBodyType) {
            callback(elicitSlot(outputSessionAttributes, intentRequest.currentIntent.name,
            intentRequest.currentIntent.slots, 'CarBodyType',
            { contentType: 'PlainText', content: 'What body style do you prefer?' },
            buildResponseCard('Choose from the options below', 'buttonImage',
                buildOptions('CarBodyType', slots))));
            return;
        }
        
        if (carBrand && carBodyType) {
            var priceRange = getPriceRangeByName(carBrand, carBodyType);
            outputSessionAttributes.priceRangeMin = priceRange.min;
            outputSessionAttributes.priceRangeMax = priceRange.max;
        }

        if (carBrand && carBodyType && carBudget && !carModel) {
            callback(elicitSlot(outputSessionAttributes, intentRequest.currentIntent.name,
            intentRequest.currentIntent.slots, 'CarModel',
            { contentType: 'PlainText', content: 'Good choice. Which '+carBrand+' Model of style '+carBodyType+' are you thinking to buy for your budget $'+carBudget+'?' },
            buildResponseCard('Choose from the options below', 'buttonImage',
                buildOptions('CarModel', slots))));
            return;
        }

        if (carModel) {
            outputSessionAttributes = getCarByName(carModel);
        }

        if (carBrand && carBodyType && carBudget && carModel && !zipCode) {
            callback(elicitSlot(outputSessionAttributes, intentRequest.currentIntent.name,
            intentRequest.currentIntent.slots, 'ZipCode',
            { contentType: 'PlainText', content: 'Please enter the zipcode to find nearest dealers for '+carBrand+' '+carModel+'' },null));
            return;
        }

        if (carBrand && carBodyType && carBudget && carModel && zipCode && !phoneNumber) {
            callback(elicitSlot(outputSessionAttributes, intentRequest.currentIntent.name,
            intentRequest.currentIntent.slots, 'PhoneNumber',
            { contentType: 'PlainText', content: 'Please provide your mobile number?' },null));
            return;
        }

        if (carModel && zipCode && outputSessionAttributes) {
            var code = getZipCode(zipCode);
            outputSessionAttributes.zipCode = code.zip;
            outputSessionAttributes.zipCodePlace = code.place;
        }

        callback(delegate(outputSessionAttributes, intentRequest.currentIntent.slots));
        return;
    }

    callback(close(intentRequest.sessionAttributes, 'Fulfilled',
    { contentType: 'PlainText', content: `Thank you` }));
}

 // --------------- Intents -----------------------
function dispatch(intentRequest, callback) {
    console.log(`dispatch userId=${intentRequest.userId}, intentName=${intentRequest.currentIntent.name}`);

    const intentName = intentRequest.currentIntent.name;

    if (intentName === 'BuyNewCar') {
        return buyNewCar(intentRequest, callback);
    }
    throw new Error(`Intent with name ${intentName} not supported`);
}

// --------------- Main handler -----------------------
exports.handler = (event, context, callback) => {
    try {
        process.env.TZ = 'America/New_York';
        console.log(`event.bot.name=${event.bot.name}`);

        dispatch(event, (response) => callback(null, response));
    } catch (err) {
        callback(err);
    }
};
