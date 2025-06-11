import axios from 'axios';

export async function analyzeEmotionsFacePP(imageFile) {
  const url = 'https://api-us.faceplusplus.com/facepp/v3/detect';

  const formData = new FormData();
  formData.append('api_key', process.env.REACT_APP_FACEPP_KEY);
  formData.append('api_secret', process.env.REACT_APP_FACEPP_SECRET);
  formData.append('return_attributes', 'emotion');
  formData.append('image_file', imageFile);

  console.log('imageFile:', imageFile);
console.log('type:', imageFile.type);
 console.log('API KEY:', process.env.REACT_APP_FACEPP_KEY);
console.log('API SECRET:', process.env.REACT_APP_FACEPP_SECRET);

  const response = await axios.post(url, formData);
console.log('Face++ response:', response.data);

  const faces = response.data.faces;
  if (!faces || faces.length === 0) throw new Error('No face detected.');

  // Only keep up to 2 faces
  const faceEmotions = faces.slice(0, 2).map(face => {
    const emotions = face.attributes.emotion;
    const topEmotion = Object.entries(emotions).reduce((a, b) =>
      a[1] > b[1] ? a : b
    )[0];
    return topEmotion;
  });

  return faceEmotions; // array of emotions, e.g. ['happiness', 'neutral']
}

export async function getCatBreedFromEmotion(emotion) {
  const response = await axios.post(
    'https://api.openai.com/v1/chat/completions',
    {
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: 'You are a cat breed personality expert.',
        },
        {
          role: 'user',
          content: `If someone looks ${emotion}, what cat breed matches their personality and why? Keep it short and cute.`,
        },
      ],
      temperature: 0.8,
    },
    {
      headers: {
        Authorization: `Bearer ${process.env.REACT_APP_OPENAI_KEY}`,
        'Content-Type': 'application/json',
      },
    }
  );

  return response.data.choices[0].message.content;
}

// Bonus: Generate a combined couple description
export async function getCoupleSummary(breed1, breed2) {
  const prompt = `Here are two cat breeds for a couple: ${breed1} and ${breed2}. Write a cute and fun short description about their relationship as a couple, mixing their personalities.`;

  const response = await axios.post(
    'https://api.openai.com/v1/chat/completions',
    {
      model: 'gpt-4',
      messages: [
        { role: 'system', content: 'You write cute couple descriptions.' },
        { role: 'user', content: prompt },
      ],
      temperature: 0.9,
    },
    {
      headers: {
        Authorization: `Bearer ${process.env.REACT_APP_OPENAI_KEY}`,
        'Content-Type': 'application/json',
      },
    }
  );

  return response.data.choices[0].message.content;
}
