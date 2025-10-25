import { Router } from 'express';
import { supabase } from '../index';

const router = Router();

// Get user profile
router.get('/profile', async (req, res) => {
  const userId = (req as any).user.id;

  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  res.json(data);
});

// Update user profile
router.put('/profile', async (req, res) => {
  const userId = (req as any).user.id;
  const { full_name, avatar_url } = req.body;

  const { data, error } = await supabase
    .from('profiles')
    .update({ full_name, avatar_url, updated_at: new Date() })
    .eq('id', userId);

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  res.json(data);
});

// Get user progress
router.get('/progress', async (req, res) => {
  const userId = (req as any).user.id;

  const { data, error } = await supabase
    .from('submissions')
    .select(`
      *,
      experiments (
        id,
        title,
        category
      )
    `)
    .eq('user_id', userId);

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  res.json(data);
});

export const userRouter = router;
