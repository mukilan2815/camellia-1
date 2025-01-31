// src/components/MessageDialog.js
import React from 'react';
import { StyleSheet } from 'react-native';
import { Dialog, Portal, Button, Paragraph } from 'react-native-paper';

const MessageDialog = ({ visible, onDismiss, title, message, buttonLabel = 'OK' }) => {
  return (
    <Portal>
      <Dialog visible={visible} onDismiss={onDismiss} style={styles.dialog}>
        {title ? <Dialog.Title>{title}</Dialog.Title> : null}
        <Dialog.Content>
          <Paragraph>{message}</Paragraph>
        </Dialog.Content>
        <Dialog.Actions>
          <Button onPress={onDismiss}>{buttonLabel}</Button>
        </Dialog.Actions>
      </Dialog>
    </Portal>
  );
};

const styles = StyleSheet.create({
  dialog: {
    // Customize dialog styling if needed
  },
});

export default MessageDialog;
