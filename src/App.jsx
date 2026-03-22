import useAppStore from './store/useAppStore';
import Navbar from './components/Navbar';
import Login from './components/Login';
import Scanner from './components/Scanner';
import ReceiptDetails from './components/ReceiptDetails';

function App() {
  const { user, currentReceipt, token } = useAppStore();

  if (!token) return <Login />;

  return (
    <div className="min-h-screen bg-gray-50 text-right" dir="rtl">
      <Navbar />
      
      <main className="max-w-4xl mx-auto p-6">
        {!currentReceipt ? (
          <Scanner />
        ) : (
          <ReceiptDetails />
        )}
      </main>
    </div>
  );
}

export default App;