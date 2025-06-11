import React, { useState } from 'react';
import {
  analyzeEmotionsFacePP,
  getCatBreedFromEmotion,
  getCoupleSummary,
} from '../src/api';
import './index.css';

function App() {
  const [preview, setPreview] = useState(null);
  const [results, setResults] = useState(null); // array of strings
  const [coupleText, setCoupleText] = useState('');
  const [loading, setLoading] = useState(false);

  const handleUpload = async (e) => {
    const file = e.target.files[0];
    setPreview(URL.createObjectURL(file));
    setLoading(true);
    setResults(null);
    setCoupleText('');

    try {
      const emotions = await analyzeEmotionsFacePP(file); // array of up to 2 emotions

      // Map each emotion to breed description in parallel
      const breedResults = await Promise.all(
        emotions.map((emotion) => getCatBreedFromEmotion(emotion))
      );

      setResults(breedResults);

      if (breedResults.length === 2) {
        const summary = await getCoupleSummary(breedResults[0], breedResults[1]);
        setCoupleText(summary);
      }
    } catch (err) {
      console.error(err);
      setResults(['Could not detect faces or fetch results 😿']);
    }
    setLoading(false);
  };

  return (
    <div className="app">
      <h1>🐾 Which JiggleDuo Cats Are You?</h1>
      <p>Upload a couples selfie to get your cat breed matches!</p>

      <input type="file" accept="image/*" onChange={handleUpload} />
      {preview && <img src={preview} alt="preview" className="preview" />}
      {loading && <p>Analyzing your feline vibes...</p>}

      {results && (
        <div className="result">
          {results.map((res, idx) => (
            <div key={idx} className="breed-result">
              <h3>Person {idx + 1}</h3>
              <p>{res}</p>
            </div>
          ))}
          {coupleText && (
            <div className="couple-summary">
              <h3>Couple Summary</h3>
              <p>{coupleText}</p>
            </div>
          )}
          <button
            onClick={() =>
              (window.location.href = 'https://jiggleduo.com/commissions')
            }
          >
            🎨 Commission Your Cat-Selves
          </button>
        </div>
      )}
    </div>
  );
}

export default App;
