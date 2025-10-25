import { Router } from 'express';
import { supabase } from '../index';

const router = Router();

// Get all courses
router.get('/', async (req, res) => {
  const { data, error } = await supabase
    .from('courses')
    .select(`
      *,
      instructor:instructor_id (
        id,
        full_name
      )
    `);

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  res.json(data);
});

router.get('/:id', async (req, res) => {
  const { id } = req.params;

  // Fetch the course (with instructor)
  const { data: course, error: courseError } = await supabase
    .from('courses')
    .select(`
      *,
      instructor:instructor_id (
        id,
        full_name
      )
    `)
    .eq('id', id)
    .single();

  if (courseError) {
    return res.status(500).json({ error: courseError.message });
  }

  // Fetch experiments where experiments.course_id = courses.id
  const { data: experiments, error: expError } = await supabase
    .from('experiments')
    .select(`
      id,
      title,
      description,
      category,
      difficulty
    `)
    .eq('course_id', id);

  if (expError) {
    return res.status(500).json({ error: expError.message });
  }

  res.json({
    ...course,
    experiments: experiments || []
  });
});

router.get('/instructor/:instructorId', async (req, res) => {
  const { instructorId } = req.params;

  const { data, error } = await supabase
    .from('courses')
    .select(`
      *,
      instructor:instructor_id (
        id,
        full_name
      )
    `)
    .eq('instructor_id', instructorId);

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  res.json(data);
});

router.get('/:courseId/experiment/:experimentId/submissions', async (req, res) => {
  const { experimentId } = req.params;

  const { data, error } = await supabase
    .from('submissions')
    .select(`
      *,
      student : user_id (
        id,
        full_name
      )
    `)
    .eq('experiment_id', experimentId)

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  res.json(data);
});

// Get enrolled courses for user
router.get('/enrolled', async (req, res) => {
  const userId = (req as any).user.id;

  const { data, error } = await supabase
    .from('course_enrollments')
    .select(`
      course:courses (
        *,
        instructor:instructor_id (
          id,
          full_name
        )
      )
    `)
    .eq('user_id', userId);

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  res.json(data?.map(d => d.course) || []);
});

// Enroll in a course
router.post('/:id/enroll', async (req, res) => {
  const { id } = req.params;
  const userId = (req as any).user.id;

  const { data, error } = await supabase
    .from('course_enrollments')
    .insert([
      {
        course_id: id,
        user_id: userId,
        enrolled_at: new Date()
      }
    ]);

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  res.json(data);
});

// Get course progress for instructor
router.get('/:id/progress', async (req, res) => {
  const { id } = req.params;
  const userId = (req as any).user.id;

  // Verify instructor
  const { data: course, error: courseError } = await supabase
    .from('courses')
    .select('instructor_id')
    .eq('id', id)
    .single();

  if (courseError || course?.instructor_id !== userId) {
    return res.status(403).json({ error: 'Not authorized' });
  }

  // Get progress data
  const { data, error } = await supabase
    .from('course_enrollments')
    .select(`
      user:users (
        id,
        full_name
      ),
      submissions (
        experiment_id,
        submitted_at,
        grade
      )
    `)
    .eq('course_id', id);

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  res.json(data);
});

// Create a new course (instructor only)
router.post('/', async (req, res) => {
  const userId = (req as any).user.id;
  console.log(userId);
  const { code, name } = req.body;

  // Verify instructor role
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', userId)
    .single();
    
  if (profileError || profile?.role !== 'instructor') {
    return res.status(403).json({ error: 'Not authorized' });
  }

  const { data, error } = await supabase
    .from('courses')
    .insert([
      {
        code,
        name,
        instructor_id: userId
      }
    ]);

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  res.json(data);
});

export const coursesRouter = router;
