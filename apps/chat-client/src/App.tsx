import React from 'react';
import { Header } from '@/components/Header';
import { StatusBar } from '@/components/StatusBar';
import SimpleChat from '@/components/SimpleChat';

const App = () => {
  return (
    <div className="h-screen flex flex-col bg-gray-50">
      <Header />
      <main className="flex-1 flex">
        <div className="flex-1">
          <SimpleChat />
        </div>
      </main>
      <StatusBar />
    </div>
  );
};

export default App;