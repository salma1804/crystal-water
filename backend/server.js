import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import ordersRouter from './routes/orders.js';
import diagnoseRouter from './routes/diagnose.js';
import remindersRouter from './routes/reminders.js';
import productsRouter from './routes/products.js';
import authRouter from './routes/auth.js';
import uploadRouter from './routes/upload.js';
import contactRouter from './routes/contact.js';
import reviewsRouter from './routes/reviews.js';

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.json({ status: 'Crystal Water API en ligne' });
});

app.use('/api/orders', ordersRouter);
app.use('/api/diagnose', diagnoseRouter);
app.use('/api/reminders', remindersRouter);
app.use('/api/products', productsRouter);
app.use('/api/auth', authRouter);
app.use('/api/upload', uploadRouter);
app.use('/api/contact', contactRouter);
app.use('/api/reviews', reviewsRouter);
app.use('/uploads', express.static('uploads'));

app.listen(PORT, () => {
  console.log(`✅ Crystal Water backend démarré sur http://localhost:${PORT}`);
});