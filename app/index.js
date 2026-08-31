/**
 * Index — Landing / routing screen.
 * Redirects to onboarding or dashboard based on storage state.
 */

import { Redirect } from 'expo-router';
import { isOnboardingDone } from '../src/storage/storage';

export default function Index() {
  const done = isOnboardingDone();
  return <Redirect href={done ? '/home' : '/onboarding'} />;
}
