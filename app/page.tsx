import ImageUploader from './components/ImageUploader';

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            I'm Washed Meme Generator
          </h1>
          <p className="text-lg text-gray-600">
            Upload any image and turn it into an "I'm washed" meme
          </p>
        </div>
        <ImageUploader />
      </div>
    </div>
  );
}
