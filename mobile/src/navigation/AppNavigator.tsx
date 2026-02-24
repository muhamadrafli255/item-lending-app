import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../contexts/AuthContext';
import { colors } from '../theme/colors';
import LoadingSpinner from '../components/LoadingSpinner';

// Screens
import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import ItemsScreen from '../screens/ItemsScreen';
import ItemDetailScreen from '../screens/ItemDetailScreen';
import LoansScreen from '../screens/LoansScreen';
import ProfileScreen from '../screens/ProfileScreen';

const AuthStack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();
const ItemsStack = createNativeStackNavigator();

function ItemsStackNavigator() {
    return (
        <ItemsStack.Navigator
            screenOptions={{
                headerStyle: { backgroundColor: colors.background },
                headerTintColor: colors.textPrimary,
                headerTitleStyle: { fontWeight: '700' },
            }}
        >
            <ItemsStack.Screen
                name="ItemsList"
                component={ItemsScreen}
                options={{ headerShown: false }}
            />
            <ItemsStack.Screen
                name="ItemDetail"
                component={ItemDetailScreen}
                options={{ title: 'Detail Barang' }}
            />
        </ItemsStack.Navigator>
    );
}

function MainTabs() {
    return (
        <Tab.Navigator
            screenOptions={({ route }) => ({
                headerShown: false,
                tabBarStyle: {
                    backgroundColor: colors.surface,
                    borderTopColor: colors.border,
                    borderTopWidth: 1,
                    height: 65,
                    paddingBottom: 10,
                    paddingTop: 8,
                },
                tabBarActiveTintColor: colors.primary,
                tabBarInactiveTintColor: colors.textMuted,
                tabBarLabelStyle: {
                    fontSize: 12,
                    fontWeight: '600' as const,
                },
                tabBarIcon: ({ focused, color }: { focused: boolean; color: string }) => {
                    let iconName: keyof typeof Ionicons.glyphMap = 'cube-outline';

                    if (route.name === 'Items') {
                        iconName = focused ? 'cube' : 'cube-outline';
                    } else if (route.name === 'Loans') {
                        iconName = focused ? 'document-text' : 'document-text-outline';
                    } else if (route.name === 'Profile') {
                        iconName = focused ? 'person' : 'person-outline';
                    }

                    return <Ionicons name={iconName} size={24} color={color} />;
                },
            })}
        >
            <Tab.Screen
                name="Items"
                component={ItemsStackNavigator}
                options={{ tabBarLabel: 'Barang' }}
            />
            <Tab.Screen
                name="Loans"
                component={LoansScreen}
                options={{ tabBarLabel: 'Peminjaman' }}
            />
            <Tab.Screen
                name="Profile"
                component={ProfileScreen}
                options={{ tabBarLabel: 'Profil' }}
            />
        </Tab.Navigator>
    );
}

export default function AppNavigator() {
    const { isAuthenticated, isLoading } = useAuth();

    if (isLoading) {
        return <LoadingSpinner />;
    }

    return (
        <NavigationContainer>
            {isAuthenticated ? (
                <MainTabs />
            ) : (
                <AuthStack.Navigator
                    screenOptions={{
                        headerShown: false,
                    }}
                >
                    <AuthStack.Screen name="Login" component={LoginScreen} />
                    <AuthStack.Screen name="Register" component={RegisterScreen} />
                </AuthStack.Navigator>
            )}
        </NavigationContainer>
    );
}
