import { BleClient, numberToUUID } from "@capacitor-community/bluetooth-le";
import { Preferences } from "@capacitor/preferences";
import { Directory, Filesystem, Encoding } from "@capacitor/filesystem";

const DEVICE_ID = "device_id" // Preference for Device Wearable ID.

// BLE Service and Characteristic UUIDs
const HRV_SERVICE = numberToUUID(0x180F); // Bluetooth Low Energy HRV Metric Service UUID
const HRV_CHARACTERISTIC = numberToUUID(0x2A19); // Bluetooth Low Energy Characteristic UUID (receive HRV records from device wearable)
const ERROR_CHARACTERISTIC = numberToUUID(0x2A1A); // Bluetooth Low Energy Characteristic UUID (receive error codes from device wearable)
const REQUEST_CHARACTERISTIC = numberToUUID(0x2A1B); // Bluetooth Low Energy Characteristic UUID (send data requests to device wearable)

await BleClient.initialize(); // Start the BleClient at the beginning of the program

/* 
 * Hook responsible for handling and maintaining connections with the device wearable. 
 * Takes in callbacks array, which assigns these functions to occur when their respective BLE characteristic is written to by the device wearable
 */   
export const dataHook = async (callbacks:Array<(value:DataView) => void>) => {
    try {
        var connected = false; // Bluetooth connection state
        var id: string; // BLE peripheral device id (the Device Wearable)

        // While not connected:
        do {
            
            // Check the saved preference for a Device Wearable ID
            const {value} = await Preferences.get({key: DEVICE_ID});

            if (value) {
                // If there is a Device Wearable ID stored in preferences, use the saved ID
                id = value;
            }
            else {
                // Else, Search for a device to connect to and save its ID to the preference.
                const device = await BleClient.requestDevice({
                    services: [HRV_SERVICE]
                })
                
                id = device.deviceId;
                await Preferences.set( {key: DEVICE_ID, value: id});
            }
            
            // Attempt to connect to the device wearable 5 times.
            var attempts = 0;
            while (!connected && attempts < 5) {
                try {
                    await BleClient.connect(id, () => onDisconnect());
                    connected = true;

                } catch (error) {
                    attempts++;
                }
            }

            // If the Device Wearable fails to connect, clear the saved ID preference
            if (!connected) {
                await Preferences.remove({key: DEVICE_ID});
            }

        } while (!connected);

        // Start Notifications for the HRV and Error Characteristics
        // Updates to the HRV Characteristic should trigger the first callback
        // Updates to the Error Characteristic should trigger the second callback 
        await BleClient.startNotifications(
            id,
            HRV_SERVICE,
            HRV_CHARACTERISTIC,
            callbacks[0]
        );

        await BleClient.startNotifications(
            id,
            HRV_SERVICE,
            ERROR_CHARACTERISTIC,
            callbacks[1]
        );
        
        // TODO: save the current last record read to effeciently recall records.
        // Get the time stamp for last week
        const lastWeekDate = new Date(Date.now() - 6.048e+8);
        
        /* 
         * Pack the Request Characteristic into its format
         * 
         * YYMD
         * Y: Year: uint16
         * M: Month: uint8
         * D: Day: uint8
         * 
         * Arduino is little endian, so read and write to the DataView with the little endian flag set for multibyte datatypes.
         */
        
        // Create an ArrayBuffer
        const buffer = new ArrayBuffer(4);
        
        // Create a DataView for bit manipulation
        const view = new DataView(buffer);
        
        // Format the request data into the DataView
        view.setUint16(0, lastWeekDate.getUTCFullYear(), true);
        view.setUint8(2, lastWeekDate.getUTCMonth());
        view.setUint8(3, lastWeekDate.getUTCDate());
        
        // Write a Records Request to the Request Characteristic
        await BleClient.write(
            id,
            HRV_SERVICE,
            REQUEST_CHARACTERISTIC,
            view
        )


    } catch (error) {
        // Log errors to console
        console.error(error);
        
        // TODO: Put Local notification

        // Reset the dataHook after 30 seconds
        setTimeout(() => dataHook(callbacks), 30000);
    }

    // Callback for when the BleClient disconnects. Resets the dataHook.
    function onDisconnect(): void {
        dataHook(callbacks);
    }
}

/*
 * Retrieves records from device application storage. 
 * Takes in an amount of seconds, which denotes how long ago to look back. 
 * Returns the found records in an array.
 */
export const fetchRecords = async(timePeriod:number): Promise<number[][]> => {
    var rawData = ""; // String holding the raw content of all the files the function reads.

    const endingTimestamp = Date.now(); // Timestamp to stop search, the current timestamp

    const startTimestamp = endingTimestamp - timePeriod*1000; // Starting timestamp is {timePeriod} seconds ago

    console.log(startTimestamp);
    console.log(endingTimestamp);

    var currentTimestamp = startTimestamp; // The current timestamp as the loop control variable.
    
    while (currentTimestamp < endingTimestamp) {
        // Get the currentTimestamp's year, month, and day to make the HRV day data file filename
        const currentDatetime = new Date(currentTimestamp); 
        
        const year = currentDatetime.getUTCFullYear().toString().padStart(4, '0');
        const month = (currentDatetime.getUTCMonth()+1).toString().padStart(2, '0');
        const day = currentDatetime.getUTCDate().toString().padStart(2, '0');

        const filename = `HRV-${year}${month}${day}.txt`;
        
        // Attempt to read from the current day data file
        // If it exist, append its content to the raw data string
        // Else, log FileNotFound error
        try {
            const contents = await Filesystem.readFile({
                path: filename,
                directory: Directory.Data,
                encoding: Encoding.UTF8,
            });
            rawData += contents.data
        } catch (error) {
            console.error(`${filename} doesn't exist`)
        }

        // Increment timestamp by 1 day
        currentTimestamp += 8.64e+7;
    }

    var records: number[][] = []; // Formatted Records array
    
    // If there is data, parse it. 
    if (rawData != ""){
        
        // Split each record (separated by newline character) and split numbers within each record (separated by a single space) 
        const allRecords = rawData.split("\n").map(element => element.split(' ').map(e => Number(e)));
        
        // Remove records with timestamps outside of the range [startTimestamp, endingTimestamp]
        records = allRecords.filter((row) => row[0] >= startTimestamp && row[0] <= endingTimestamp);

        // Sort records for convenience.
        records.sort((record1, record2) => record1[0] - record2[1]);
    }

    return records;
}
