import { Router } from 'express';
import { container, getUserById } from '../config/container';

const router = Router();

// Update user's contract
router.get('/users/:userId', async (req, res) => {
  try {
    const userId = req.params.userId;

    res.status(200).json(getUserById(userId as string) );
  } catch {
    res.status(500).json({ error: 'Failed to fetch contract' });
  }
});

router.post('/users', async (req, res) => {
  try {
    const userId = req.body.userId;

    container.users.push({ id: userId });
    res.status(200).json({ id: userId });
  } catch {
    res.status(500).json({ error: 'Failed to create user' });
  }
});

export default router;
