// NotificationService.js
import PushNotification from 'react-native-push-notification';

// Configure the notification service
PushNotification.configure({
  onNotification: function (notification) {
    console.log('NOTIFICATION:', notification);
  },
  requestPermissions: true,
});

const createChannel = () => {
  PushNotification.createChannel(
    {
      channelId: 'medication-reminder', // (required)
      channelName: 'Medication Reminder', // (required)
      channelDescription: 'A channel to categorize medication reminder notifications', // (optional) default: undefined.
      soundName: 'default', // (optional) See `soundName` parameter of `localNotification` function
      importance: 4, // (optional) default: 4. Int value of the Android notification importance
      vibrate: true, // (optional) default: true. Creates the default vibration pattern if true.
    },
    (created) => console.log(`createChannel returned '${created}'`) // (optional) callback returns whether the channel was created, false means it already existed.
  );
};

const scheduleNotification = (date, message) => {
  PushNotification.localNotificationSchedule({
    channelId: 'medication-reminder',
    message: message, // (required)
    date: date, // (required) for scheduling notifications
  });
};

export { createChannel, scheduleNotification };
