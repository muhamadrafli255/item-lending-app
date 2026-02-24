export const colors = {
    // Primary
    primary: '#6C63FF',
    primaryDark: '#5A52D5',
    primaryLight: '#8B85FF',

    // Background
    background: '#0F0F1A',
    surface: '#1A1A2E',
    surfaceLight: '#25253D',
    surfaceHighlight: '#2D2D4A',

    // Text
    textPrimary: '#FFFFFF',
    textSecondary: '#A0A0B8',
    textMuted: '#6B6B80',

    // Status
    pending: '#F59E0B',
    pendingBg: 'rgba(245, 158, 11, 0.15)',
    approved: '#10B981',
    approvedBg: 'rgba(16, 185, 129, 0.15)',
    rejected: '#EF4444',
    rejectedBg: 'rgba(239, 68, 68, 0.15)',
    returned: '#3B82F6',
    returnedBg: 'rgba(59, 130, 246, 0.15)',

    // Misc
    border: '#2A2A40',
    danger: '#EF4444',
    success: '#10B981',
    white: '#FFFFFF',
    black: '#000000',

    // Gradient
    gradientStart: '#6C63FF',
    gradientEnd: '#A855F7',
};

export const statusColors: Record<string, { text: string; bg: string }> = {
    PENDING: { text: colors.pending, bg: colors.pendingBg },
    APPROVED: { text: colors.approved, bg: colors.approvedBg },
    REJECTED: { text: colors.rejected, bg: colors.rejectedBg },
    RETURNED: { text: colors.returned, bg: colors.returnedBg },
};
