import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';

const CustomButton = ({ title, onPress, loading, color, textColor }) => {
  return (
    <TouchableOpacity
      style={[styles.button, { backgroundColor: color || '#1a73e8' }]}
      onPress={onPress}
      disabled={loading}
    >
      {loading ? (
        <ActivityIndicator color={textColor || '#fff'} />
      ) : (
        <Text style={[styles.text, { color: textColor || '#fff' }]}>
          {title}
        </Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    padding: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginVertical: 8,
  },
  text: {
    fontSize: 16,
    fontWeight: '600',
  },
});

export default CustomButton;