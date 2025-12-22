import { Layout } from './components/Layout';
import { Boardroom } from './components/Boardroom';

function App() {
  return (
    <Layout>
      <div className="w-full h-full flex flex-col overflow-hidden px-4 lg:px-8">
        {/* Boardroom Area (Contains Personas + Content) */}
        <section className="flex-1 min-h-0 relative">
          <Boardroom />
        </section>
      </div>
    </Layout>
  );
}

export default App;
