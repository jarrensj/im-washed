import ImageUploader from './components/ImageUploader';
import Footer from './components/Footer';

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <main className="flex-1 flex flex-col justify-center py-12 px-4">
        <div className="max-w-4xl mx-auto w-full">
          <ImageUploader />
        </div>
      </main>
      <Footer />
    </div>
  );
}
