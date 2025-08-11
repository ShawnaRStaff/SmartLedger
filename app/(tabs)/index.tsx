import { View } from 'react-native';
import { Button, Typography, createThemedStyles } from '@/design-system';
import { useAuth } from '@/context/auth/AuthContext';

export default function HomeScreen() {
  const { user, signOut } = useAuth();
  const styles = useStyles();

  const handleLogout = async () => {
    await signOut();
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Typography variant="h2" align="center">
          Welcome to SmartLedger!
        </Typography>
        
        {user && (
          <Typography variant="body1" color="textSecondary" align="center">
            Hello, {user.displayName || user.email}
          </Typography>
        )}
        
        <Typography variant="body2" color="textSecondary" align="center">
          Your financial management dashboard
        </Typography>
      </View>

      <View style={styles.actions}>
        <Button
          variant="outline"
          onPress={handleLogout}
          fullWidth
        >
          Logout
        </Button>
      </View>
    </View>
  );
}

const useStyles = createThemedStyles((theme) => ({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
    padding: theme.spacing.lg,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: theme.spacing.md,
  },
  actions: {
    paddingBottom: theme.spacing.xl,
  },
}));