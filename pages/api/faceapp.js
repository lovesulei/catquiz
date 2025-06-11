import formidable from 'formidable';
import fs from 'fs';
import axios from 'axios';

export const config = {
  api: {
    bodyParser: false, // Required for formidable to parse multipart/form-data
  },
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const form = new formidable.IncomingForm();

  form.parse(req, async (err, fields, files) => {
    if (err) {
      console.error('Form parse error:', err);
      return res.status(500).json({ error: 'Error parsing form data' });
    }

    const imageFile = files.image_file;
    if (!imageFile) {
      return res.status(400).json({ error: 'No image_file uploaded' });
    }

    try {
      const formData = new FormData();
      formData.append('api_key', process.env.REACT_APP_FACEPP_KEY);
      formData.append('api_secret', process.env.REACT_APP_FACEPP_SECRET);
      formData.append('return_attributes', 'emotion');
      formData.append('image_file', fs.createReadStream(imageFile.filepath));

      const faceppResponse = await axios.post(
        'https://api-us.faceplusplus.com/facepp/v3/detect',
        formData,
        { headers: formData.getHeaders() }
      );

      res.status(200).json(faceppResponse.data);
    } catch (error) {
      console.error('Face++ API error:', error.response?.data || error.message);
      res.status(400).json({ error: 'Face++ request failed' });
    }
  });
}
