import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, statusColors } from '../theme/colors';

interface LoanCardProps {
    loan: {
        id: string;
        quantity: number;
        status: string;
        borrowDate: string;
        returnDate?: string | null;
        item: {
            id: string;
            name: string;
            image?: string | null;
            stock: number;
        };
    };
    onReturn?: () => void;
}

export default function LoanCard({ loan, onReturn }: LoanCardProps) {
    const statusStyle = statusColors[loan.status] || statusColors.PENDING;
    const canReturn = loan.status === 'APPROVED';

    const formatDate = (dateStr: string) => {
        const date = new Date(dateStr);
        return date.toLocaleDateString('id-ID', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
        });
    };

    return (
        <View style={styles.card}>
            <View style={styles.header}>
                <View style={styles.itemInfo}>
                    <Ionicons name="cube" size={20} color={colors.primary} />
                    <Text style={styles.itemName} numberOfLines={1}>{loan.item.name}</Text>
                </View>
                <View style={[styles.statusBadge, { backgroundColor: statusStyle.bg }]}>
                    <Text style={[styles.statusText, { color: statusStyle.text }]}>
                        {loan.status}
                    </Text>
                </View>
            </View>

            <View style={styles.details}>
                <View style={styles.detailRow}>
                    <Ionicons name="layers-outline" size={16} color={colors.textMuted} />
                    <Text style={styles.detailText}>Jumlah: {loan.quantity}</Text>
                </View>
                <View style={styles.detailRow}>
                    <Ionicons name="calendar-outline" size={16} color={colors.textMuted} />
                    <Text style={styles.detailText}>Pinjam: {formatDate(loan.borrowDate)}</Text>
                </View>
                {loan.returnDate && (
                    <View style={styles.detailRow}>
                        <Ionicons name="checkmark-circle-outline" size={16} color={colors.textMuted} />
                        <Text style={styles.detailText}>Kembali: {formatDate(loan.returnDate)}</Text>
                    </View>
                )}
            </View>

            {canReturn && onReturn && (
                <TouchableOpacity style={styles.returnButton} onPress={onReturn} activeOpacity={0.7}>
                    <Ionicons name="return-down-back" size={18} color={colors.white} />
                    <Text style={styles.returnButtonText}>Kembalikan</Text>
                </TouchableOpacity>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    card: {
        backgroundColor: colors.surface,
        borderRadius: 16,
        padding: 16,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: colors.border,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    itemInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        flex: 1,
        marginRight: 8,
    },
    itemName: {
        fontSize: 16,
        fontWeight: '700',
        color: colors.textPrimary,
        flex: 1,
    },
    statusBadge: {
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 20,
    },
    statusText: {
        fontSize: 12,
        fontWeight: '700',
        letterSpacing: 0.5,
    },
    details: {
        gap: 6,
    },
    detailRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    detailText: {
        fontSize: 14,
        color: colors.textSecondary,
    },
    returnButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        backgroundColor: colors.primary,
        paddingVertical: 12,
        borderRadius: 12,
        marginTop: 14,
    },
    returnButtonText: {
        color: colors.white,
        fontSize: 15,
        fontWeight: '600',
    },
});
