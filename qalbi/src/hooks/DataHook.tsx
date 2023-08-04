import { BleClient, numberToUUID } from "@capacitor-community/bluetooth-le";
import { Preferences } from "@capacitor/preferences";
import { Directory, Filesystem, Encoding } from "@capacitor/filesystem";

const DEVICE_ID = "device_id" // Preference for Device Wearable ID.

// BLE Service and Characteristic UUIDs
export const HRV_SERVICE = numberToUUID(0x180F);
export const HRV_CHARACTERISTIC = numberToUUID(0x2A19);
export const ERROR_CHARACTERISTIC = numberToUUID(0x2A1A);
export const REQUEST_CHARACTERISTIC = numberToUUID(0x2A1B);

await BleClient.initialize(); // Start the BleClient

export const dataHook = async (callbacks:Array<(value:DataView) => void>) => {
    try {
        var connected = false;
        var id: string;

        do {
            const {value} = await Preferences.get({key: DEVICE_ID});

            if (value) {
                id = value;
            }
            else {
                const device = await BleClient.requestDevice({
                    services: [HRV_SERVICE]
                })
                
                id = device.deviceId;
                await Preferences.set( {key: DEVICE_ID, value: id});
            }
            
            var attempts = 0;
            while (!connected && attempts < 5) {
                try {
                    await BleClient.connect(id, () => onDisconnect());
                    connected = true;

                } catch (error) {
                    attempts++;
                }
            }

            if (!connected) {
                await Preferences.remove({key: DEVICE_ID});
            }

        } while (!connected);

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

        const lastWeekDate = new Date(Date.now() - 6.048e+8);

        // Create an ArrayBuffer
        const buffer = new ArrayBuffer(8);
        
        // Create a view
        const view = new DataView(buffer);
        
        // Write Request
        view.setUint16(0, lastWeekDate.getUTCFullYear(), true);
        view.setUint8(2, lastWeekDate.getUTCMonth());
        view.setUint8(3, lastWeekDate.getUTCDate());

        await BleClient.write(
            id,
            HRV_SERVICE,
            REQUEST_CHARACTERISTIC,
            view
        )


    } catch (error) {
        console.error(error);
    }

    function onDisconnect(): void {
        dataHook(callbacks);
    }
}

export const fetchRecords = async(timePeriod:number): Promise<number[][]> => {
    var records: number[][] = [];

    var rawData = "";

    const endingTimestamp = Date.now();

    const startTimestamp = endingTimestamp - timePeriod*1000;

    console.log(startTimestamp);
    console.log(endingTimestamp);

    var currentTimestamp = startTimestamp;
    
    while (currentTimestamp < endingTimestamp) {
        const currentDatetime = new Date(currentTimestamp);
        
        const year = currentDatetime.getUTCFullYear().toString().padStart(4, '0');
        const month = (currentDatetime.getUTCMonth()+1) .toString().padStart(2, '0');
        const day = currentDatetime.getUTCDate().toString().padStart(2, '0');

        const filename = `HRV-${year}${month}${day}.txt`;
        
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

        currentTimestamp += 8.64e+7;
    }

    if (rawData != ""){
        const allRecords = rawData.split("\n").map(element => element.split(' ').map(e => Number(e)));
        records = allRecords.filter((row) => row[0] >= startTimestamp && row[0] <= endingTimestamp);

        records.sort((record1, record2) => record1[0] - record2[1]);
    }

    return records;
}
