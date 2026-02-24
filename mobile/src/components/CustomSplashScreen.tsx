import React from 'react';
import { View, Text, StyleSheet, Animated, Easing } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';

export default function CustomSplashScreen() {
    const fadeAnim = React.useRef(new Animated.Value(0)).current;
    const scaleAnim = React.useRef(new Animated.Value(0.8)).current;

    React.useEffect(() => {
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 800,
                useNativeDriver: true,
            }),
            Animated.spring(scaleAnim, {
                toValue: 1,
                friction: 4,
                useNativeDriver: true,
            }),
        ]).start();
    }, [fadeAnim, scaleAnim]);

    return (
        <View style={styles.container}>
            <Animated.View
                style={[
                    styles.content,
                    {
                        opacity: fadeAnim,
                        transform: [{ scale: scaleAnim }]
                    }
                ]}
            >
                <View style={styles.iconContainer}>
                    <Ionicons name="cube" size={80} color={colors.primary} />
                </View>
                <Text style={styles.title}>LendGo</Text>
                <Text style={styles.subtitle}>Pinjam barang jadi lebih mudah</Text>
            </Animated.View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#0F0F1A', // Dark mode background
        justifyContent: 'center',
        alignItems: 'center',
    },
    content: {
        alignItems: 'center',
    },
    iconContainer: {
        width: 140,
        height: 140,
        borderRadius: 35,
        backgroundColor: 'rgba(0, 71, 255, 0.1)',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 24,
        borderWidth: 1,
        borderColor: 'rgba(0, 71, 255, 0.2)',
    },
    title: {
        fontSize: 40,
        fontWeight: '800',
        color: colors.white,
        letterSpacing: 1,
    },
    subtitle: {
        fontSize: 16,
        color: 'rgba(255, 255, 255, 0.6)',
        marginTop: 8,
    },
});
