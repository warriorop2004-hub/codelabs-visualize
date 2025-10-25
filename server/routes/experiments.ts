import { Router } from 'express';
import { supabase } from '../index';

const router = Router();

router.get('/', async (req, res) => {
  const { data, error } = await supabase
    .from('experiments')
    .select('*');

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  res.json(data);
});

router.get('/slug/:slug', async (req, res) => {
  const { slug } = req.params;

  const { data, error } = await supabase
    .from('experiments')
    .select('*')
    .eq('slug', slug)
    .single();

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  res.json(data);
});

router.post('/:id/submit', async (req, res) => {
  const { id } = req.params;
  const { answers } = req.body;
  const { experimentData } = req.body;
  const userId = (req as any).user.id;

  const { data, error } = await supabase
    .from('submissions')
    .insert([
      {
        experiment_id: id,
        user_id: userId,
        answers,
        experiment_state:experimentData,
        submitted_at: new Date()
      }
    ]);

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  res.json(data);
});

export const experimentsRouter = router;
