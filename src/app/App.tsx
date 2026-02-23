import { AppProvider } from './AppProvider';

function App() {
  return (
    <AppProvider>
      {/* Navbar */}
      {/* TaskList */}
      {/* Modals: TaskModal, DeleteTaskDialog, WelcomeModal, SettingsModal */}
      <div className="min-h-screen flex items-center justify-center bg-primary">
        <h1 className="text-4xl font-bold text-white">Gestor ICE</h1>
      </div>
    </AppProvider>
  );
}

export default App;
