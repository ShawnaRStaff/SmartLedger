import { Link, Stack } from 'expo-router';
import { View } from 'react-native';
import { Text, Button } from '@/components/ui';

export default function NotFoundScreen() {
  return (
    <>
      <Stack.Screen options={{ title: 'Oops!' }} />
      <View className="flex-1 items-center justify-center p-5 bg-gray-50 dark:bg-gray-900">
        <Text variant="h1" className="mb-4 text-center">
          404
        </Text>
        <Text variant="h2" className="mb-2 text-center">
          This screen does not exist.
        </Text>
        <Text className="text-center text-gray-600 dark:text-gray-400 mb-8">
          The page you're looking for could not be found.
        </Text>
        <Link href="/" asChild>
          <Button variant="primary">
            Go to home screen
          </Button>
        </Link>
      </View>
    </>
  );
}
