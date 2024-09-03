// helpers.js

import NetInfo from '@react-native-community/netinfo';

export async function getLocalIpAddress() {
  try {
    const networkState = await NetInfo.fetch();
    if (networkState.isConnected && networkState.type === 'wifi') {
      const localIp = networkState.details.ipAddress;
      return localIp;
    }
    return null; // Return null if not connected to Wi-Fi
  } catch (error) {
    console.error('Error fetching local IP address:', error);
    return null;
  }
}
