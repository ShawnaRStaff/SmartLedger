import { Link, Stack } from 'expo-router';
import { View } from 'react-native';
import { Typography, Button } from '@/design-system';

export default function NotFoundScreen() {
  return (
    <>
      <Stack.Screen options={{ title: 'Oops!' }} />
      <View className="flex-1 items-center justify-center p-5 bg-gray-50 dark:bg-gray-900">
        <Typography variant="h1" className="mb-4 text-center">
          404
        </Typography>
        <Typography variant="h2" className="mb-2 text-center">
          This screen does not exist.
        </Typography>
        <Typography className="text-center text-gray-600 dark:text-gray-400 mb-8">
          The page you&apos;re looking for could not be found.
        </Typography>
        <Link href="/" asChild>
          <Button variant="primary">Go to home screen</Button>
        </Link>
      </View>
    </>
  );
}
