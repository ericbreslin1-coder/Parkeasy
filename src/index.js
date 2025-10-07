import config from './config.js';
import { createApp } from './app.js';

const app = createApp();
const PORT = config.port;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
