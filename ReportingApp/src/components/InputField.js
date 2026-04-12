import React from 'react';
import { View, Text, TextInput, StyleSheet } from 'react-native';

const InputField = ({
  label,
  value,
  onChangeText,
  placeholder,
  secureTextEntry,
  keyboardType,
  multiline,
  numberOfLines,
  editable,
}) => {
  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}
      <TextInput
        style={[
          styles.input,
          multiline && { height: numberOfLines * 40, textAlignVertical: 'top' },
          editable === false && styles.disabled,
        ]}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        secureTextEntry={secureTextEntry}
        keyboardType={keyboardType || 'default'}
        multiline={multiline}
        numberOfLines={numberOfLines}
        editable={editable !== false}
        placeholderTextColor="#999"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 6,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
    marginBottom: 4,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    padding: 12,
    fontSize: 15,
    color: '#333',
    backgroundColor: '#fff',
  },
  disabled: {
    backgroundColor: '#f5f5f5',
    color: '#888',
  },
});

export default InputField;