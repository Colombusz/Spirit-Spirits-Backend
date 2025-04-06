import axios from 'axios';

export async function sendPushNotification(pushToken, message, title) {
    const body = {
      to: pushToken,  // The Expo Push Token of the recipient
      sound: 'default',
      title: title,
      body: message,  // The message body of the notification
      data: {
        customData: 'some data to be used in the app',  // Custom data to pass to the app
      },
    };

    try {
      const response = await axios.post('https://exp.host/--/api/v2/push/send', body, {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      console.log('Push Notification sent:', response.data);
      
    } catch (error) {
      console.error('Error sending push notification:', error);
      throw error;
    }
}
