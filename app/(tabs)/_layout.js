import { useRef, useEffect } from 'react';
import { Tabs } from 'expo-router';
import { BlurView } from 'expo-blur';
import { StyleSheet, View, TouchableOpacity, Animated } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useTheme } from '../../src/theme';

function TabItem({ route, isFocused, onPress, iconName, theme }) {
  const scale = useRef(new Animated.Value(isFocused ? 1.2 : 1)).current;
  const opacity = useRef(new Animated.Value(isFocused ? 1 : 0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(scale, {
        toValue: isFocused ? 1.15 : 1,
        useNativeDriver: true,
        friction: 5,
        tension: 100,
      }),
      Animated.timing(opacity, {
        toValue: isFocused ? 1 : 0,
        duration: 200,
        useNativeDriver: true,
      })
    ]).start();
  }, [isFocused]);

  const color = isFocused ? theme.primary : theme.textSecondary;
  const unselectedColor = theme.isDark ? '#E5E7EB' : '#4B5563'; // Make unselected icons highly visible

  return (
    <TouchableOpacity
      accessibilityRole="button"
      accessibilityState={isFocused ? { selected: true } : {}}
      onPress={onPress}
      style={styles.tabItem}
      activeOpacity={0.8}
    >
      <Animated.View style={[styles.iconContainer, { transform: [{ scale }] }]}>
        {/* Animated Background Circle */}
        <Animated.View 
          style={[
            StyleSheet.absoluteFill, 
            { 
              backgroundColor: theme.primary, 
              opacity: opacity, 
              borderRadius: 22 
            }
          ]} 
        />
        {/* Icon */}
        <Feather name={iconName} size={22} color={isFocused ? '#FFFFFF' : unselectedColor} style={{ zIndex: 1 }} />
      </Animated.View>
    </TouchableOpacity>
  );
}

function CustomTabBar({ state, descriptors, navigation }) {
  const theme = useTheme();

  return (
    <View style={[styles.tabBarWrapper, { borderColor: 'rgba(255, 255, 255, 0.15)', borderWidth: 1 }]}>
      <View style={[StyleSheet.absoluteFill, { borderRadius: 40, overflow: 'hidden' }]}>
        {/* Use dark tint for contrast, giving that sleek deep glass look */}
        <BlurView tint="dark" intensity={80} style={StyleSheet.absoluteFill} />
        {/* Very subtle white overlay */}
        <View style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(255, 255, 255, 0.05)' }]} />
      </View>
      <View style={styles.tabBarContent}>
        {state.routes.map((route, index) => {
          const isFocused = state.index === index;
          const onPress = () => {
            const event = navigation.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
            if (!isFocused && !event.defaultPrevented) navigation.navigate(route.name, route.params);
          };

          let iconName;
          if (route.name === 'revision') iconName = 'book-open';
          else if (route.name === 'home') iconName = 'home';
          else if (route.name === 'dashboard') iconName = 'pie-chart';

          return (
            <TabItem 
              key={route.key} 
              route={route} 
              isFocused={isFocused} 
              onPress={onPress} 
              iconName={iconName} 
              theme={theme} 
            />
          );
        })}
      </View>
    </View>
  );
}

export default function TabLayout() {
  const theme = useTheme();
  return (
    <Tabs
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{
        headerShown: false,
      }}
    >
      <Tabs.Screen name="revision" />
      <Tabs.Screen name="home" />
      <Tabs.Screen name="dashboard" />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBarWrapper: {
    position: 'absolute',
    bottom: 24,
    left: 40,
    right: 40,
    height: 64,
    borderRadius: 40,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.01)', // tiny alpha to force layer composition
  },
  tabBarContent: {
    flex: 1,
    flexDirection: 'row',
  },
  tabItem: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    width: 44,
    height: 44,
    borderRadius: 22,
    overflow: 'hidden',
  },
});
