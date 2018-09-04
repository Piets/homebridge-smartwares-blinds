var Service, Characteristic;
var exec = require("child_process").exec;

module.exports = function(homebridge) {
    Service = homebridge.hap.Service;
    Characteristic = homebridge.hap.Characteristic;

    homebridge.registerAccessory("homebridge-smartwares-blinds",
        "Smartwares",
        SmartwaresBlindsAccessory);
}

function SmartwaresBlindsAccessory(log, config) {
    this.log = log;

    //Accessory information
    this.name = config["name"];
    this.manufacturer = config["manufacturer"];
    this.model = config["model"];
    this.serial = config["serial"];

    //RF transmit inforamtion
    this.transmitter = config["transmitter"];
    this.device = config["device"];
    this.pin = config["pin"];

    //Blinds information
    this.motionTime = config["motion_time"];

    //State variables
    this.interval = null;
    this.lastPosition = 0; //last known position of the blinds, down by default
    this.currentPositionState = 2; //stopped by default // 0 = DECREASING; 1 = INCREASING; 2 = STOPPED;
    this.currentTargetPosition = 0; //down by default

    this.cmdBase = "sudo " + //the unitec-rfsend executable requires root
        __dirname + //module directory
        "/smartwares-rfsend " + this.transmitter + " ";
}

SmartwaresBlindsAccessory.prototype = {
    getCurrentPosition: function(callback) {
        callback(null, this.lastPosition);
    },

    getPositionState: function(callback) {
        callback(null, this.currentPositionState);
    },

    getTargetPosition: function(callback) {
        callback(null, this.currentTargetPosition);
    },

    setTargetPosition: function(position, callback) {
        this.currentTargetPosition = position;

        if (this.interval != null) clearInterval(this.interval);

        if (this.currentTargetPosition == this.lastPosition) {
            callback();
            return;
        }


        var moveUp = (this.currentTargetPosition >= this.lastPosition);

        this.blindService
            .setCharacteristic(Characteristic.PositionState, (moveUp ? 1 : 0));

        var cmd = this.cmdBase + (moveUp ? "1" : "0") + " " + this.device + " " + this.pin;
        exec(cmd, function(error, stdout, stderr) {
            if (error) {
                console.log(error);
            }
        });


        var localThis = this;
        this.interval = setInterval(function() {
            localThis.lastPosition += (moveUp ? 1 : -1);

            localThis.blindService
                .setCharacteristic(Characteristic.CurrentPosition, localThis.lastPosition)
                .setCharacteristic(Characteristic.PositionState, (moveUp ? 1 : 0));


            if (localThis.lastPosition == localThis.currentTargetPosition) {
                exec(cmd, function(error, stdout, stderr) {
                    if (error) {
                        console.log(error);
                    }

                    localThis.blindService
                        .setCharacteristic(Characteristic.CurrentPosition, position)
                        .setCharacteristic(Characteristic.PositionState, 2);

                    localThis.lastPosition = position;
                });
                clearInterval(localThis.interval);
            }
        }, parseInt(this.motionTime) / 100);

        callback();
    },

    identify: function(callback) {
        this.log("HomeKit identify requested");
        callback();
    },

    getServices: function() {
        var informationService = new Service.AccessoryInformation();

        informationService
            .setCharacteristic(Characteristic.Manufacturer, this.manufacturer)
            .setCharacteristic(Characteristic.Model, this.model)
            .setCharacteristic(Characteristic.SerialNumber, this.serial);


        this.blindService = new Service.WindowCovering(this.name);

        this.blindService
            .getCharacteristic(Characteristic.CurrentPosition)
            .on('get', this.getCurrentPosition.bind(this));

        this.blindService
            .getCharacteristic(Characteristic.PositionState)
            .on('get', this.getPositionState.bind(this));

        this.blindService
            .getCharacteristic(Characteristic.TargetPosition)
            .on('get', this.getTargetPosition.bind(this))
            .on('set', this.setTargetPosition.bind(this));

        return [informationService, this.blindService];
    }
}
