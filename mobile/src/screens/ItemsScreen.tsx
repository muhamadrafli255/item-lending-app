import React, { useState, useCallback } from 'react';
import {
    View,
    Text,
    FlatList,
    StyleSheet,
    RefreshControl,
    TextInput,
    StatusBar,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { getItems } from '../api/client';
import { colors } from '../theme/colors';
import ItemCard from '../components/ItemCard';
import LoadingSpinner from '../components/LoadingSpinner';

interface Item {
    id: string;
    name: string;
    description: string;
    stock: number;
    image?: string | null;
    createdAt: string;
    _count?: { loans: number };
}

export default function ItemsScreen({ navigation }: any) {
    const [items, setItems] = useState<Item[]>([]);
    const [filteredItems, setFilteredItems] = useState<Item[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [search, setSearch] = useState('');

    const fetchItems = async () => {
        try {
            const data = await getItems();
            setItems(data);
            setFilteredItems(data);
        } catch (error) {
            console.error('Failed to fetch items:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useFocusEffect(
        useCallback(() => {
            fetchItems();
        }, [])
    );

    const handleSearch = (text: string) => {
        setSearch(text);
        if (text.trim()) {
            const filtered = items.filter(
                (item) =>
                    item.name.toLowerCase().includes(text.toLowerCase()) ||
                    item.description.toLowerCase().includes(text.toLowerCase())
            );
            setFilteredItems(filtered);
        } else {
            setFilteredItems(items);
        }
    };

    const onRefresh = () => {
        setRefreshing(true);
        fetchItems();
    };

    if (loading) return <LoadingSpinner />;

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor={colors.background} />

            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Daftar Barang</Text>
                <Text style={styles.headerSubtitle}>{items.length} barang tersedia</Text>
            </View>

            {/* Search */}
            <View style={styles.searchContainer}>
                <Ionicons name="search-outline" size={20} color={colors.textMuted} />
                <TextInput
                    style={styles.searchInput}
                    placeholder="Cari barang..."
                    placeholderTextColor={colors.textMuted}
                    value={search}
                    onChangeText={handleSearch}
                />
                {search.length > 0 && (
                    <Ionicons
                        name="close-circle"
                        size={20}
                        color={colors.textMuted}
                        onPress={() => handleSearch('')}
                    />
                )}
            </View>

            {/* Item List */}
            <FlatList
                data={filteredItems}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                    <ItemCard
                        item={item}
                        onPress={() => navigation.navigate('ItemDetail', { itemId: item.id })}
                    />
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
                        <Ionicons name="cube-outline" size={60} color={colors.textMuted} />
                        <Text style={styles.emptyText}>
                            {search ? 'Tidak ada barang ditemukan' : 'Belum ada barang'}
                        </Text>
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
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.surface,
        borderRadius: 14,
        paddingHorizontal: 14,
        marginHorizontal: 20,
        marginVertical: 16,
        borderWidth: 1,
        borderColor: colors.border,
        height: 48,
        gap: 10,
    },
    searchInput: {
        flex: 1,
        fontSize: 15,
        color: colors.textPrimary,
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
