import ImageUploader from './components/ImageUploader';

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <ImageUploader />
      </div>
    </div>
  );
}
