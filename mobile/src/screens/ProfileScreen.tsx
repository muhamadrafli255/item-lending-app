import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    ScrollView,
    Alert,
    ActivityIndicator,
    Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../contexts/AuthContext';
import { updateProfile, getImageUrl } from '../api/client';
import { colors } from '../theme/colors';

export default function ProfileScreen() {
    const { user, logout, refreshUser } = useAuth();

    const [name, setName] = useState(user?.name || '');
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [saving, setSaving] = useState(false);
    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);

    const handleSaveProfile = async () => {
        if (name.trim().length < 2) {
            Alert.alert('Error', 'Nama minimal 2 karakter');
            return;
        }

        setSaving(true);
        try {
            await updateProfile({ name: name.trim() });
            await refreshUser();
            Alert.alert('Berhasil', 'Profil berhasil diperbarui');
        } catch (error: any) {
            Alert.alert('Gagal', error?.response?.data?.message || 'Gagal memperbarui profil');
        } finally {
            setSaving(false);
        }
    };

    const handleChangePassword = async () => {
        if (!currentPassword) {
            Alert.alert('Error', 'Password lama wajib diisi');
            return;
        }
        if (newPassword.length < 6) {
            Alert.alert('Error', 'Password baru minimal 6 karakter');
            return;
        }
        if (newPassword !== confirmPassword) {
            Alert.alert('Error', 'Konfirmasi password tidak cocok');
            return;
        }

        setSaving(true);
        try {
            await updateProfile({ currentPassword, newPassword });
            Alert.alert('Berhasil', 'Password berhasil diubah');
            setCurrentPassword('');
            setNewPassword('');
            setConfirmPassword('');
        } catch (error: any) {
            Alert.alert('Gagal', error?.response?.data?.message || 'Gagal mengubah password');
        } finally {
            setSaving(false);
        }
    };

    const handleLogout = () => {
        Alert.alert('Logout', 'Yakin ingin keluar?', [
            { text: 'Batal', style: 'cancel' },
            {
                text: 'Keluar',
                style: 'destructive',
                onPress: logout,
            },
        ]);
    };

    const getInitials = (name: string) => {
        return name
            .split(' ')
            .map((n) => n[0])
            .join('')
            .toUpperCase()
            .slice(0, 2);
    };

    return (
        <ScrollView
            style={styles.container}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
        >
            {/* Avatar */}
            <View style={styles.avatarSection}>
                {getImageUrl(user?.image) ? (
                    <Image source={{ uri: getImageUrl(user?.image)! }} style={styles.avatarImage} />
                ) : (
                    <View style={styles.avatar}>
                        <Text style={styles.avatarText}>{getInitials(user?.name || 'U')}</Text>
                    </View>
                )}
                <Text style={styles.userName}>{user?.name}</Text>
                <Text style={styles.userEmail}>{user?.email}</Text>
                <View style={styles.roleBadge}>
                    <Ionicons name="person" size={14} color={colors.primary} />
                    <Text style={styles.roleText}>{user?.role}</Text>
                </View>
            </View>

            {/* Edit Name */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Edit Profil</Text>
                <View style={styles.inputContainer}>
                    <Ionicons name="person-outline" size={20} color={colors.textMuted} style={styles.inputIcon} />
                    <TextInput
                        style={styles.input}
                        placeholder="Nama Lengkap"
                        placeholderTextColor={colors.textMuted}
                        value={name}
                        onChangeText={setName}
                        autoCapitalize="words"
                    />
                </View>
                <TouchableOpacity
                    style={[styles.saveButton, saving && styles.buttonDisabled]}
                    onPress={handleSaveProfile}
                    disabled={saving}
                    activeOpacity={0.8}
                >
                    {saving ? (
                        <ActivityIndicator color={colors.white} size="small" />
                    ) : (
                        <Text style={styles.saveButtonText}>Simpan Nama</Text>
                    )}
                </TouchableOpacity>
            </View>

            {/* Change Password */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Ganti Password</Text>

                <View style={styles.inputContainer}>
                    <Ionicons name="lock-closed-outline" size={20} color={colors.textMuted} style={styles.inputIcon} />
                    <TextInput
                        style={styles.input}
                        placeholder="Password Lama"
                        placeholderTextColor={colors.textMuted}
                        value={currentPassword}
                        onChangeText={setCurrentPassword}
                        secureTextEntry={!showCurrentPassword}
                    />
                    <TouchableOpacity onPress={() => setShowCurrentPassword(!showCurrentPassword)}>
                        <Ionicons
                            name={showCurrentPassword ? 'eye-off-outline' : 'eye-outline'}
                            size={20}
                            color={colors.textMuted}
                        />
                    </TouchableOpacity>
                </View>

                <View style={styles.inputContainer}>
                    <Ionicons name="key-outline" size={20} color={colors.textMuted} style={styles.inputIcon} />
                    <TextInput
                        style={styles.input}
                        placeholder="Password Baru (min. 6)"
                        placeholderTextColor={colors.textMuted}
                        value={newPassword}
                        onChangeText={setNewPassword}
                        secureTextEntry={!showNewPassword}
                    />
                    <TouchableOpacity onPress={() => setShowNewPassword(!showNewPassword)}>
                        <Ionicons
                            name={showNewPassword ? 'eye-off-outline' : 'eye-outline'}
                            size={20}
                            color={colors.textMuted}
                        />
                    </TouchableOpacity>
                </View>

                <View style={styles.inputContainer}>
                    <Ionicons name="shield-checkmark-outline" size={20} color={colors.textMuted} style={styles.inputIcon} />
                    <TextInput
                        style={styles.input}
                        placeholder="Konfirmasi Password Baru"
                        placeholderTextColor={colors.textMuted}
                        value={confirmPassword}
                        onChangeText={setConfirmPassword}
                        secureTextEntry={!showNewPassword}
                    />
                </View>

                <TouchableOpacity
                    style={[styles.saveButton, saving && styles.buttonDisabled]}
                    onPress={handleChangePassword}
                    disabled={saving}
                    activeOpacity={0.8}
                >
                    {saving ? (
                        <ActivityIndicator color={colors.white} size="small" />
                    ) : (
                        <Text style={styles.saveButtonText}>Ubah Password</Text>
                    )}
                </TouchableOpacity>
            </View>

            {/* Logout */}
            <TouchableOpacity style={styles.logoutButton} onPress={handleLogout} activeOpacity={0.8}>
                <Ionicons name="log-out-outline" size={20} color={colors.danger} />
                <Text style={styles.logoutText}>Keluar</Text>
            </TouchableOpacity>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    scrollContent: {
        padding: 20,
        paddingBottom: 40,
    },
    avatarSection: {
        alignItems: 'center',
        paddingVertical: 24,
    },
    avatar: {
        width: 90,
        height: 90,
        borderRadius: 45,
        backgroundColor: colors.primary,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
    },
    avatarImage: {
        width: 90,
        height: 90,
        borderRadius: 45,
        marginBottom: 16,
    },
    avatarText: {
        fontSize: 32,
        fontWeight: '800',
        color: colors.white,
    },
    userName: {
        fontSize: 22,
        fontWeight: '700',
        color: colors.textPrimary,
        marginBottom: 4,
    },
    userEmail: {
        fontSize: 15,
        color: colors.textSecondary,
        marginBottom: 12,
    },
    roleBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        backgroundColor: colors.surfaceLight,
        paddingHorizontal: 14,
        paddingVertical: 6,
        borderRadius: 20,
    },
    roleText: {
        fontSize: 13,
        fontWeight: '600',
        color: colors.primary,
    },
    section: {
        backgroundColor: colors.surface,
        borderRadius: 16,
        padding: 20,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: colors.border,
        gap: 12,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: colors.textPrimary,
        marginBottom: 4,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.surfaceLight,
        borderRadius: 12,
        paddingHorizontal: 14,
        borderWidth: 1,
        borderColor: colors.border,
    },
    inputIcon: {
        marginRight: 10,
    },
    input: {
        flex: 1,
        height: 50,
        fontSize: 15,
        color: colors.textPrimary,
    },
    saveButton: {
        backgroundColor: colors.primary,
        height: 48,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 4,
    },
    buttonDisabled: {
        opacity: 0.6,
    },
    saveButtonText: {
        color: colors.white,
        fontSize: 16,
        fontWeight: '600',
    },
    logoutButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        backgroundColor: colors.surface,
        height: 52,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: colors.rejectedBg,
        marginTop: 8,
    },
    logoutText: {
        fontSize: 16,
        fontWeight: '600',
        color: colors.danger,
    },
});
