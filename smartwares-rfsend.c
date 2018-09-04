#include <wiringPi.h>
#include <stdlib.h>
#include <stdio.h>
#include <stdbool.h>
#include <stdint.h>
#include <string.h>

int shortPulse = 275;
int longPulse = 1240;

void sendBit(bool bit, int pin) {
    if (bit == false) {
        digitalWrite(pin, HIGH);
        delayMicroseconds(shortPulse);
        digitalWrite(pin, LOW);
        delayMicroseconds(shortPulse);
    } else if (bit == true) {
        digitalWrite(pin, HIGH);
        delayMicroseconds(shortPulse);
        digitalWrite(pin, LOW);
        delayMicroseconds(longPulse);
    }
}

void sendPair(bool bit, int pin) {
    if (bit == false) {
        sendBit(0, pin);
        sendBit(1, pin);
    } else if (bit == true) {
        sendBit(1, pin);
        sendBit(0, pin);
    }
}

void sendCommand(long transmitterId, bool state, short deviceId, int pin) {
    int i;

    // Send Header
    digitalWrite(pin, HIGH);
    delayMicroseconds(shortPulse);
    digitalWrite(pin, LOW);
    delayMicroseconds(2 * longPulse);

    // Send Transmitter ID
    for (i = 25; i >= 0; i--) {
        bool bitToSend = (long)(transmitterId & ((long)1 << i)) == 0;
        sendPair(bitToSend, pin);
    }

    // Send Group
    sendPair(false, pin);

    // Send State
    sendPair(state, pin);

    // Send Device
    for (i = 3; i >= 0; i--) {
        bool bitToSend = (deviceId & (1 << i)) != 0;
        sendPair(bitToSend, pin);
    }

    // Send Footer
    digitalWrite(pin, HIGH);
    delayMicroseconds(shortPulse);
    digitalWrite(pin, LOW);
}

int main (int argc, char **argv) {
    if (wiringPiSetup() == -1) {
        return -1;
    }
    piHiPri(99);

    // Load Parameters
    // <TRANSMITTER> <STATE> <DEVICE> <PIN>
    long transmitterId = atol(argv[1]);
    bool state = (atoi(argv[2]) == 1);
    short deviceId = (short)(atoi(argv[3]));
    int pin = atoi(argv[4]);

    pinMode(pin, OUTPUT);
    digitalWrite(pin, LOW);

    int h;
    for (h = 0; h < 5; h++) {
        sendCommand(transmitterId, state, deviceId, pin);
        delay(10);
    }

    return 0;
}
