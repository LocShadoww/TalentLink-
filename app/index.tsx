import React from 'react';
import { AppProvider } from '../src/context/AppContext';
import AppNavigator from '../src/navigation/AppNavigator';

export default function Index() {
  return (
    <AppProvider>
      <AppNavigator />
    </AppProvider>
  );
}
