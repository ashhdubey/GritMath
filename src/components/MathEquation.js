import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function MathEquation({ text, style, color, fontSize }) {
  // text can be like "2/3 + 2/5" or "15 × 5" or "4²"
  // We want to split by space, and process each token.
  
  if (!text) return null;
  
  const tokens = text.split(' ');
  
  return (
    <View style={styles.container}>
      {tokens.map((token, index) => {
        if (token.includes('/')) {
          // Render as fraction
          const [num, den] = token.split('/');
          return (
            <View key={index} style={styles.fractionContainer}>
              <Text style={[styles.text, style, { color, fontSize: fontSize || 42 }]}>{num}</Text>
              <View style={[styles.fractionLine, { backgroundColor: color, marginVertical: (fontSize || 42) * 0.05 }]} />
              <Text style={[styles.text, style, { color, fontSize: fontSize || 42 }]}>{den}</Text>
            </View>
          );
        }
        
        // Render as normal text (operator or whole number)
        return (
          <Text key={index} style={[styles.text, style, { color, fontSize: fontSize || 42, marginHorizontal: 8 }]}>
            {token}
          </Text>
        );
      })}
      
      {/* Append the = ? at the end always */}
      <Text style={[styles.text, style, { color, fontSize: fontSize || 42, marginHorizontal: 8 }]}>= ?</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    flexWrap: 'wrap',
  },
  fractionContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 4,
  },
  text: {
    fontWeight: '900',
    letterSpacing: -1,
    textAlign: 'center',
  },
  fractionLine: {
    width: '100%',
    height: 4,
    borderRadius: 2,
  }
});
