const http = require('http');

var Service, Characteristic;

module.exports = function(homebridge) {
    Service = homebridge.hap.Service;
    Characteristic = homebridge.hap.Characteristic;
    homebridge.registerAccessory('homebridge-switch-wifi-iot', 'WiFiIoTSwitch', SwitchAccessory);
}

function SwitchAccessory(log, config) {
    this.log = log;
    this.name = config.name;
    this.gpio = config.gpio;
    this.pulse = config.pulse || false;
    this.pulseTime = config.pulseTime || 500;
    this.controlUrl = config.controlUrl;
    this.statusUrl = config.statusUrl;
    this.login = config.login;
    this.password = config.password;

    this.baseAuthHeader = null;

    if (this.login && this.password) {
        this.baseAuthHeader = 'Basic ' + Buffer.from(this.login + ':' + this.password).toString('base64');
    }

    if (this.controlUrl == null) {
        throw new Error("You have to provide 'controlUrl' to control switch");
    }

    if (this.statusUrl == null) {
        throw new Error("You have to provide 'statusUrl' to get device information");
    }

    if (this.gpio == null) {
        throw new Error("You have to provide 'gpio' to get device information");
    }


    this.service = new Service.Switch(this.name);
    this.serviceInfo = new Service.AccessoryInformation();
    this.serviceInfo
        .setCharacteristic(Characteristic.Manufacturer, 'alex925')
        .setCharacteristic(Characteristic.Model, 'wifi-iot-switch')
        .setCharacteristic(Characteristic.SerialNumber, '0.0.1');

    this.service
        .getCharacteristic(Characteristic.On)
        .on('get', this.getPowerState.bind(this))
        .on('set', this.setPowerState.bind(this));
}

SwitchAccessory.prototype = {

    getPowerState: function(callback) {
        var reqOptions = {
            headers: {
                "Authorization": this.baseAuthHeader
            }
        }

        http.get(this.statusUrl, reqOptions, (resp) => {
            let data = '';
            resp.on('data', (chunk) => {
                data += chunk;
            });
            resp.on('end', () => {
                if (resp.statusCode == 200) {
                    try {
                        var switchStatus = JSON.parse(data).gpio[this.gpio];
                    } catch (exception) {
                        this.log('Exception during parsing response from the switch.\n', exception.stack);
                        callback(new Error('Exception during parsing response from the switch.'))
                        return;
                    }

                    callback(null, switchStatus);
                    return;
                } else if (resp.statusCode == 401) {
                    this.log('Unable to obtain switch status. Login and password are not correct.');
                    callback(new Error('Unable to obtain switch status. Login and password are not correct.'));
                    return;
                }

                this.log('Error getting switch state. Error: %s', error);
                callback(new Error('Error getting switch state.'));
            });
        }).on("error", (err) => {
            this.log("Error in trying to get switch status. Error message: ", err.message);
            callback(new Error("Error in trying to get switch status"));
        });
    },

    buildControlPowerStateUrl: function (state) {
        // state - текущее состояние выключателя включен/выключен
        var urlParams = '?st=' + Number(state) + '&pin=' + this.gpio.toString()
        if (this.pulse) {
            urlParams += '&mclick=' + this.pulseTime
        }

        return this.controlUrl + urlParams
    },

    setPowerState: function(state, callback) {
		var reqOptions = {
            headers: {
                "Authorization": this.baseAuthHeader
            }
        }

        http.get(this.buildControlPowerStateUrl(state), reqOptions, (resp) => {
            let data = '';
            resp.on('data', (chunk) => {
                data += chunk;
            });
            resp.on('end', () => {
                if (resp.statusCode == 200 && data == 'OK') {
                    if (this.pulse) {
                        setTimeout(
                            () => {this.service.getCharacteristic(Characteristic.On).updateValue(false);},
                            this.pulseTime
                        );
                    }
                    callback(null, true);
                    return;
                } else if (resp.statusCode == 401) {
                    this.log('Cannot change the position of the switch. Login and password are not correct.');
                    callback(new Error('Cannot change the position of the switch. Login and password are not correct.'));
                    return;
                }

                this.log(
                    'An error occurred while sending request to change the status of the switch. ' +
                    'Response code: %d, data: %s', resp.statusCode, data
                );
            });
        }).on("error", (err) => {
            this.log("Error while executing a relay switching request . Error message: ", err.message);
            callback(new Error("Error while executing a relay switching request "));
        });
    },

    identify: function(callback) {
        callback();
    },

    getServices: function() {
        return [this.serviceInfo, this.service];
    }
};
