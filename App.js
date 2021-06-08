import React from 'react';
import type {Node} from 'react';
import {
  Button,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  useColorScheme,
  View,
  PermissionsAndroid,
} from 'react-native';

import WifiManager from "react-native-wifi-reborn";
import * as RNFS from 'react-native-fs';
import moment from 'moment';


const get_wifi_data = async (WifiData) => {
  const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        {
          title: 'Location permission is required for WiFi connections',
          message:
            'This app needs location permission as this is required  ' +
            'to scan for wifi networks.',
          buttonNegative: 'DENY',
          buttonPositive: 'ALLOW',
        },
  );
  if (granted === PermissionsAndroid.RESULTS.GRANTED) {
      WifiManager.loadWifiList().then(
        Entries => {
          for (let entry of Entries) {
            console.log(`${entry.BSSID},${entry.SSID},${entry.level},${moment().valueOf()}`);
            let new_entry = `${entry.BSSID},${entry.SSID},${entry.level},${moment().valueOf()}`;
            WifiData.data = `${WifiData.data}${new_entry}\n`;
          }
          console.log("\n");
        },
        () => {
          console.log("Cannot get current SSID!");
        }
      );
  } else {
      // Permission denied
      console.log("Location permission Denied")
  }
}

const writeCSV = async (savePath, contents) => {
  const granted1 = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
        {
          title: 'Write external storage permission is required',
          message:
            'This app needs Write external storage permission as this is required  ' +
            'to Save data into CSV file.',
          buttonNegative: 'DENY',
          buttonPositive: 'ALLOW',
        },
  );

  if (granted1 === PermissionsAndroid.RESULTS.GRANTED) {
    console.log("file access permission granted")
    RNFS.writeFile(savePath, contents, 'utf8').then(res => {
        console.log("SUCCESS!!");
        alert(savePath);
    })
    .catch(err => {
        console.error(err.message, err.code);
    });
  } else {
      // Permission denied
      console.log("Write permission Denied")
  }  
}

const App: () => Node = () => {
  
  var myInterval;
  var WifiData = {
    header: "BSSID, SSID, RSSI_value, timestamp",
    data: ""
  };

  function onStartButton() {
    console.log("Scanning started.!")
    myInterval = setInterval(()=> {get_wifi_data(WifiData);}, 2000);
  }

  function onStopButton() {
    clearInterval(myInterval);
    console.log("Scanning stopped.!\n")

    let suffix = moment().format("YYYYMMDD_HHmmss");
    // let savePath = `${RNFS.ExternalStorageDirectoryPath}/data/wifi_data_${suffix}.csv`;
    let savePath = `${RNFS.ExternalDirectoryPath}/wifi_data_${suffix}.csv`
    let contents = `${WifiData.header}\n${WifiData.data}`;

    writeCSV(savePath, contents);
  }

  return (
    <View style={styles.container}>
      <View style={styles.buttonContainer}>
        <Button
          onPress={onStartButton}
          title="Start"
        />
      </View>
      <View style={styles.buttonContainer}>
        <Button
          onPress={onStopButton}
          title="Stop"
          color="#841584"
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
   flex: 1,
   justifyContent: 'center',
  },
  buttonContainer: {
    margin: 20
  },
  alternativeLayoutButtonContainer: {
    margin: 20,
    flexDirection: 'row',
    justifyContent: 'space-between'
  }
});

export default App;
