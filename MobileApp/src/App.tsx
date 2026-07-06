import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text } from 'react-native';

import { AppProvider } from './context/AppContext';
import StudyTimerScreen from './screens/StudyTimerScreen';
import DashboardScreen from './screens/DashboardScreen';
import CoachChatScreen from './screens/CoachChatScreen';
import PlannerScreen from './screens/PlannerScreen';
import MockTestScreen from './screens/MockTestScreen';
import ManualEntryScreen from './screens/ManualEntryScreen';
import SettingsScreen from './screens/SettingsScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const TimerStack = () => (
  <Stack.Navigator
    screenOptions={{
      headerStyle: { backgroundColor: '#0f172a' },
      headerTintColor: '#fff',
      headerTitleStyle: { fontWeight: 'bold' },
    }}
  >
    <Stack.Screen
      name="TimerHome"
      component={StudyTimerScreen}
      options={{ title: 'Study Timer' }}
    />
  </Stack.Navigator>
);

const DashboardStack = () => (
  <Stack.Navigator
    screenOptions={{
      headerStyle: { backgroundColor: '#0f172a' },
      headerTintColor: '#fff',
      headerTitleStyle: { fontWeight: 'bold' },
    }}
  >
    <Stack.Screen
      name="DashHome"
      component={DashboardScreen}
      options={{ title: 'Dashboard' }}
    />
  </Stack.Navigator>
);

const CoachStack = () => (
  <Stack.Navigator
    screenOptions={{
      headerStyle: { backgroundColor: '#0f172a' },
      headerTintColor: '#fff',
      headerTitleStyle: { fontWeight: 'bold' },
    }}
  >
    <Stack.Screen
      name="CoachHome"
      component={CoachChatScreen}
      options={{ title: 'AI Coach' }}
    />
  </Stack.Navigator>
);

const MoreStack = () => (
  <Stack.Navigator
    screenOptions={{
      headerStyle: { backgroundColor: '#0f172a' },
      headerTintColor: '#fff',
      headerTitleStyle: { fontWeight: 'bold' },
    }}
  >
    <Stack.Screen
      name="MoreHome"
      component={MoreScreen}
      options={{ title: 'More' }}
    />
    <Stack.Screen
      name="Planner"
      component={PlannerScreen}
      options={{ title: 'Study Planner' }}
    />
    <Stack.Screen
      name="MockTest"
      component={MockTestScreen}
      options={{ title: 'Mock Tests' }}
    />
    <Stack.Screen
      name="ManualEntry"
      component={ManualEntryScreen}
      options={{ title: 'Manual Entry' }}
    />
    <Stack.Screen
      name="Settings"
      component={SettingsScreen}
      options={{ title: 'Settings' }}
    />
  </Stack.Navigator>
);

const MoreScreen: React.FC<any> = ({ navigation }) => {
  const MenuItem = ({ label, icon, onPress }: any) => (
    <TouchableOpacity
      style={styles.menuItem}
      onPress={onPress}
    >
      <Text style={styles.menuIcon}>{icon}</Text>
      <Text style={styles.menuLabel}>{label}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.moreContainer}>
      <MenuItem
        label="Study Planner"
        icon="📚"
        onPress={() => navigation.navigate('Planner')}
      />
      <MenuItem
        label="Mock Tests"
        icon="📊"
        onPress={() => navigation.navigate('MockTest')}
      />
      <MenuItem
        label="Manual Entry"
        icon="✍️"
        onPress={() => navigation.navigate('ManualEntry')}
      />
      <MenuItem
        label="Settings"
        icon="⚙️"
        onPress={() => navigation.navigate('Settings')}
      />
    </View>
  );
};

const { View, TouchableOpacity } = require('react-native');
const styles = require('react-native').StyleSheet.create({
  moreContainer: {
    flex: 1,
    backgroundColor: '#0f172a',
    padding: 16,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1e293b',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#334155',
  },
  menuIcon: {
    fontSize: 28,
    marginRight: 16,
  },
  menuLabel: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

const App = () => {
  return (
    <AppProvider>
      <NavigationContainer>
        <Tab.Navigator
          screenOptions={{
            headerShown: false,
            tabBarStyle: {
              backgroundColor: '#0f172a',
              borderTopColor: '#334155',
              borderTopWidth: 1,
            },
            tabBarLabelStyle: {
              fontSize: 11,
              marginTop: 4,
            },
            tabBarActiveTintColor: '#4f46e5',
            tabBarInactiveTintColor: '#64748b',
          }}
        >
          <Tab.Screen
            name="Timer"
            component={TimerStack}
            options={{
              tabBarLabel: 'Timer',
              tabBarIcon: () => <Text>⏱️</Text>,
            }}
          />
          <Tab.Screen
            name="Dashboard"
            component={DashboardStack}
            options={{
              tabBarLabel: 'Dashboard',
              tabBarIcon: () => <Text>📊</Text>,
            }}
          />
          <Tab.Screen
            name="Coach"
            component={CoachStack}
            options={{
              tabBarLabel: 'Coach',
              tabBarIcon: () => <Text>🤖</Text>,
            }}
          />
          <Tab.Screen
            name="More"
            component={MoreStack}
            options={{
              tabBarLabel: 'More',
              tabBarIcon: () => <Text>⋯</Text>,
            }}
          />
        </Tab.Navigator>
      </NavigationContainer>
    </AppProvider>
  );
};

export default App;
