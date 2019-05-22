'use strict';
var http = require('http');
function elicitSlot(sessionAttributes, intentName, slots, slotToElicit, message, responseCard) {
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

// Build a responseCard with a title, subtitle, and an optional set of options which should be displayed as buttons.
function buildResponseCard(title, subTitle, options) {
    let buttons = null;
    if (options != null) {
        buttons = [];
        for (let i = 0; i < Math.min(5, options.length); i++) {
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

function buildValidationResult(isValid, violatedSlot, messageContent) {
    if (messageContent === null) {
        return {
            isValid,
            violatedSlot,
        };
    }
    return {
        isValid,
        violatedSlot,
        message: { contentType: 'PlainText', content: messageContent },
    };
}

function validateSlots(slots) {
    return buildValidationResult(true, null, null);
}

function getBrands(fn){
    http.get('http://alize.bytize.org/api/getBrands', function (result) {
        var body = '';
        result.on('data', function (data) {
            body += data;
        });
        result.on('end', function () {
            var brands = JSON.parse(body);
            var result = [];
            for (var item, i = 0; item = brands[i++];) {
                var tmp = {};
                tmp.text = item.name;
                tmp.value = item.id;
                result.push(tmp);
            }
            fn(result);
        });
    }).on('error', function (err) {
        fn([]);
    });
}

function buildOptions(slot, slots){
    switch(slot){
        case "CarBrand":
            getBrands(function(result){
                return result;
            });
            break;
    }
}

function buyNewCar(intentRequest, callback) {
    const carBrand = intentRequest.currentIntent.slots.CarBrand;
    const carBodyType = intentRequest.currentIntent.slots.CarBodyType;
    const carBudget = intentRequest.currentIntent.slots.CarBudget;
    const carModel = intentRequest.currentIntent.slots.CarModel;
    const carColor = intentRequest.currentIntent.slots.CarColor;
    const zipCode = intentRequest.currentIntent.slots.ZipCode;
    const source = intentRequest.invocationSource;
    const outputSessionAttributes = intentRequest.sessionAttributes || {};

    if (source === 'DialogCodeHook') {
        // Perform basic validation on the supplied input slots.  Use the elicitSlot dialog action to re-prompt for the first violation detected.
        const slots = intentRequest.currentIntent.slots;
        const validationResult = validateSlots(slots);
        if (!validationResult.isValid) {
            slots[`${validationResult.violatedSlot}`] = null;
            callback(elicitSlot(intentRequest.sessionAttributes, intentRequest.currentIntent.name, slots, validationResult.violatedSlot, validationResult.message));
            return;
        }

        if (!carBrand) {
            callback(elicitSlot(outputSessionAttributes, intentRequest.currentIntent.name,
            intentRequest.currentIntent.slots, 'CarBrand',
            { contentType: 'PlainText', content: 'Which Brand are you looking for?' },
            buildResponseCard('Choose from the options below', 'buttonImage',
                buildOptions('CarBrand', slots))));
            return;
        }
        
        if (carModel) {
            outputSessionAttributes.Price = 1000; // Elegant pricing model
        }
        callback(delegate(outputSessionAttributes, intentRequest.currentIntent.slots));
        return;
    }

    callback(close(intentRequest.sessionAttributes, 'Fulfilled',
    { contentType: 'PlainText', content: `Thanks you` }));
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
