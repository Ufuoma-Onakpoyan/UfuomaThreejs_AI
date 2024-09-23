import express from 'express';
import * as dotenv from 'dotenv';
import cors from 'cors';
import axios from 'axios';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json({ limit: "50mb" }));

// Replace this with the actual Stable Diffusion API endpoint
const STABLE_DIFFUSION_API_URL = 'https://api.stability.ai/v1/generation/stable-diffusion-xl-1024-v1-0/text-to-image';

app.post("/api/v1/stable-diffusion", async (req, res) => {
    try {
        const { prompt } = req.body;

        const response = await axios.post(STABLE_DIFFUSION_API_URL, {
            text_prompts: [{ text: prompt }],
            cfg_scale: 7,
            height: 1024,
            width: 1024,
            steps: 30,
            samples: 1,
        }, {
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'Authorization': `Bearer ${process.env.STABILITY_API_KEY}`,
            },
        });

        // The response structure might vary depending on the specific API you're using
        const image = response.data.artifacts[0].base64;

        res.status(200).json({ photo: image });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Something went wrong" });
    }
});

app.get('/', (req, res) => {
    res.status(200).json({ message: "Hello from Stable Diffusion AI" });
});

app.listen(5500, () => console.log('Server has started on port 5500'));