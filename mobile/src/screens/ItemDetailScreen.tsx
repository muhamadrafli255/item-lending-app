import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    Image,
    TouchableOpacity,
    Alert,
    ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getItemDetail, createLoan, getImageUrl } from '../api/client';
import { colors } from '../theme/colors';
import LoadingSpinner from '../components/LoadingSpinner';

interface ItemDetail {
    id: string;
    name: string;
    description: string;
    stock: number;
    image?: string | null;
    createdAt: string;
    _count?: { loans: number };
}

export default function ItemDetailScreen({ route, navigation }: any) {
    const { itemId } = route.params;
    const [item, setItem] = useState<ItemDetail | null>(null);
    const [loading, setLoading] = useState(true);
    const [quantity, setQuantity] = useState(1);
    const [borrowing, setBorrowing] = useState(false);

    useEffect(() => {
        fetchItem();
    }, [itemId]);

    const fetchItem = async () => {
        try {
            const data = await getItemDetail(itemId);
            setItem(data);
        } catch (error) {
            Alert.alert('Error', 'Gagal mengambil detail barang');
            navigation.goBack();
        } finally {
            setLoading(false);
        }
    };

    const handleBorrow = async () => {
        if (!item) return;

        Alert.alert(
            'Konfirmasi Peminjaman',
            `Pinjam ${quantity} ${item.name}?`,
            [
                { text: 'Batal', style: 'cancel' },
                {
                    text: 'Pinjam',
                    onPress: async () => {
                        setBorrowing(true);
                        try {
                            await createLoan(item.id, quantity);
                            Alert.alert('Berhasil', 'Peminjaman berhasil diajukan! Menunggu persetujuan admin.', [
                                { text: 'OK', onPress: () => navigation.goBack() },
                            ]);
                        } catch (error: any) {
                            const msg = error?.response?.data?.message || 'Gagal mengajukan peminjaman';
                            Alert.alert('Gagal', msg);
                        } finally {
                            setBorrowing(false);
                        }
                    },
                },
            ]
        );
    };

    if (loading) return <LoadingSpinner />;
    if (!item) return null;

    const isOutOfStock = item.stock <= 0;

    return (
        <View style={styles.container}>
            <ScrollView showsVerticalScrollIndicator={false}>
                {/* Image */}
                {getImageUrl(item.image) ? (
                    <Image source={{ uri: getImageUrl(item.image)! }} style={styles.image} resizeMode="cover" />
                ) : (
                    <View style={styles.imagePlaceholder}>
                        <Ionicons name="cube-outline" size={80} color={colors.textMuted} />
                    </View>
                )}

                {/* Content */}
                <View style={styles.content}>
                    <Text style={styles.name}>{item.name}</Text>

                    <View style={styles.statsRow}>
                        <View style={[styles.statBadge, isOutOfStock ? styles.statBadgeRed : styles.statBadgeGreen]}>
                            <Ionicons
                                name={isOutOfStock ? 'close-circle' : 'checkmark-circle'}
                                size={18}
                                color={isOutOfStock ? colors.rejected : colors.approved}
                            />
                            <Text style={[styles.statText, { color: isOutOfStock ? colors.rejected : colors.approved }]}>
                                {isOutOfStock ? 'Stok Habis' : `Stok: ${item.stock}`}
                            </Text>
                        </View>
                        {item._count && (
                            <View style={styles.statBadge}>
                                <Ionicons name="swap-horizontal" size={18} color={colors.primary} />
                                <Text style={[styles.statText, { color: colors.primary }]}>
                                    {item._count.loans} peminjaman
                                </Text>
                            </View>
                        )}
                    </View>

                    <View style={styles.divider} />

                    <Text style={styles.sectionTitle}>Deskripsi</Text>
                    <Text style={styles.description}>{item.description}</Text>

                    {/* Quantity Picker */}
                    {!isOutOfStock && (
                        <>
                            <View style={styles.divider} />
                            <Text style={styles.sectionTitle}>Jumlah Pinjam</Text>
                            <View style={styles.quantityPicker}>
                                <TouchableOpacity
                                    style={[styles.qtyButton, quantity <= 1 && styles.qtyButtonDisabled]}
                                    onPress={() => setQuantity(Math.max(1, quantity - 1))}
                                    disabled={quantity <= 1}
                                >
                                    <Ionicons name="remove" size={24} color={quantity <= 1 ? colors.textMuted : colors.white} />
                                </TouchableOpacity>
                                <Text style={styles.qtyText}>{quantity}</Text>
                                <TouchableOpacity
                                    style={[styles.qtyButton, quantity >= item.stock && styles.qtyButtonDisabled]}
                                    onPress={() => setQuantity(Math.min(item.stock, quantity + 1))}
                                    disabled={quantity >= item.stock}
                                >
                                    <Ionicons name="add" size={24} color={quantity >= item.stock ? colors.textMuted : colors.white} />
                                </TouchableOpacity>
                            </View>
                        </>
                    )}
                </View>
            </ScrollView>

            {/* Bottom Action */}
            <View style={styles.bottomBar}>
                <TouchableOpacity
                    style={[styles.borrowButton, (isOutOfStock || borrowing) && styles.borrowButtonDisabled]}
                    onPress={handleBorrow}
                    disabled={isOutOfStock || borrowing}
                    activeOpacity={0.8}
                >
                    {borrowing ? (
                        <ActivityIndicator color={colors.white} />
                    ) : (
                        <>
                            <Ionicons name="hand-left" size={20} color={colors.white} />
                            <Text style={styles.borrowButtonText}>
                                {isOutOfStock ? 'Stok Habis' : `Pinjam (${quantity})`}
                            </Text>
                        </>
                    )}
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    image: {
        width: '100%',
        height: 260,
    },
    imagePlaceholder: {
        width: '100%',
        height: 200,
        backgroundColor: colors.surfaceLight,
        justifyContent: 'center',
        alignItems: 'center',
    },
    content: {
        padding: 20,
    },
    name: {
        fontSize: 26,
        fontWeight: '800',
        color: colors.textPrimary,
        marginBottom: 16,
    },
    statsRow: {
        flexDirection: 'row',
        gap: 12,
        flexWrap: 'wrap',
    },
    statBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        backgroundColor: colors.surfaceLight,
        paddingHorizontal: 14,
        paddingVertical: 8,
        borderRadius: 20,
    },
    statBadgeGreen: {
        backgroundColor: colors.approvedBg,
    },
    statBadgeRed: {
        backgroundColor: colors.rejectedBg,
    },
    statText: {
        fontSize: 14,
        fontWeight: '600',
    },
    divider: {
        height: 1,
        backgroundColor: colors.border,
        marginVertical: 20,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: colors.textPrimary,
        marginBottom: 8,
    },
    description: {
        fontSize: 15,
        color: colors.textSecondary,
        lineHeight: 24,
    },
    quantityPicker: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 24,
        marginTop: 12,
    },
    qtyButton: {
        width: 48,
        height: 48,
        borderRadius: 14,
        backgroundColor: colors.surface,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: colors.border,
    },
    qtyButtonDisabled: {
        opacity: 0.4,
    },
    qtyText: {
        fontSize: 28,
        fontWeight: '700',
        color: colors.textPrimary,
        minWidth: 40,
        textAlign: 'center',
    },
    bottomBar: {
        padding: 20,
        paddingBottom: 30,
        backgroundColor: colors.surface,
        borderTopWidth: 1,
        borderTopColor: colors.border,
    },
    borrowButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 10,
        backgroundColor: colors.primary,
        height: 56,
        borderRadius: 16,
    },
    borrowButtonDisabled: {
        opacity: 0.5,
    },
    borrowButtonText: {
        color: colors.white,
        fontSize: 17,
        fontWeight: '700',
    },
});
