import 'dotenv/config';
import app from './app.js';   // since app.js is also root

const PORT = process.env.PORT || 5002;

app.listen(PORT, () => {
  console.log(`OpsMind AI → http://localhost:${PORT}`);
});
