import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { getImageUrl } from '../api/client';

interface ItemCardProps {
    item: {
        id: string;
        name: string;
        description: string;
        stock: number;
        image?: string | null;
        _count?: { loans: number };
    };
    onPress: () => void;
}

export default function ItemCard({ item, onPress }: ItemCardProps) {
    const isOutOfStock = item.stock <= 0;

    return (
        <TouchableOpacity
            style={[styles.card, isOutOfStock && styles.cardDisabled]}
            onPress={onPress}
            activeOpacity={0.7}
        >
            {getImageUrl(item.image) ? (
                <Image source={{ uri: getImageUrl(item.image)! }} style={styles.image} resizeMode="cover" />
            ) : (
                <View style={styles.imagePlaceholder}>
                    <Ionicons name="cube-outline" size={40} color={colors.textMuted} />
                </View>
            )}
            <View style={styles.content}>
                <Text style={styles.name} numberOfLines={1}>{item.name}</Text>
                <Text style={styles.description} numberOfLines={2}>{item.description}</Text>
                <View style={styles.footer}>
                    <View style={[styles.stockBadge, isOutOfStock && styles.stockBadgeEmpty]}>
                        <Ionicons
                            name={isOutOfStock ? 'close-circle' : 'checkmark-circle'}
                            size={14}
                            color={isOutOfStock ? colors.rejected : colors.approved}
                        />
                        <Text style={[styles.stockText, isOutOfStock && styles.stockTextEmpty]}>
                            {isOutOfStock ? 'Habis' : `Stok: ${item.stock}`}
                        </Text>
                    </View>
                </View>
            </View>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    card: {
        backgroundColor: colors.surface,
        borderRadius: 16,
        overflow: 'hidden',
        marginBottom: 16,
        borderWidth: 1,
        borderColor: colors.border,
    },
    cardDisabled: {
        opacity: 0.6,
    },
    image: {
        width: '100%',
        height: 160,
    },
    imagePlaceholder: {
        width: '100%',
        height: 120,
        backgroundColor: colors.surfaceLight,
        justifyContent: 'center',
        alignItems: 'center',
    },
    content: {
        padding: 16,
    },
    name: {
        fontSize: 18,
        fontWeight: '700',
        color: colors.textPrimary,
        marginBottom: 4,
    },
    description: {
        fontSize: 14,
        color: colors.textSecondary,
        lineHeight: 20,
        marginBottom: 12,
    },
    footer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    stockBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.approvedBg,
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 20,
        gap: 4,
    },
    stockBadgeEmpty: {
        backgroundColor: colors.rejectedBg,
    },
    stockText: {
        fontSize: 13,
        fontWeight: '600',
        color: colors.approved,
    },
    stockTextEmpty: {
        color: colors.rejected,
    },
});
