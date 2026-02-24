import React, { useState, useCallback } from 'react';
import {
    View,
    Text,
    FlatList,
    StyleSheet,
    RefreshControl,
    TouchableOpacity,
    Alert,
    StatusBar,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { getLoans, returnLoan } from '../api/client';
import { colors } from '../theme/colors';
import LoanCard from '../components/LoanCard';
import LoadingSpinner from '../components/LoadingSpinner';

interface Loan {
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
}

type FilterType = 'ALL' | 'PENDING' | 'APPROVED' | 'RETURNED' | 'REJECTED';

const FILTERS: { key: FilterType; label: string }[] = [
    { key: 'ALL', label: 'Semua' },
    { key: 'PENDING', label: 'Pending' },
    { key: 'APPROVED', label: 'Aktif' },
    { key: 'RETURNED', label: 'Kembali' },
    { key: 'REJECTED', label: 'Ditolak' },
];

export default function LoansScreen() {
    const [loans, setLoans] = useState<Loan[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [filter, setFilter] = useState<FilterType>('ALL');

    const fetchLoans = async () => {
        try {
            const status = filter === 'ALL' ? undefined : filter;
            const data = await getLoans(status);
            setLoans(data);
        } catch (error) {
            console.error('Failed to fetch loans:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useFocusEffect(
        useCallback(() => {
            fetchLoans();
        }, [filter])
    );

    const handleReturn = (loan: Loan) => {
        Alert.alert(
            'Kembalikan Barang',
            `Kembalikan ${loan.quantity} ${loan.item.name}?`,
            [
                { text: 'Batal', style: 'cancel' },
                {
                    text: 'Kembalikan',
                    onPress: async () => {
                        try {
                            await returnLoan(loan.id);
                            Alert.alert('Berhasil', 'Barang berhasil dikembalikan');
                            fetchLoans();
                        } catch (error: any) {
                            const msg = error?.response?.data?.message || 'Gagal mengembalikan barang';
                            Alert.alert('Gagal', msg);
                        }
                    },
                },
            ]
        );
    };

    const onRefresh = () => {
        setRefreshing(true);
        fetchLoans();
    };

    if (loading) return <LoadingSpinner />;

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor={colors.background} />

            <View style={styles.header}>
                <Text style={styles.headerTitle}>Peminjaman Saya</Text>
                <Text style={styles.headerSubtitle}>{loans.length} peminjaman</Text>
            </View>

            {/* Filter Tabs */}
            <View style={styles.filterRow}>
                <FlatList
                    data={FILTERS}
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    keyExtractor={(item) => item.key}
                    contentContainerStyle={styles.filterList}
                    renderItem={({ item: f }) => (
                        <TouchableOpacity
                            style={[styles.filterChip, filter === f.key && styles.filterChipActive]}
                            onPress={() => { setFilter(f.key); setLoading(true); }}
                            activeOpacity={0.7}
                        >
                            <Text style={[styles.filterText, filter === f.key && styles.filterTextActive]}>
                                {f.label}
                            </Text>
                        </TouchableOpacity>
                    )}
                />
            </View>

            {/* Loan List */}
            <FlatList
                data={loans}
                keyExtractor={(item) => item.id}
                renderItem={({ item: loan }) => (
                    <LoanCard loan={loan} onReturn={() => handleReturn(loan)} />
                )}
                contentContainerStyle={styles.list}
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        tintColor={colors.primary}
                        colors={[colors.primary]}
                    />
                }
                ListEmptyComponent={
                    <View style={styles.empty}>
                        <Ionicons name="document-text-outline" size={60} color={colors.textMuted} />
                        <Text style={styles.emptyText}>Belum ada peminjaman</Text>
                    </View>
                }
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    header: {
        paddingHorizontal: 20,
        paddingTop: 16,
        paddingBottom: 8,
    },
    headerTitle: {
        fontSize: 28,
        fontWeight: '800',
        color: colors.textPrimary,
    },
    headerSubtitle: {
        fontSize: 14,
        color: colors.textSecondary,
        marginTop: 4,
    },
    filterRow: {
        marginVertical: 12,
    },
    filterList: {
        paddingHorizontal: 20,
        gap: 8,
    },
    filterChip: {
        paddingHorizontal: 18,
        paddingVertical: 8,
        borderRadius: 20,
        backgroundColor: colors.surface,
        borderWidth: 1,
        borderColor: colors.border,
    },
    filterChipActive: {
        backgroundColor: colors.primary,
        borderColor: colors.primary,
    },
    filterText: {
        fontSize: 14,
        fontWeight: '600',
        color: colors.textSecondary,
    },
    filterTextActive: {
        color: colors.white,
    },
    list: {
        paddingHorizontal: 20,
        paddingBottom: 20,
    },
    empty: {
        alignItems: 'center',
        marginTop: 80,
        gap: 16,
    },
    emptyText: {
        fontSize: 16,
        color: colors.textMuted,
    },
});
