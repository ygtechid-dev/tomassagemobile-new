import React, { useState } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { WebView } from 'react-native-webview';

const LiveChat = () => {
  const [isLoading, setIsLoading] = useState(true); // State to manage loading

  const handleLoadStart = () => {
    setIsLoading(true); // Set loading to true when starting to load
  };

  const handleLoadEnd = () => {
    setIsLoading(false); // Set loading to false when the WebView finishes loading
  };
console.log('load', isLoading);

  return (
    <View style={styles.container}>
      {isLoading && (
        <ActivityIndicator size="large" color="#4CAF50" style={styles.loadingIndicator} />
      )}
      <WebView
        source={{ uri: 'https://tawk.to/chat/672786b32480f5b4f598110a/1ibp6cbt2' }}
        onLoadStart={handleLoadStart} // Set loading to true when starting to load
        onLoadEnd={handleLoadEnd} // Set loading to false when finished loading
        style={styles.webview}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  loadingIndicator: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    marginLeft: -20,
    marginTop: -20,
  },
  webview: {
    flex: 1,
  },
});

export default LiveChat;
