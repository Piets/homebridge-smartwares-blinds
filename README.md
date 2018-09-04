# homebridge-smartwares-blinds

Homebridge plugin for controlling Smartwares RF 433MHz blinds. The state is only simulated within the plugin as there is no actual feedback in the RF protocol.

## Installation

- Install homebridge  
`sudo npm install -g homebridge`

- Install homebridge-rfoutlets  
`sudo npm install -g homebridge-smartwares-blinds`

- Update your homebridge configuration

## Notes

- The user which homebridge is run from must be on the list of *sudoers* as the `smartwares-rfsend` executable requires root privileges

## Configuration

- `name`: Name of your device
- `manufacturer`: manufacturer of the device plugged into the outlet (*optional*, defaults to *blank*)
- `model`: model of the device plugged into the outlet (*optional*, defaults to *blank*)
- `serial`: serial number of the device plugged into the outlet (*optional*, defaults to *blank*)
- `transmitter`: RF transmitter id (**required**)
- `device`: RF device id (**required**)
- `motion_time`: Time it takes for the blinds to fully open/close in milliseconds (**required**)
- `pin`: The pin the RF transmitter is connected to (**required**)

See `sample-config.json`
