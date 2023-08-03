/*
 * Arduino RTC Initialization Code
 * 
 * Created: 
 * 8/2/2023 by Siem Yonas
 * Last Modified: 
 * 8/2/2023 by Siem Yonas
 */

#include "Arduino.h"
#include "uRTCLib.h"
#include <UnixTime.h>
#include <SPI.h>
#include <WiFiNINA.h>

#include "arduino_secrets.h" 
///////please enter your sensitive data in the Secret tab/arduino_secrets.h

// WiFi
char ssid[] = SECRET_SSID; // The WiFi network’s SSID (name)
char pass[] = SECRET_PASS; // The WiFi network’s password
int status = WL_IDLE_STATUS; // the WiFi radio's status

// RTC
uRTCLib rtc(0x68); // uRTCLib library object
UnixTime stamp(0); // Unix timestamp converter

void setup() {
  Serial.begin(9600);
  while (!Serial);

  // RTC

  // Start RTC module
  #ifdef ARDUINO_ARCH_ESP8266
    URTCLIB_WIRE.begin(0, 2); // D3 and D4 on ESP8266
  #else
    URTCLIB_WIRE.begin();
  #endif

  Serial.println("RTC began!");
  
  // WiFi
  // check for the WiFi module:
  if (WiFi.status() == WL_NO_MODULE) {
    Serial.println("Communication with WiFi module failed!");
    // don't continue
    while (true);
  }

  String fv = WiFi.firmwareVersion();
  if (fv < WIFI_FIRMWARE_LATEST_VERSION) {
    Serial.println("Please upgrade the firmware");
  }

  // While the device is not connected to WiFi, attempt to connect to the WiFi
  while (status != WL_CONNECTED) {
    Serial.print("Attempting to connect to WPA SSID: ");
    Serial.println(ssid);
    // Connect to WPA/WPA2 network:
    status = WiFi.begin(ssid, pass);

    // wait 10 seconds for connection:
    delay(10000);
  }

  Serial.println("Connected to the network");

  // Retrieve Epoch from WiFi network
  unsigned long epoch; // The unix time from WiFi network;
  int numberOfTries = 0, maxTries = 6; // Variables for the number of tries to retrieve the Wifi Epocj
  
  do {
    epoch = WiFi.getTime();
    numberOfTries++;
  } while ((epoch == 0) && (numberOfTries < maxTries));

  if (numberOfTries == maxTries) {
    Serial.println("NTP unreachable!!");
    while (1);
  }

  Serial.print("Epoch received: ");
  Serial.println(epoch);

  // Initialize the RTC with the epoch
  stamp.getDateTime(epoch);

  rtc.set(stamp.second, 
          stamp.minute, 
          stamp.hour, 
          stamp.dayOfWeek, 
          stamp.day,
          stamp.month,
          (uint8_t)(stamp.year-2000)
         );


  Serial.println("RTC intialized!");
}

void loop() {
}
