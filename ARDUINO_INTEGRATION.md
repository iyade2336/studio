
# Integrating Arduino (ESP32/ESP8266) with IoT Guardian

This document provides guidance and example code for sending sensor data (like temperature and humidity) from an ESP32 or ESP8266 device to your IoT Guardian Next.js application, and for receiving basic commands from the application.

## Overview

The process involves your ESP32/ESP8266 device:
1.  Reading data from connected sensors.
2.  Connecting to your network (via Wi-Fi).
3.  Formatting the sensor data into a JSON payload.
4.  Sending this JSON payload as an HTTP POST request to the `/api/sensor-data` endpoint of your Next.js application.
5.  (Optional, for commands) Periodically sending an HTTP GET request to `/api/device-command/[YOUR_DEVICE_ID]` to check for new commands.

Your Next.js application has:
*   An API route (`src/app/api/sensor-data/route.ts`) to receive sensor data.
*   An API route (`src/app/api/device-command/[deviceId]/route.ts`) to issue and retrieve commands.

## Hardware Requirements

*   An ESP32 board (recommended for command polling and potentially more complex logic). ESP8266 can also work for sensor data submission.
*   Sensors (e.g., DHT11/DHT22, water leak sensor).
*   Jumper wires and a breadboard.

## Next.js API Endpoints

### 1. Receiving Sensor Data
*   **Endpoint**: `/api/sensor-data`
*   **Method**: `POST`
*   **Expected JSON Payload**:
    ```json
    {
      "deviceId": "your_unique_device_id",
      "temperature": 25.5, // Optional, in Celsius
      "humidity": 60.2,   // Optional, in %
      "waterLeak": false, // Optional
      "timestamp": "2023-10-27T10:30:00Z" // Optional, ISO 8601 format (YYYY-MM-DDTHH:mm:ssZ)
    }
    ```

### 2. Fetching Device Commands
*   **Endpoint**: `/api/device-command/[deviceId]` (replace `[deviceId]` with your actual device ID)
*   **Method**: `GET`
*   **Example Response (if command exists)**:
    ```json
    {
      "command": "OFF", // or "ON"
      "timestamp": "2023-10-28T12:00:00Z",
      "parameters": {} // Optional additional parameters
    }
    ```
*   **Example Response (no command)**:
    ```json
    {
      "message": "No pending commands for device your_device_id."
    }
    ```

## Example ESP32 Code (Adapted for Sensor Data & Basic Command Polling)

**Ensure you have the necessary libraries installed in your Arduino IDE for ESP32:**
*   `WiFi.h`
*   `HTTPClient.h`
*   `ArduinoJson.h` (by Benoit Blanchon)
*   `time.h`

```cpp
#include <WiFi.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>
#include <time.h>

// WiFi Credentials
const char* ssid = "YOUR_WIFI_SSID";
const char* password = "YOUR_WIFI_PASSWORD";

// API Endpoints - CRITICAL: Use your computer's local IP if Next.js runs locally.
const char* sensorDataServerUrl = "http://YOUR_NEXTJS_APP_IP_OR_DOMAIN:PORT/api/sensor-data"; 
const char* commandServerBaseUrl = "http://YOUR_NEXTJS_APP_IP_OR_DOMAIN:PORT/api/device-command/"; 

// Device ID - Make this unique for each device
const char* deviceId = "esp32-living-room-01"; // Example

unsigned long lastSendTime = 0;
const unsigned long sendInterval = 30000; // Send data every 30 seconds

unsigned long lastCommandCheckTime = 0;
const unsigned long commandCheckInterval = 10000; // Check for commands every 10 seconds

// Relay pin (example, if controlling a relay)
// const int relayPin = D5; // Adjust to your ESP32 pin

void connectToWiFi() {
  Serial.print("Connecting to WiFi: ");
  Serial.println(ssid);
  WiFi.begin(ssid, password);

  int attemptCount = 0;
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
    attemptCount++;
    if (attemptCount > 20) {
        Serial.println("\nFailed to connect to WiFi.");
        return;
    }
  }
  Serial.println("\nWiFi connected!");
  Serial.print("IP Address: ");
  Serial.println(WiFi.localIP());
}

void configureTime() {
    configTime(0, 0, "pool.ntp.org", "time.nist.gov");
    Serial.print("Waiting for NTP time sync: ");
    time_t now = time(nullptr);
    while (now < 8 * 3600 * 2) {
        delay(500);
        Serial.print(".");
        now = time(nullptr);
    }
    Serial.println("\nTime synchronized");
}

void sendSensorData(float temp, float hum, bool leakDetected) {
  if (WiFi.status() == WL_CONNECTED) {
    HTTPClient http;
    
    if (!http.begin(sensorDataServerUrl)) { 
      Serial.printf("[HTTP-Sensor] Unable to connect to %s\n", sensorDataServerUrl);
      return;
    }

    http.addHeader("Content-Type", "application/json");

    StaticJsonDocument<256> doc;
    doc["deviceId"] = deviceId;
    if (!isnan(temp)) doc["temperature"] = temp;
    if (!isnan(hum)) doc["humidity"] = hum;
    doc["waterLeak"] = leakDetected;

    time_t now_time;
    time(&now_time);
    char timestamp[30];
    strftime(timestamp, sizeof(timestamp), "%Y-%m-%dT%H:%M:%SZ", gmtime(&now_time));
    doc["timestamp"] = timestamp;
    
    String requestBody;
    serializeJson(doc, requestBody);
    
    Serial.print("[HTTP-Sensor] POST JSON: ");
    Serial.println(requestBody);

    int httpCode = http.POST(requestBody);

    if (httpCode > 0) {
      Serial.printf("[HTTP-Sensor] POST... code: %d\n", httpCode);
      String payload = http.getString();
      Serial.println("Received response:");
      Serial.println(payload);
    } else {
      Serial.printf("[HTTP-Sensor] POST... failed, error: %s\n", http.errorToString(httpCode).c_str());
    }
    http.end();
  } else {
    Serial.println("WiFi Disconnected - Cannot send sensor data");
  }
}

void checkAndProcessCommands() {
  if (WiFi.status() == WL_CONNECTED) {
    HTTPClient http;
    String commandUrl = String(commandServerBaseUrl) + String(deviceId);

    Serial.print("[HTTP-Command] Checking for commands at: ");
    Serial.println(commandUrl);

    if (!http.begin(commandUrl.c_str())) {
      Serial.println("[HTTP-Command] Unable to connect.");
      return;
    }

    int httpCode = http.GET();
    if (httpCode > 0) {
      Serial.printf("[HTTP-Command] GET... code: %d\n", httpCode);
      String payload = http.getString();
      Serial.println("Received command payload: " + payload);

      StaticJsonDocument<256> doc;
      DeserializationError error = deserializeJson(doc, payload);

      if (error) {
        Serial.print("deserializeJson() failed for command: ");
        Serial.println(error.c_str());
        // Could be "No pending commands" message, which is not an error for command processing
        if (payload.indexOf("No pending commands") == -1) {
             // It's a real parsing error
        }
      } else {
        const char* command = doc["command"]; // "ON" or "OFF"
        if (command) {
          Serial.print("Received command: ");
          Serial.println(command);
          if (strcmp(command, "ON") == 0) {
            Serial.println("Executing ON command (e.g., turn relay ON)");
            // digitalWrite(relayPin, HIGH); 
            // TODO: Add your device ON logic here
          } else if (strcmp(command, "OFF") == 0) {
            Serial.println("Executing OFF command (e.g., turn relay OFF)");
            // digitalWrite(relayPin, LOW);
            // TODO: Add your device OFF logic here

            // Conceptual: If auto-shutdown due to leak/temp, this OFF command confirms it.
            // You might want to clear the server-side command after processing it here
            // by making another POST to a "command-ack" endpoint (more advanced).
          }
        }
      }
    } else {
      Serial.printf("[HTTP-Command] GET... failed, error: %s\n", http.errorToString(httpCode).c_str());
    }
    http.end();
  } else {
    Serial.println("WiFi Disconnected - Cannot check for commands");
  }
}

// Auto-shutdown logic (conceptual, needs to be integrated with sensor readings)
// This function would be called from loop() if conditions are met
void handleAutoShutdown(float temperature, bool waterLeak) {
    static unsigned long criticalStateStartTime = 0;
    static bool inCriticalState = false;
    const unsigned long shutdownDelay = 60000; // 60 seconds

    bool isCurrentlyCritical = (waterLeak || (temperature > 40.0)); // Example critical temp

    if (isCurrentlyCritical && !inCriticalState) {
        // Entered critical state
        inCriticalState = true;
        criticalStateStartTime = millis();
        Serial.println("CRITICAL STATE DETECTED! Auto-shutdown timer started.");
        // Send an immediate alert if possible (or rely on next sensor data post)
    } else if (!isCurrentlyCritical && inCriticalState) {
        // Exited critical state
        inCriticalState = false;
        Serial.println("Critical state resolved.");
    }

    if (inCriticalState && (millis() - criticalStateStartTime >= shutdownDelay)) {
        Serial.println("AUTO-SHUTDOWN TRIGGERED! Turning device OFF.");
        // digitalWrite(relayPin, LOW); // Or your specific shutdown logic
        // Consider sending a final status update to the server
        sendSensorData(temperature, NAN, waterLeak); // NAN for humidity if not relevant
        inCriticalState = false; // Reset state after shutdown
        // Potentially, the device might need a manual restart or a remote "ON" command
        // after an auto-shutdown.
    }
}


void setup() {
  Serial.begin(115200);
  delay(1000); 

  // pinMode(relayPin, OUTPUT); // Initialize relay pin if used
  // digitalWrite(relayPin, LOW); // Default to OFF

  connectToWiFi();

  if (WiFi.status() == WL_CONNECTED) {
    configureTime();
  }
  
  Serial.println("Setup complete. Device ready.");
}

void loop() {
  unsigned long currentTime = millis();

  // --- Read your sensor data here ---
  // Replace with actual sensor readings
  float temperature = 20.0 + (rand() % 100) / 10.0; 
  float humidity = 40.0 + (rand() % 300) / 10.0;    
  bool waterLeak = (rand() % 20) < 2; // 10% chance of water leak for testing

  // Handle auto-shutdown logic if conditions are met (for Premium/Enterprise functionality)
  // This logic should be enabled on the ESP32 if the device is meant for such plans.
  // handleAutoShutdown(temperature, waterLeak); // Uncomment and adapt if needed

  // Send sensor data periodically
  if (currentTime - lastSendTime >= sendInterval) {
    lastSendTime = currentTime;
    Serial.printf("Sending data: Temp=%.1f, Hum=%.0f, Leak=%s\n", temperature, humidity, waterLeak ? "true" : "false");
    sendSensorData(temperature, humidity, waterLeak);
  }

  // Check for commands periodically
  if (currentTime - lastCommandCheckTime >= commandCheckInterval) {
    lastCommandCheckTime = currentTime;
    checkAndProcessCommands();
  }
}
```

**Key Considerations for Arduino/ESP32:**
*   **Local Development URL**: Your ESP32 must use the local IP address of the computer running Next.js.
*   **Command Polling**: The example `checkAndProcessCommands()` function shows basic polling. For more responsive commands, consider WebSockets or MQTT if your project scales. The current polling method might have a delay up to `commandCheckInterval`.
*   **Auto-Shutdown Logic**: The `handleAutoShutdown` function is a conceptual starting point. You'll need to integrate it with your actual sensor reading logic and device control (e.g., a relay). The decision for the ESP32 to *have* this feature could be hardcoded or, more advanced, configured via a setting fetched from your server at startup.
*   **Error Handling & Robustness**: Add more comprehensive error handling and retry mechanisms in production.
*   **Security**: Use HTTPS and API keys for production if exposed to the internet.

Remember to replace placeholder values in the Arduino code.
