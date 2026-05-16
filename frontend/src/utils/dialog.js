// Alert.alert 는 RN 네이티브(iOS/Android) 전용. Expo Web 에선 동작하지 않아
// "결제하기" 같은 onPress 콜백이 영원히 실행되지 않는다. Platform 분기로 격리.
import { Alert, Platform } from 'react-native';

export const notify = (title, message) => {
  if (Platform.OS === 'web') {
    window.alert(message ? `${title}\n\n${message}` : title);
  } else {
    Alert.alert(title, message);
  }
};

export const confirmAction = (title, message, onConfirm, options = {}) => {
  const {
    confirmText = '확인',
    cancelText = '취소',
    destructive = false,
    onCancel,
  } = options;

  if (Platform.OS === 'web') {
    if (window.confirm(message ? `${title}\n\n${message}` : title)) {
      onConfirm && onConfirm();
    } else {
      onCancel && onCancel();
    }
    return;
  }

  Alert.alert(title, message, [
    { text: cancelText, style: 'cancel', onPress: onCancel },
    {
      text: confirmText,
      onPress: onConfirm,
      style: destructive ? 'destructive' : 'default',
    },
  ]);
};
