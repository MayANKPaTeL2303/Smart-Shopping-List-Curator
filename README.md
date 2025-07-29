# 🛒 Shopping List Curator

**An AI-Powered Multimodal Shopping Assistant**

A sophisticated shopping list curator that uses cutting-edge AI to understand your shopping needs through text, voice, or images, and provides intelligent product recommendations.

## 🌟 Features

- **🎤 Voice Input**: Speak your shopping list naturally
- **📸 Image Recognition**: Upload photos of handwritten lists or receipts
- **🤖 AI-Powered Processing**: Google Gemini AI breaks down complex requests
- **🔍 Smart Recommendations**: Semantic search for the best product matches
- **📱 Modern UI**: Responsive React interface with Tailwind CSS
- **⚡ Real-time Processing**: Fast OCR and recommendation engine

## 🏗️ Architecture

### Backend (`shopping-curator/`)
- **Framework**: Django REST API
- **Database**: MongoDB with vector embeddings
- **AI Models**: 
  - Google Gemini 2.0 Flash for natural language processing
  - SentenceTransformers for semantic similarity
  - Mistral OCR for image text extraction
- **Search**: Cosine similarity matching for product recommendations

### Frontend (`shopping-ui/`)
- **Framework**: React 19 with modern hooks
- **Styling**: Tailwind CSS for responsive design
- **Features**: Voice recognition, image upload, real-time updates

## 🚀 Quick Start

### Prerequisites

- Python 3.8+
- Node.js 16+
- MongoDB
- API Keys for:
  - Google Gemini AI
  - Mistral OCR

### Backend Setup

1. **Clone and navigate to backend**
   ```bash
   cd shopping-curator
   ```

2. **Create virtual environment**
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```

4. **Configure environment variables**
   Create `.env` file in `shopping-curator/`:
   ```env
   GOOGLE_API_KEY=your_google_api_key
   MISTRAL_API_KEY=your_mistral_api_key
   MONGO_URI=mongodb://localhost:27017/
   ```

5. **Run Django migrations**
   ```bash
   python manage.py migrate
   ```

6. **Start the backend server**
   ```bash
   python manage.py runserver
   ```

### Frontend Setup

1. **Navigate to frontend**
   ```bash
   cd shopping-ui
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the React app**
   ```bash
   npm start
   ```

4. **Access the application**
   Open [http://localhost:3000](http://localhost:3000)

## 📋 Usage

### Text Input
1. Type your shopping items in the text area
2. Click "Get Recommendations" to process
3. View categorized product suggestions

### Voice Input
1. Click the microphone button
2. Speak your shopping list naturally
3. The app will transcribe and process your speech

### Image Upload
1. Click "Upload Image" button
2. Select a photo of your handwritten list or receipt
3. OCR will extract text and process items

## 🔧 API Endpoints

### `POST /process/`
Processes shopping list input and returns recommendations.

**Request Body:**
- `items` (string): Text input of shopping items
- `image` (file, optional): Image file for OCR processing

**Response:**
```json
{
  "items": [
    {
      "name": "milk",
      "recommendations": [
        {
          "name": "Great Value Whole Milk",
          "brand": "Great Value",
          "price": 3.48,
          "category": "Dairy"
        }
      ]
    }
  ]
}
```

## 🧠 AI Pipeline

1. **Input Processing**: Text, voice, or image input collection
2. **OCR Extraction**: Mistral OCR converts images to text
3. **AI Breakdown**: Google Gemini processes complex requests into individual items
4. **Embedding Generation**: SentenceTransformers creates vector representations
5. **Similarity Search**: Cosine similarity matching against product database
6. **Recommendation Ranking**: Top 5 products returned per item

## 📁 Project Structure

```
├── shopping-curator/          # Django Backend
│   ├── api/
│   │   ├── views.py           # Main API endpoints
│   │   ├── chain.py           # LangChain AI integration
│   │   └── models.py          # Database models
│   ├── mysite/                # Django configuration
│   ├── mistral_ocr_inference.py  # OCR processing
│   └── manage.py              # Django management
├── shopping-ui/               # React Frontend
│   ├── src/
│   │   ├── App.js             # Main React component
│   │   ├── components/        # Reusable components
│   │   └── index.js           # App entry point
│   └── package.json           # Dependencies
└── requirements.txt           # Python dependencies
```

## 🛠️ Technologies Used

### Backend
- **Django** - Web framework
- **MongoDB** - Document database
- **Google Gemini AI** - Natural language processing
- **Mistral OCR** - Image text extraction
- **SentenceTransformers** - Text embeddings
- **LangChain** - AI orchestration
- **NumPy** - Mathematical operations

### Frontend
- **React 19** - UI framework
- **Tailwind CSS** - Utility-first styling
- **Axios** - HTTP client
- **Web Speech API** - Voice recognition

## 🔒 Security & Best Practices

- Environment variables for API keys
- CORS configuration for secure cross-origin requests
- Input validation and error handling
- Secure file upload handling

## 🚀 Deployment

### Backend Deployment
- Configure production database
- Set environment variables
- Use WSGI server (Gunicorn)
- Set up reverse proxy (Nginx)

### Frontend Deployment
- Build production bundle: `npm run build`
- Deploy to static hosting (Netlify, Vercel)
- Configure API endpoint URLs

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

MIT License - feel free to use and modify as needed.

## 🙏 Acknowledgments

- **Google** for Gemini AI API
- **Mistral AI** for OCR capabilities
- **Hugging Face** for SentenceTransformers
- Open source community for the amazing tools and libraries

---

